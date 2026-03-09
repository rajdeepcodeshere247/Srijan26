import { prisma } from '@/prisma/client';
import { MerchandiseSize, MerchandiseColor, Campus, PaymentStatus } from "@prisma/client";
// import { notificationService } from '@/lib/services/notifications'; // I'll check if this exists later or mock it

interface CashfreePayment {
    payment_status: string;
    cf_payment_id: string;
    payment_amount?: number;
    payment_currency?: string;
    payment_time?: string;
    payment_completion_time?: string;
    payment_method?: string;
}

interface ErrorWithResponse {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

const isErrorWithResponse = (error: unknown): error is ErrorWithResponse => {
    return typeof error === 'object' && error !== null && 'response' in error;
};

const isErrorWithMessage = (error: unknown): error is { message: string } => {
    return typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string';
};

let cashfreeConfig: {
    clientId: string;
    clientSecret: string;
    environment: string;
} | null = null;

try {
    const clientId = process.env.CASHFREE_APP_ID;
    const clientSecret = process.env.CASHFREE_SECRET_KEY;
    const environment = process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION';

    if (!clientId || !clientSecret) {
        throw new Error('Missing Cashfree credentials');
    }

    cashfreeConfig = {
        clientId,
        clientSecret,
        environment
    };

    console.log('✅ Cashfree config created successfully');
} catch (error) {
    console.error('❌ Failed to initialize Cashfree config:', error);
    cashfreeConfig = null;
}

export async function createMerchandiseOrder(paymentData: {
    amount: number;
    currency: string;
    merchandise: 'SHIRT';
    size: string;
    color: string;
    campus: string;
    customText?: string;
    userId: string;
}) {
    try {
        if (!cashfreeConfig) {
            return { error: 'Payment service not available' };
        }

        const { amount, currency, size, color, campus, customText, userId } = paymentData;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return { error: 'User not found' };
        }

        // Generate unique order ID
        const orderId = `order_${Date.now()}_SHIRT_${userId.slice(-4)}`;

        // Create Cashfree order request
        const request = {
            order_amount: amount,
            order_currency: currency || 'INR',
            order_id: orderId,
            customer_details: {
                customer_id: userId,
                customer_phone: user.phone || "9999999999",
                customer_name: user.name || "Customer",
                customer_email: user.email || "customer@example.com"
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/merchandise?order_id={order_id}`,
                notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cashfree-webhook`
            },
            order_note: `SHIRT - Size: ${size}, Color: ${color}, Campus: ${campus}`
        };

        const apiUrl = cashfreeConfig.environment === 'PRODUCTION'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-client-id': cashfreeConfig.clientId,
                'x-client-secret': cashfreeConfig.clientSecret,
                'x-api-version': '2023-08-01'
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (!result || !result.order_id || !result.payment_session_id) {
            return { error: 'Failed to create order with payment gateway: Invalid response from provider' };
        }

        // Store order in database using existing Merchandise model
        await prisma.merchandise.create({
            data: {
                orderId: result.order_id,
                amount: amount,
                currency: result.order_currency || 'INR',
                size: size as MerchandiseSize,
                color: color as MerchandiseColor,
                preferredCampus: campus as Campus,
                customText: customText || null,
                status: 'pending' as PaymentStatus,
                userId: userId,
                paymentId: result.payment_session_id,
            },
        });

        return {
            success: true,
            data: {
                orderId: result.order_id,
                paymentSessionId: result.payment_session_id,
                amount: amount
            }
        };
    } catch (error: unknown) {
        console.error('💥 Error creating order:', error);
        let errorMessage = 'Failed to create order';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        return { error: errorMessage };
    }
}

export async function verifyMerchandisePayment(verificationData: {
    order_id: string;
    userId: string;
}) {
    try {
        if (!cashfreeConfig) {
            return { error: 'Payment service not available' };
        }

        const { order_id, userId } = verificationData;

        const apiUrl = cashfreeConfig.environment === 'PRODUCTION'
            ? `https://api.cashfree.com/pg/orders/${order_id}/payments`
            : `https://sandbox.cashfree.com/pg/orders/${order_id}/payments`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-client-id': cashfreeConfig.clientId,
                'x-client-secret': cashfreeConfig.clientSecret,
                'x-api-version': '2023-08-01'
            }
        });

        if (!response.ok) {
            return { error: 'Failed to fetch payment details' };
        }

        const result = await response.json();
        const payments: CashfreePayment[] = result;

        if (!payments || payments.length === 0) {
            return { error: 'No payments found for this order' };
        }

        const successfulPayment = payments.find((payment: CashfreePayment) =>
            payment.payment_status === "SUCCESS"
        );

        if (successfulPayment) {
            // Check if order exists before updating
            const order = await prisma.merchandise.findUnique({
                where: { orderId: order_id }
            });

            if (!order) {
                return { error: 'Order record not found in database' };
            }

            if (order.userId !== userId) {
                return { error: 'Unauthorized: Order does not belong to this user' };
            }

            await prisma.merchandise.update({
                where: { orderId: order_id },
                data: {
                    status: 'completed' as PaymentStatus,
                    paymentId: successfulPayment.cf_payment_id,
                },
            });

            return { success: true, message: 'Payment verified successfully' };
        } else {
            const pendingPayment = payments.find((payment: CashfreePayment) =>
                payment.payment_status === "PENDING"
            );

            if (pendingPayment) {
                return { error: 'Payment is still pending. Please wait for confirmation.' };
            }

            // Mark as failed if order exists
            const order = await prisma.merchandise.findUnique({
                where: { orderId: order_id }
            });

            if (order) {
                await prisma.merchandise.update({
                    where: { orderId: order_id },
                    data: { status: 'failed' as PaymentStatus },
                });
            }

            return { error: 'Payment not successful' };
        }
    } catch (error: unknown) {
        console.error('Error verifying payment:', error);
        let errorMessage = 'Internal server error while verifying payment';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        return { error: errorMessage };
    }
}

export async function checkOrderStatus(orderId: string, userId: string) {
    try {
        if (!cashfreeConfig) {
            return { error: 'Payment service not available' };
        }

        const order = await prisma.merchandise.findUnique({
            where: {
                orderId: orderId,
            }
        });

        if (!order || order.userId !== userId) {
            return { error: 'Order not found or unauthorized' };
        }

        if (order.status === 'completed') {
            return { success: true, status: 'completed', message: 'Order is confirmed and paid' };
        }

        const apiUrl = cashfreeConfig.environment === 'PRODUCTION'
            ? `https://api.cashfree.com/pg/orders/${orderId}/payments`
            : `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-client-id': cashfreeConfig.clientId,
                'x-client-secret': cashfreeConfig.clientSecret,
                'x-api-version': '2023-08-01'
            }
        });

        if (!response.ok) {
            return { success: true, status: order.status, message: 'Unable to fetch latest status' };
        }

        const payments: CashfreePayment[] = await response.json();

        if (!payments || payments.length === 0) {
            return { success: true, status: order.status, message: 'No payments found' };
        }

        const latestPayment = payments[0];

        return {
            success: true,
            status: latestPayment.payment_status.toLowerCase(),
            message: `Payment status: ${latestPayment.payment_status}`
        };

    } catch (error: unknown) {
        console.error('Error checking order status:', error);
        let errorMessage = 'Failed to check order status';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        return { error: errorMessage };
    }
}
