import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Task } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, KeyRound, ShieldCheck, ListTodo, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type SharedData } from '@/types';
import { Button } from '@/components/ui/button';

interface Props {
    roles: string[];
    permissions: string[];
    member_since: string;
    my_tasks: number;
    open_pool_tasks: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
        </div>
    );
}

export default function AnggotaDashboard({ roles, permissions, member_since, my_tasks, open_pool_tasks }: Props) {
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

                {/* Task Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                    <StatCard icon={<ListTodo className="size-5" />} label="My Tasks" value={my_tasks} />
                    <StatCard icon={<Lock className="size-5" />} label="Open Pool Tasks" value={open_pool_tasks} />
                </div>

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
