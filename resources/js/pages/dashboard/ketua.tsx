import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Task } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ListTodo, CheckCircle2, Users, Briefcase, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Props {
    total_tasks: number;
    open_tasks: number;
    assigned_tasks: number;
    team_members: number;
    overdue_tasks: number;
    recent_tasks: Task[];
    workload: {
        id: number;
        name: string;
        active_tasks: number;
        overdue_tasks: number;
    }[];
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
    variant?: 'default' | 'danger' | 'warning';
}) {
    const valueClass =
        variant === 'danger'  ? 'text-2xl font-bold text-destructive' :
        variant === 'warning' ? 'text-2xl font-bold text-amber-600'   :
                                'text-2xl font-bold';
    return (
        <div className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={valueClass}>{value}</p>
                </div>
            </div>
        </div>
    );
}

export default function KettuaDashboard({ total_tasks, open_tasks, assigned_tasks, team_members, overdue_tasks, recent_tasks, workload }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">

                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard icon={<Briefcase className="size-5" />} label="Total Tasks" value={total_tasks} />
                    <StatCard icon={<ListTodo className="size-5" />} label="Open Tasks" value={open_tasks} />
                    <StatCard icon={<CheckCircle2 className="size-5" />} label="Assigned" value={assigned_tasks} />
                    <StatCard icon={<Users className="size-5" />} label="Team Members" value={team_members} />
                    <StatCard
                        icon={<AlertCircle className="size-5 text-destructive" />}
                        label="Overdue"
                        value={overdue_tasks}
                        variant="danger"
                    />
                </div>

                {/* Recent Tasks */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border flex justify-between items-center">
                        <h2 className="text-sm font-semibold">Recent Tasks</h2>
                        <Link href="/tasks/create">
                            <Button size="sm" variant="outline">Create Task</Button>
                        </Link>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recent_tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No tasks yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recent_tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">{task.title}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    task.priority === 'high'
                                                        ? 'destructive'
                                                        : task.priority === 'medium'
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                            >
                                                {task.priority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    task.status === 'done'
                                                        ? 'default'
                                                        : task.status === 'review'
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                            >
                                                {task.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {task.assignee ? task.assignee.name : 'Unassigned'}
                                        </TableCell>
                                        <TableCell>
                                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/tasks/${task.id}`}>
                                                <Button size="sm" variant="ghost">View</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Workload Anggota */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold">Beban Kerja Anggota</h2>
                    </div>
                    <div className="p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {workload.length === 0 ? (
                            <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                                Belum ada anggota.
                            </p>
                        ) : (
                            workload.map((member) => (
                                <div key={member.id} className="rounded-lg border border-sidebar-border/70 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{member.name}</p>
                                        {member.overdue_tasks > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                                {member.overdue_tasks} overdue
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${Math.min(member.active_tasks * 10, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {member.active_tasks} aktif
                                        </span>
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
