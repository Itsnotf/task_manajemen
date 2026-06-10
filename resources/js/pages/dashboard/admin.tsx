import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Role, type User, type TaskActivity } from '@/types';
import { Head } from '@inertiajs/react';
import { ShieldCheck, Users, KeyRound, Briefcase, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
    total_users: number;
    total_roles: number;
    total_permissions: number;
    total_tasks: number;
    overdue_tasks: number;
    pending_handovers: number;
    task_status_counts: Record<string, number>;
    recent_users: User[];
    recent_activities: TaskActivity[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function AdminDashboard({
    total_users, total_roles, total_permissions,
    total_tasks, overdue_tasks, pending_handovers,
    task_status_counts, recent_users, recent_activities,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">

                {/* Row 1: User & Role stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard icon={<Users className="size-5" />}       label="Total Users"       value={total_users} />
                    <StatCard icon={<ShieldCheck className="size-5" />} label="Total Roles"       value={total_roles} />
                    <StatCard icon={<KeyRound className="size-5" />}    label="Total Permissions" value={total_permissions} />
                </div>

                {/* Row 2: Task stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard icon={<Briefcase className="size-5" />}       label="Total Tasks"       value={total_tasks} />
                    <StatCard icon={<AlertCircle className="size-5" />}     label="Overdue Tasks"     value={overdue_tasks}     variant="danger" />
                    <StatCard icon={<ArrowLeftRight className="size-5" />}  label="Pending Handovers" value={pending_handovers}  variant="warning" />
                </div>

                {/* Task Status Distribution */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold">Distribusi Status Task</h2>
                    </div>
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { key: 'open',        label: 'Open',        dot: 'bg-gray-400' },
                            { key: 'in_progress', label: 'In Progress', dot: 'bg-blue-500' },
                            { key: 'review',      label: 'Review',      dot: 'bg-purple-500' },
                            { key: 'done',        label: 'Done',        dot: 'bg-green-500' },
                        ].map(({ key, label, dot }) => (
                            <div key={key} className="rounded-lg bg-muted p-3 text-center">
                                <div className={`size-2 rounded-full ${dot} mx-auto mb-2`} />
                                <p className="text-2xl font-semibold">{task_status_counts[key] ?? 0}</p>
                                <p className="text-xs text-muted-foreground capitalize mt-1">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Users */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold">Recent Users</h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recent_users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No users yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recent_users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {Array.isArray(user.roles) && (user.roles as Role[]).map((role, i) => (
                                                <Badge key={i} className="mr-1">{role.name}</Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Recent System Activity */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold">Aktivitas Sistem Terkini</h2>
                    </div>
                    <div className="divide-y divide-sidebar-border/50">
                        {recent_activities.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-6">Belum ada aktivitas.</p>
                        ) : (
                            recent_activities.map((activity) => (
                                <div key={activity.id} className="px-4 py-3 flex items-start gap-3">
                                    <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                                        {(activity.user?.name ?? '?').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {new Date(activity.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

function StatCard({
    icon, label, value, variant = 'default',
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    variant?: 'default' | 'danger' | 'warning';
}) {
    const valueClass =
        variant === 'danger'  ? 'text-destructive' :
        variant === 'warning' ? 'text-amber-600 dark:text-amber-400' :
        '';

    return (
        <div className="flex items-center gap-4 rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-semibold ${valueClass}`}>{value}</p>
            </div>
        </div>
    );
}
