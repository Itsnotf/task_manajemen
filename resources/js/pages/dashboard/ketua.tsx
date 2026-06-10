import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type Task } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ListTodo, CheckCircle2, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Props {
    total_tasks: number;
    open_tasks: number;
    assigned_tasks: number;
    team_members: number;
    recent_tasks: Task[];
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

export default function KettuaDashboard({ total_tasks, open_tasks, assigned_tasks, team_members, recent_tasks }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">

                {/* Stat Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard icon={<Briefcase className="size-5" />} label="Total Tasks" value={total_tasks} />
                    <StatCard icon={<ListTodo className="size-5" />} label="Open Tasks" value={open_tasks} />
                    <StatCard icon={<CheckCircle2 className="size-5" />} label="Assigned" value={assigned_tasks} />
                    <StatCard icon={<Users className="size-5" />} label="Team Members" value={team_members} />
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
            </div>
        </AppLayout>
    );
}
