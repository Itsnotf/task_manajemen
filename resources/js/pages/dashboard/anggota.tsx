import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Task, type TaskHandover, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, KeyRound, ShieldCheck, ListTodo, Lock, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
    roles: string[];
    permissions: string[];
    member_since: string;
    my_tasks: number;
    open_pool_tasks: number;
    overdue_tasks: number;
    task_by_status: Record<string, number>;
    upcoming_deadlines: Task[];
    incoming_handovers: TaskHandover[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

function StatCard({
    icon, label, value, variant = 'default',
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    variant?: 'default' | 'danger';
}) {
    return (
        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold ${variant === 'danger' ? 'text-destructive' : ''}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

export default function AnggotaDashboard({
    roles, permissions, member_since,
    my_tasks, open_pool_tasks, overdue_tasks,
    task_by_status, upcoming_deadlines, incoming_handovers,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">

                {/* Welcome */}
                <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                    <p className="text-muted-foreground text-sm">Welcome back,</p>
                    <h1 className="text-xl font-semibold">{auth.user.name}</h1>
                    <p className="text-muted-foreground text-sm">{auth.user.email}</p>
                </div>

                {/* Incoming Handover Alert */}
                {incoming_handovers.length > 0 && (
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                        <div className="border-b border-amber-200 dark:border-amber-800 px-4 py-3 flex items-center gap-2">
                            <ArrowLeftRight className="size-4 text-amber-600" />
                            <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                Permintaan Handover Masuk ({incoming_handovers.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-amber-100 dark:divide-amber-900">
                            {incoming_handovers.map((handover) => (
                                <div key={handover.id} className="px-4 py-3">
                                    <p className="text-sm font-medium">{(handover.task as Task | undefined)?.title ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Dari: {(handover as any).from_user?.name ?? '—'}
                                    </p>
                                    <div className="mt-2">
                                        <Link href="/handovers">
                                            <Button size="sm" variant="outline" className="text-xs h-7">
                                                Lihat Detail
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Task Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard icon={<ListTodo className="size-5" />}    label="Tugas Aktif"  value={my_tasks} />
                    <StatCard icon={<Lock className="size-5" />}        label="Open Pool"    value={open_pool_tasks} />
                    <StatCard
                        icon={<AlertCircle className={`size-5 ${overdue_tasks > 0 ? 'text-destructive' : ''}`} />}
                        label="Overdue"
                        value={overdue_tasks}
                        variant={overdue_tasks > 0 ? 'danger' : 'default'}
                    />
                </div>

                {/* Task by Status */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
                    <h2 className="text-sm font-semibold mb-3">Progres Tugas Saya</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { key: 'open',        label: 'Open',        dot: 'bg-gray-400' },
                            { key: 'in_progress', label: 'In Progress', dot: 'bg-blue-500' },
                            { key: 'review',      label: 'Review',      dot: 'bg-purple-500' },
                            { key: 'done',        label: 'Done',        dot: 'bg-green-500' },
                        ].map(({ key, label, dot }) => (
                            <div key={key} className="rounded-lg bg-muted p-3">
                                <div className={`size-2 rounded-full ${dot} mb-2`} />
                                <p className="text-xl font-semibold">{task_by_status[key] ?? 0}</p>
                                <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                {upcoming_deadlines.length > 0 && (
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
                            <h2 className="text-sm font-semibold">Deadline Mendekat (7 hari)</h2>
                        </div>
                        <div className="divide-y divide-sidebar-border/50">
                            {upcoming_deadlines.map((task) => {
                                const daysLeft = Math.ceil(
                                    (new Date(task.deadline!).getTime() - Date.now()) / 86400000
                                );
                                return (
                                    <Link key={task.id} href={`/tasks/${task.id}`}>
                                        <div className="px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <p className="text-sm font-medium truncate">{task.title}</p>
                                            <span className={`text-xs font-medium ml-3 flex-shrink-0 ${
                                                daysLeft <= 1 ? 'text-destructive' :
                                                daysLeft <= 3 ? 'text-amber-600' :
                                                'text-muted-foreground'
                                            }`}>
                                                {daysLeft <= 0 ? 'Hari ini!' : `${daysLeft}h lagi`}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <Link href="/tasks">
                        <Button variant="default">View My Tasks</Button>
                    </Link>
                    <Link href="/tasks">
                        <Button variant="outline">Browse Open Tasks</Button>
                    </Link>
                </div>

                {/* Info Cards */}
                <div className="grid gap-4 md:grid-cols-3">

                    <InfoCard
                        icon={<CalendarDays className="size-5" />}
                        label="Member Since"
                        content={<p className="text-sm font-medium">{member_since}</p>}
                    />

                    <InfoCard
                        icon={<ShieldCheck className="size-5" />}
                        label="Roles"
                        content={
                            <div className="flex flex-wrap gap-1 pt-1">
                                {roles.map((role, i) => (
                                    <Badge key={i}>{role}</Badge>
                                ))}
                            </div>
                        }
                    />

                    <InfoCard
                        icon={<KeyRound className="size-5" />}
                        label="Permissions"
                        content={
                            <div className="flex flex-wrap gap-1 pt-1">
                                {permissions.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No permissions assigned.</p>
                                ) : (
                                    permissions.slice(0, 3).map((permission, i) => (
                                        <Badge key={i} variant="outline">{permission}</Badge>
                                    ))
                                )}
                                {permissions.length > 3 && (
                                    <Badge variant="outline">+{permissions.length - 3}</Badge>
                                )}
                            </div>
                        }
                    />

                </div>

            </div>
        </AppLayout>
    );
}

function InfoCard({ icon, label, content }: { icon: React.ReactNode; label: string; content: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                {icon}
                <p className="text-sm font-medium">{label}</p>
            </div>
            {content}
        </div>
    );
}
