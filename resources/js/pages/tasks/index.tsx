import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/delete-button';
import { Edit2Icon, PlusCircle, FileText, AlertCircle, LayoutGrid, TableIcon } from 'lucide-react';
import { BreadcrumbItem, SharedData, Task } from '@/types';
import { toast } from 'sonner';
import hasAnyPermission, { isOverdue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import KanbanBoard from '@/components/kanban/kanban-board';

interface Props {
    tasks: {
        data: Task[];
        links: any[];
    };
    filters: {
        search?: string;
    };
    view?: 'table' | 'kanban';
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks',
    },
];

export default function TasksPage({ tasks, filters, view = 'table', flash }: Props) {
    const user = usePage<SharedData>().props.auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const [shownMessages] = useState(new Set());

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/tasks', { search, ...(view === 'kanban' ? { view: 'kanban' } : {}) }, { preserveState: true });
    };

    const switchView = (newView: 'table' | 'kanban') => {
        router.get('/tasks', { search, ...(newView === 'kanban' ? { view: 'kanban' } : {}) }, { preserveState: true });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':   return 'destructive';
            case 'medium': return 'secondary';
            default:       return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done':        return 'default';
            case 'review':      return 'secondary';
            case 'in_progress': return 'outline';
            default:            return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />

            <div className="p-4 space-y-4">

                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48 md:max-w-xs">
                        <Input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant="outline" type="submit">Search</Button>
                    </form>

                    {/* View toggle */}
                    <div className="flex border border-sidebar-border/70 rounded-md overflow-hidden">
                        <Button
                            variant={view === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-none border-0 h-9"
                            onClick={() => switchView('table')}
                            title="Table view"
                        >
                            <TableIcon className="size-4" />
                        </Button>
                        <Button
                            variant={view === 'kanban' ? 'default' : 'ghost'}
                            size="sm"
                            className="rounded-none border-0 h-9"
                            onClick={() => switchView('kanban')}
                            title="Kanban view"
                        >
                            <LayoutGrid className="size-4" />
                        </Button>
                    </div>

                    {hasAnyPermission(['tasks create']) && (
                        <Link href="/tasks/create">
                            <Button variant="default" className="group flex items-center gap-1">
                                <PlusCircle className="group-hover:rotate-90 transition-all size-4" />
                                Create Task
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Kanban View */}
                {view === 'kanban' ? (
                    <KanbanBoard tasks={tasks.data} />
                ) : (
                    <>
                        {/* Table View */}
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Creator</TableHead>
                                        <TableHead>Assignee</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Deadline</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="size-8 opacity-50" />
                                                    <p>No tasks found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tasks.data.map((task) => (
                                            <TableRow key={task.id}>
                                                <TableCell className="font-medium max-w-xs truncate">{task.title}</TableCell>
                                                <TableCell>{task.creator?.name}</TableCell>
                                                <TableCell>
                                                    {task.assignee ? (
                                                        <span className="text-sm">{task.assignee.name}</span>
                                                    ) : (
                                                        <Badge variant="outline">Unassigned</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getPriorityColor(task.priority) as any}>
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(task.status) as any}>
                                                        {task.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {task.deadline ? (
                                                        <div className="flex items-center gap-1">
                                                            {isOverdue(task.deadline, task.status) && (
                                                                <AlertCircle className="size-3.5 text-destructive" />
                                                            )}
                                                            <span className={isOverdue(task.deadline, task.status)
                                                                ? 'text-destructive font-medium' : ''}>
                                                                {new Date(task.deadline).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Link href={`/tasks/${task.id}`}>
                                                            <Button size="sm" variant="ghost">View</Button>
                                                        </Link>
                                                        {hasAnyPermission(['tasks edit']) && (
                                                            <Link href={`/tasks/${task.id}/edit`}>
                                                                <Button size="sm" variant="ghost">
                                                                    <Edit2Icon className="size-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {hasAnyPermission(['tasks delete']) && (
                                                            <DeleteButton
                                                                id={task.id}
                                                                featured="tasks"
                                                            />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {tasks.links && tasks.links.length > 3 && (
                            <div className="flex justify-center gap-1">
                                {tasks.links.map((link: any, i) => (
                                    link.url ? (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.visit(link.url, { preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Button key={i} variant="ghost" size="sm" disabled>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    )
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
