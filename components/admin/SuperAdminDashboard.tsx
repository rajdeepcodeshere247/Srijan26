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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Users, CheckCircle2, XCircle, Trash2, Radio, ShieldCheck, Search, Check, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/services/AuthService";
import { EVENTS_DATA } from "@/data/eventsList";
import EditEventDetails from "./EditEventDetails";

// Define local types to avoid dependency on @prisma/client which might not be generated
type Campus = "JADAVPUR" | "SALT_LAKE";
type MerchandiseColor = "BLACK" | "WHITE";

interface SuperAdminDashboardProps {
    user: AuthUser;
}

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
    department: string | null;
    year: string | null;
    role: string;
    emailVerified: Date | null;
    createdAt: Date;
}

interface MerchandiseData {
    id: string;
    size: string | null;
    color: MerchandiseColor | null;
    status: string | null;
    preferredCampus: Campus;
    customText: string | null;
    user: {
        name: string;
        email: string;
        phone: string | null;
        department: string | null;
        year: string | null;
    };
}

interface LiveEvent {
    id: string;
    slug: string;
    name: string;
    round: string;
    location: string;
}

interface EventDB {
    id: string;
    name: string;
    slug: string;
}

interface UserSearch {
    id: string;
    name: string;
    email: string;
    role: string;
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
    const [users, setUsers] = useState<UserData[]>([]);
    const [merchandise, setMerchandise] = useState<MerchandiseData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMerch, setLoadingMerch] = useState(false);

    // Live Events State
    const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
    const [loadingLiveEvents, setLoadingLiveEvents] = useState(false);
    const [newEventSlug, setNewEventSlug] = useState("");
    const [newEventRound, setNewEventRound] = useState("");
    const [manualEventName, setManualEventName] = useState("");
    const [newEventLocation, setNewEventLocation] = useState("");
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    // Filters
    const [yearFilterValue, setYearFilterValue] = useState<string>("");
    const [yearFilterOperator, setYearFilterOperator] = useState<"gt" | "lt">("gt");
    const [merchCampusFilter, setMerchCampusFilter] = useState<string>("all");
    const [merchColorFilter, setMerchColorFilter] = useState<string>("BLACK");

    // Manage Admins State
    const [dbEvents, setDbEvents] = useState<EventDB[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [eventSearchOpen, setEventSearchOpen] = useState(false);
    const [liveEventSearchOpen, setLiveEventSearchOpen] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [searchedUsers, setSearchedUsers] = useState<UserSearch[]>([]);
    const [eventAdmins, setEventAdmins] = useState<UserSearch[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("users");
    const [clearingCache, setClearingCache] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchMerchandise();
        fetchLiveEvents();
        fetchDbEvents();
    }, []);

    async function handleClearCache() {
        if (!confirm("Are you sure you want to clear all Next.js caches? This will affect all live site data until re-fetched.")) return;
        setClearingCache(true);
        try {
            const res = await fetch("/api/superadmin/clear-cache", {
                method: "POST"
            });
            const data = await res.json();
            if (res.ok) {
                alert("Cache cleared successfully!");
            } else {
                alert(data.error || "Failed to clear cache");
            }
        } catch (error) {
            console.error("Failed to clear cache", error);
            alert("Error clearing cache");
        } finally {
            setClearingCache(false);
        }
    }

    useEffect(() => {
        if (selectedEventId) {
            fetchEventAdmins(selectedEventId);
        } else {
            setEventAdmins([]);
        }
    }, [selectedEventId]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (userSearchQuery.length >= 5) {
                searchUsers(userSearchQuery);
            } else {
                setSearchedUsers([]);
            }
        }, 800);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearchQuery]);

    async function fetchUsers() {
        setLoadingUsers(true);
        try {
            const res = await fetch("/api/superadmin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoadingUsers(false);
        }
    }

    async function fetchMerchandise() {
        setLoadingMerch(true);
        try {
            const res = await fetch("/api/superadmin/merchandise");
            if (res.ok) {
                const data = await res.json();
                setMerchandise(data);
            }
        } catch (error) {
            console.error("Failed to fetch merchandise", error);
        } finally {
            setLoadingMerch(false);
        }
    }

    async function fetchLiveEvents() {
        setLoadingLiveEvents(true);
        try {
            const res = await fetch("/api/live-events");
            if (res.ok) {
                const data = await res.json();
                setLiveEvents(data);
            }
        } catch (error) {
            console.error("Failed to fetch live events", error);
        } finally {
            setLoadingLiveEvents(false);
        }
    }

    async function handleLiveEventSubmit() {
        if (!newEventRound || !newEventLocation) return;

        let eventName = "";
        let eventSlug = newEventSlug;

        if (newEventRound === "Workshop") {
            if (!manualEventName) return;
            eventName = manualEventName;
            // Generate a temporary slug for workshops if not already set (e.g. during edit)
            eventSlug = eventSlug || `workshop-${Date.now()}`;
        } else {
            if (!newEventSlug) return;
            const selectedEvent = EVENTS_DATA.find(e => e.slug === newEventSlug);
            if (!selectedEvent) return;
            eventName = selectedEvent.title;
        }

        if (editingEventId) {
            await updateLiveEvent(eventName, eventSlug);
        } else {
            await addLiveEvent(eventName, eventSlug);
        }
    }

    async function addLiveEvent(eventName: string, eventSlug: string) {
        try {
            const res = await fetch("/api/live-events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: eventSlug,
                    name: eventName,
                    round: newEventRound,
                    location: newEventLocation
                })
            });

            if (res.ok) {
                resetLiveEventForm();
                fetchLiveEvents();
            }
        } catch (error) {
            console.error("Failed to add live event", error);
        }
    }

    async function updateLiveEvent(eventName: string, eventSlug: string) {
        if (!editingEventId) return;
        try {
            const res = await fetch("/api/live-events", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingEventId,
                    slug: eventSlug,
                    name: eventName,
                    round: newEventRound,
                    location: newEventLocation
                })
            });

            if (res.ok) {
                resetLiveEventForm();
                fetchLiveEvents();
            }
        } catch (error) {
            console.error("Failed to update live event", error);
        }
    }

    async function deleteLiveEvent(id: string) {
        if (!confirm("Are you sure you want to delete this event?")) return;
        try {
            const res = await fetch(`/api/live-events?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                if (editingEventId === id) resetLiveEventForm();
                fetchLiveEvents();
            }
        } catch (error) {
            console.error("Failed to delete live event", error);
        }
    }

    function startEditing(event: LiveEvent) {
        setEditingEventId(event.id);
        setNewEventSlug(event.slug);
        setNewEventRound(event.round);
        setNewEventLocation(event.location);
        if (event.round === "Workshop") {
            setManualEventName(event.name);
        }
    }

    function resetLiveEventForm() {
        setEditingEventId(null);
        setNewEventSlug("");
        setManualEventName("");
        setNewEventRound("");
        setNewEventLocation("");
    }

    async function fetchDbEvents() {
        setLoadingEvents(true);
        try {
            const res = await fetch("/api/superadmin/admins?action=getEvents");
            if (res.ok) {
                const data = await res.json();
                setDbEvents(data);
            }
        } catch (error) {
            console.error("Failed to fetch db events", error);
        } finally {
            setLoadingEvents(false);
        }
    }

    async function fetchEventAdmins(eventId: string) {
        setLoadingAdmins(true);
        try {
            const res = await fetch(`/api/superadmin/admins?action=getAdmins&eventId=${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setEventAdmins(data);
            }
        } catch (error) {
            console.error("Failed to fetch event admins", error);
        } finally {
            setLoadingAdmins(false);
        }
    }

    async function searchUsers(query: string) {
        setSearchingUsers(true);
        try {
            const res = await fetch(`/api/superadmin/admins?action=searchUsers&query=${query}`);
            if (res.ok) {
                const data = await res.json();
                setSearchedUsers(data);
            }
        } catch (error) {
            console.error("Failed to search users", error);
        } finally {
            setSearchingUsers(false);
        }
    }

    async function handleAddAdmin(targetUserId: string) {
        if (!selectedEventId) return;
        try {
            const res = await fetch("/api/superadmin/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: selectedEventId, userId: targetUserId })
            });

            const data = await res.json();
            if (res.ok) {
                fetchEventAdmins(selectedEventId);
                setSearchedUsers([]);
                setUserSearchQuery("");
                alert("Admin added successfully");
            } else {
                alert(data.error || "Failed to add admin");
            }
        } catch (error) {
            console.error("Failed to add admin", error);
        }
    }

    async function handleRemoveAdmin(targetUserId: string) {
        if (!selectedEventId) return;
        if (!confirm("Are you sure you want to remove this admin?")) return;
        try {
            const res = await fetch(`/api/superadmin/admins?eventId=${selectedEventId}&userId=${targetUserId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchEventAdmins(selectedEventId);
                alert("Admin removed successfully");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to remove admin");
            }
        } catch (error) {
            console.error("Failed to remove admin", error);
        }
    }

    const filteredMerchandise = merchandise.filter((item) => {
        // Year Filter
        if (yearFilterValue) {
            const itemYear = parseInt(item.user.year || "0");
            const filterYear = parseInt(yearFilterValue);

            if (!isNaN(itemYear) && !isNaN(filterYear)) {
                if (yearFilterOperator === "gt" && itemYear <= filterYear) return false;
                if (yearFilterOperator === "lt" && itemYear >= filterYear) return false;
            }
        }

        // Campus Filter
        if (merchCampusFilter !== "all" && item.preferredCampus !== merchCampusFilter) {
            return false;
        }

        // Color Filter
        if (merchColorFilter !== "all" && item.color !== merchColorFilter) {
            return false;
        }

        return true;
    });

    const exportUsers = () => {
        if (!users.length) return;
        const headers = ["Name", "Email", "Phone", "College", "Department", "Year", "Role"];
        const rows = users.map(u => [
            u.name,
            u.email,
            u.phone || "",
            u.college || "",
            u.department || "",
            u.year || "",
            u.role
        ]);

        downloadCSV(headers, rows, "all-users.csv");
    };

    const exportMerchandise = () => {
        if (!filteredMerchandise.length) return;
        const headers = ["Order ID", "User Name", "Email", "Phone", "Department", "Year", "Size", "Color", "Campus", "Custom Text", "Status"];
        const rows = filteredMerchandise.map(m => [
            m.id,
            m.user.name,
            m.user.email,
            m.user.phone || "",
            m.user.department || "",
            m.user.year || "",
            m.size || "",
            m.color || "",
            m.preferredCampus,
            m.customText || "",
            m.status || ""
        ]);

        downloadCSV(headers, rows, "merchandise-orders.csv");
    };

    const downloadCSV = (headers: string[], rows: (string)[][], filename: string) => {
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => {
                const value = String(cell).replace(/"/g, '""');
                return `"${value}"`;
            }).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
            <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                                <Users className="h-5 w-5" />
                            </div>
                            <h1 className="text-xl font-semibold text-slate-900">SuperAdmin Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearCache}
                                disabled={clearingCache}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                                {clearingCache ? "Clearing..." : "Clear Caches"}
                            </Button>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm text-slate-600">{user.email}</p>
                            </div>
                            <Badge className="bg-slate-900 text-white border-slate-900">SUPERADMIN</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!isMounted ? null : (
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-slate-100 p-1 rounded-lg">
                            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Users</TabsTrigger>
                            <TabsTrigger value="merchandise" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Merchandise</TabsTrigger>
                            <TabsTrigger value="live-events" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Live Events</TabsTrigger>
                            <TabsTrigger value="manage-admins" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Manage Admins</TabsTrigger>
                        </TabsList>

                        <TabsContent value="users" className="space-y-4">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>All Users</CardTitle>
                                        <CardDescription>Total registered users: {users.length}</CardDescription>
                                    </div>
                                    <Button onClick={exportUsers} className="bg-slate-900 hover:bg-slate-800 text-white">
                                        <Download className="mr-2 h-4 w-4" /> Export CSV
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {loadingUsers ? (
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
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Phone</TableHead>
                                                        <TableHead>College</TableHead>
                                                        <TableHead>Dept</TableHead>
                                                        <TableHead>Year</TableHead>
                                                        <TableHead>Verified</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {users.map((u) => (
                                                        <TableRow key={u.id}>
                                                            <TableCell className="font-medium">{u.name}</TableCell>
                                                            <TableCell>{u.email}</TableCell>
                                                            <TableCell>{u.phone || "-"}</TableCell>
                                                            <TableCell>{u.college || "-"}</TableCell>
                                                            <TableCell>{u.department || "-"}</TableCell>
                                                            <TableCell>{u.year || "-"}</TableCell>
                                                            <TableCell>
                                                                {u.emailVerified ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-amber-500" />
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="merchandise" className="space-y-4">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle>Merchandise Orders</CardTitle>
                                            <CardDescription>Total orders: {merchandise.length} | Showing: {filteredMerchandise.length}</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button onClick={exportMerchandise} className="bg-slate-900 hover:bg-slate-800 text-white">
                                                <Download className="mr-2 h-4 w-4" /> Export CSV
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Filters */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                        <div className="flex gap-2 col-span-2">
                                            <Select value={yearFilterOperator} onValueChange={(v: "gt" | "lt") => setYearFilterOperator(v)}>
                                                <SelectTrigger className="w-[140px] bg-white text-slate-900 border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-slate-200 text-slate-900">
                                                    <SelectItem value="gt" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Greater Than</SelectItem>
                                                    <SelectItem value="lt" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Less Than</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="Year (e.g. 2026)"
                                                value={yearFilterValue}
                                                onChange={(e) => setYearFilterValue(e.target.value)}
                                                className="flex-1 bg-white text-slate-900 border-slate-200 placeholder:text-slate-400"
                                            />
                                        </div>

                                        <Select value={merchCampusFilter} onValueChange={setMerchCampusFilter}>
                                            <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                                                <SelectValue placeholder="Filter by Campus" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 text-slate-900">
                                                <SelectItem value="all" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">All Campuses</SelectItem>
                                                <SelectItem value="JADAVPUR" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Jadavpur</SelectItem>
                                                <SelectItem value="SALT_LAKE" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Salt Lake</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={merchColorFilter} onValueChange={setMerchColorFilter}>
                                            <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                                                <SelectValue placeholder="Filter by Color" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 text-slate-900">
                                                <SelectItem value="all" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">All Colors</SelectItem>
                                                <SelectItem value="BLACK" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Black</SelectItem>
                                                <SelectItem value="WHITE" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">White</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                                        <TableHead>Dept / Year</TableHead>
                                                        <TableHead>Size</TableHead>
                                                        <TableHead>Color</TableHead>
                                                        <TableHead>Campus</TableHead>
                                                        <TableHead>Custom Text</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredMerchandise.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                                                                No orders found matching filters.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredMerchandise.map((m) => (
                                                            <TableRow key={m.id}>
                                                                <TableCell className="font-mono text-xs">{m.id.slice(-6)}</TableCell>
                                                                <TableCell className="font-medium">{m.user.name}</TableCell>
                                                                <TableCell>{m.user.email}</TableCell>
                                                                <TableCell>{m.user.phone || "-"}</TableCell>
                                                                <TableCell>{m.user.department || "-"} / {m.user.year || "-"}</TableCell>
                                                                <TableCell>{m.size || "-"}</TableCell>
                                                                <TableCell>
                                                                    {m.color === "BLACK" && <Badge className="bg-black text-white hover:bg-black">Black</Badge>}
                                                                    {m.color === "WHITE" && <Badge className="bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-100">White</Badge>}
                                                                </TableCell>
                                                                <TableCell>{m.preferredCampus}</TableCell>
                                                                <TableCell className="italic text-slate-600">{m.customText || "-"}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="live-events" className="space-y-4">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Manage Live Events</CardTitle>
                                        <CardDescription>Events added here will be displayed on the homepage ticker.</CardDescription>
                                    </div>
                                    {activeTab === "live-events" && (
                                        <div className="flex items-center gap-2">
                                            <EditEventDetails slug={newEventSlug || liveEvents[0]?.slug} label="Create Event" />
                                            <EditEventDetails slug={newEventSlug || liveEvents[0]?.slug} />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Select Event</label>
                                            {newEventRound === "Workshop" ? (
                                                <Input
                                                    placeholder="Enter Workshop Name"
                                                    value={manualEventName}
                                                    onChange={(e) => setManualEventName(e.target.value)}
                                                    className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400"
                                                />
                                            ) : (
                                                <Popover open={liveEventSearchOpen} onOpenChange={setLiveEventSearchOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className="w-full justify-between bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                                                        >
                                                            {newEventSlug
                                                                ? EVENTS_DATA.find((e) => e.slug === newEventSlug)?.title
                                                                : "Choose Event..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0 bg-white border-slate-200">
                                                        <Command className="bg-white">
                                                            <CommandInput placeholder="Search event..." className="border-none focus:ring-0" />
                                                            <CommandList>
                                                                <CommandEmpty>No event found.</CommandEmpty>
                                                                <CommandGroup className="max-h-60 overflow-y-auto">
                                                                    {EVENTS_DATA.map((e) => {
                                                                        const slug = e.slug;
                                                                        return (
                                                                            <CommandItem
                                                                                key={slug}
                                                                                value={`${e.title} ${slug}`}
                                                                                onSelect={() => {
                                                                                    setNewEventSlug(slug);
                                                                                    setLiveEventSearchOpen(false);
                                                                                }}
                                                                                className="text-slate-900 hover:bg-slate-100 cursor-pointer"
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        newEventSlug === slug ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {e.title}
                                                                            </CommandItem>
                                                                        );
                                                                    })}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Round</label>
                                            <Select value={newEventRound} onValueChange={setNewEventRound}>
                                                <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                                                    <SelectValue placeholder="Round/Stage" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-slate-200 text-slate-900">
                                                    <SelectItem value="Prelims" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Prelims</SelectItem>
                                                    <SelectItem value="Finals" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Finals</SelectItem>
                                                    <SelectItem value="Workshop" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Workshop</SelectItem>
                                                    <SelectItem value="Medal Ceremony" className="text-slate-900 focus:bg-slate-100 focus:text-slate-900">Medal Ceremony</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Location</label>
                                            <Input
                                                placeholder="e.g. Exam Hall"
                                                value={newEventLocation}
                                                onChange={(e) => setNewEventLocation(e.target.value)}
                                                className="bg-white text-slate-900 border-slate-200 placeholder:text-slate-400"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleLiveEventSubmit}
                                            disabled={(!newEventSlug && newEventRound !== "Workshop") || (newEventRound === "Workshop" && !manualEventName) || !newEventRound || !newEventLocation}
                                            className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]"
                                        >
                                            <Radio className="mr-2 h-4 w-4" />
                                            {editingEventId ? "Update Event" : "Set Live"}
                                        </Button>
                                        {editingEventId && (
                                            <Button
                                                variant="outline"
                                                onClick={resetLiveEventForm}
                                                className="min-w-[80px] bg-white text-slate-900 border-slate-200 hover:bg-slate-100"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>

                                    <div className="rounded-md border border-slate-200 overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead>Event Name</TableHead>
                                                    <TableHead>Round</TableHead>
                                                    <TableHead>Location</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {loadingLiveEvents ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                                                    </TableRow>
                                                ) : liveEvents.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                                            No live events currently active.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    liveEvents.map((event) => (
                                                        <TableRow key={event.id}>
                                                            <TableCell className="font-medium text-slate-900">{event.name}</TableCell>
                                                            <TableCell>{event.round}</TableCell>
                                                            <TableCell>{event.location}</TableCell>
                                                            <TableCell className="text-right flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => startEditing(event)}
                                                                    className="h-8 bg-white text-slate-900 border-slate-200 hover:bg-slate-100"
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => deleteLiveEvent(event.id)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="manage-admins" className="space-y-4">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Manage Event Admins</CardTitle>
                                    <CardDescription>Assign or remove admins for specific events. Max 3 admins per event.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Left Side: Select Event and Search User */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Select Event</label>
                                                <Popover open={eventSearchOpen} onOpenChange={setEventSearchOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={eventSearchOpen}
                                                            className="w-full justify-between bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                                                        >
                                                            {selectedEventId
                                                                ? dbEvents.find((event) => event.id === selectedEventId)?.name
                                                                : "Select event..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0 bg-white border-slate-200">
                                                        <Command className="bg-white">
                                                            <CommandInput placeholder="Search event..." className="border-none focus:ring-0" />
                                                            <CommandList>
                                                                <CommandEmpty>No event found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {dbEvents.map((event) => (
                                                                        <CommandItem
                                                                            key={event.id}
                                                                            value={`${event.name} ${event.slug}`}
                                                                            onSelect={() => {
                                                                                setSelectedEventId(event.id);
                                                                                setEventSearchOpen(false);
                                                                            }}
                                                                            className="text-slate-900 hover:bg-slate-100 cursor-pointer"
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    selectedEventId === event.id ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {event.name}
                                                                            <span className="ml-2 text-xs text-slate-400">({event.slug})</span>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            {selectedEventId && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Search User (by email)</label>
                                                    <div className="relative">
                                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            placeholder="Type at least 3 characters..."
                                                            className="pl-9 bg-white text-slate-900 border-slate-200"
                                                            value={userSearchQuery}
                                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                                        />
                                                    </div>
                                                    {searchingUsers && <p className="text-xs text-slate-400">Searching...</p>}
                                                    {searchedUsers.length > 0 && (
                                                        <div className="mt-2 border border-slate-200 rounded-md bg-white divide-y divide-slate-100 overflow-hidden shadow-sm">
                                                            {searchedUsers.map((u) => (
                                                                <div key={u.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-900">{u.name}</p>
                                                                        <p className="text-xs text-slate-500">{u.email}</p>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-slate-900 text-white hover:bg-slate-800 h-8"
                                                                        onClick={() => handleAddAdmin(u.id)}
                                                                        disabled={eventAdmins.some(ea => ea.id === u.id) || eventAdmins.length >= 3}
                                                                    >
                                                                        {eventAdmins.some(ea => ea.id === u.id) ? "Already Admin" : "Add Admin"}
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: Current Admins */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2">
                                                <ShieldCheck className="h-5 w-5 text-slate-900" />
                                                <h3 className="font-semibold text-slate-900">
                                                    Current Admins {selectedEventId && `(${eventAdmins.length}/3)`}
                                                </h3>
                                            </div>
                                            <div className="rounded-md border border-slate-200 min-h-[200px] bg-slate-50/50">
                                                {!selectedEventId ? (
                                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm p-4 text-center">
                                                        Please select an event to view and manage admins.
                                                    </div>
                                                ) : loadingAdmins ? (
                                                    <div className="p-4 space-y-3">
                                                        <Skeleton className="h-12 w-full" />
                                                        <Skeleton className="h-12 w-full" />
                                                    </div>
                                                ) : eventAdmins.length === 0 ? (
                                                    <div className="h-full flex items-center justify-center text-slate-400 text-sm p-4 text-center italic">
                                                        No admins assigned to this event yet.
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-100 bg-white">
                                                        {eventAdmins.map((admin) => (
                                                            <div key={admin.id} className="p-4 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                                                                        {admin.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-slate-900">{admin.name}</p>
                                                                        <p className="text-xs text-slate-500">{admin.email}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleRemoveAdmin(admin.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
