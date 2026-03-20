"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import type { AuthUser } from "@/services/AuthService";

type Campus = "JADAVPUR" | "SALT_LAKE";
type MerchandiseColor = "BLACK" | "WHITE";

interface MerchandiseData {
    id: string;
    size: string | null;
    color: MerchandiseColor | null;
    status: string | null;
    preferredCampus: Campus;
    customText: string | null;
    createdAt: string;
    user: {
        name: string;
        email: string;
        phone: string | null;
        department: string | null;
        year: string | null;
    };
}

interface PendingOrdersDashboardProps {
    user: AuthUser;
}

export function PendingOrdersDashboard({ user }: PendingOrdersDashboardProps) {
    const [merchandise, setMerchandise] = useState<MerchandiseData[]>([]);
    const [loadingMerch, setLoadingMerch] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredMerchandise = merchandise.filter(m => {
        if (!debouncedSearch) return true;
        const s = debouncedSearch.toLowerCase();
        return (
            m.user.name.toLowerCase().includes(s) ||
            m.user.email.toLowerCase().includes(s) ||
            (m.user.phone && m.user.phone.toLowerCase().includes(s))
        );
    });

    useEffect(() => {
        fetchMerchandise();
    }, []);

    async function fetchMerchandise() {
        setLoadingMerch(true);
        try {
            const res = await fetch("/api/superadmin/merchandise/pending");
            if (res.ok) {
                const data: MerchandiseData[] = await res.json();
                setMerchandise(data);
            }
        } catch (error) {
            console.error("Failed to fetch merchandise", error);
        } finally {
            setLoadingMerch(false);
        }
    }

    async function updateStatus(id: string, newStatus: string) {
        if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;

        setUpdatingId(id);
        try {
            const res = await fetch("/api/superadmin/merchandise/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ merchandiseId: id, status: newStatus }),
            });

            if (res.ok) {
                // Remove from the pending list
                setMerchandise((prev) => prev.filter((item) => item.id !== id));
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status", error);
            alert("Error updating status");
        } finally {
            setUpdatingId(null);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
            <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                                <Clock className="h-5 w-5" />
                            </div>
                            <h1 className="text-xl font-semibold text-slate-900">Pending Merchandise Orders</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm text-slate-600">{user.email}</p>
                            </div>
                            <Badge className="bg-slate-900 text-white border-slate-900">SUPERADMIN</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <CardTitle>Needs Manual Intervention</CardTitle>
                            <CardDescription>
                                Review the payments below that might be successful on Cashfree but failed to update automatically on our end.
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:w-72 mt-2 md:mt-0">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                type="search"
                                placeholder="Search name, email, phone..."
                                className="pl-9 bg-white border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingMerch ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : (
                            <div className="rounded-md border border-slate-200 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Size / Color</TableHead>
                                            <TableHead>Campus</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMerchandise.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                                                    No pending orders found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMerchandise.map((m) => (
                                                <TableRow key={m.id}>
                                                    <TableCell className="font-mono text-xs">{m.id.slice(-6)}</TableCell>
                                                    <TableCell className="font-medium">{m.user.name}</TableCell>
                                                    <TableCell>{m.user.email}</TableCell>
                                                    <TableCell>{m.user.phone || "-"}</TableCell>
                                                    <TableCell>
                                                        {m.size || "-"} /{" "}
                                                        {m.color === "BLACK" ? (
                                                            <Badge className="bg-black text-white hover:bg-black">Black</Badge>
                                                        ) : m.color === "WHITE" ? (
                                                            <Badge className="bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-100">White</Badge>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{m.preferredCampus}</TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                                                        {new Date(m.createdAt).toLocaleString("en-IN", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
                                                            Pending
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={() => updateStatus(m.id, "completed")}
                                                            disabled={updatingId === m.id}
                                                        >
                                                            <CheckCircle2 className="mr-1 h-4 w-4" />
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => updateStatus(m.id, "failed")}
                                                            disabled={updatingId === m.id}
                                                        >
                                                            <XCircle className="mr-1 h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
