import { checkAdminAuthorization } from "@/services/AuthService";
import { PendingOrdersDashboard } from "@/components/admin/PendingOrdersDashboard";
import { redirect } from "next/navigation";

export default async function PendingOrdersPage() {
    const user = await checkAdminAuthorization();

    if (!user || user.role !== "SUPERADMIN") {
        redirect("/not-found");
    }

    return <PendingOrdersDashboard user={user} />;
}
