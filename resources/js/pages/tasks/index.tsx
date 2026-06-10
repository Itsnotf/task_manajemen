import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/delete-button';
import { Edit2Icon, PlusCircle, FileText } from 'lucide-react';
import { BreadcrumbItem, SharedData, Task } from '@/types';
import { toast } from 'sonner';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import hasAnyPermission from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


interface Props {
    tasks: {
        data: Task[];
        links: any[];
    };
    filters: {
        search?: string;
    };
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

export default function TasksPage({ tasks, filters, flash }: Props) {
    const user = usePage<SharedData>().props.auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const [shownMessages] = useState(new Set());
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/tasks', { search }, { preserveState: true });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done':
                return 'default';
            case 'review':
                return 'secondary';
            case 'in_progress':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />

            <div className="p-4 space-y-4">

                {/* Search Bar & Create Button */}
                <div className='flex space-x-1'>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                        <Input
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant='outline' type="submit">Search</Button>
                    </form>
                    {hasAnyPermission(["tasks create"]) && (
                        <Link href="/tasks/create">
                            <Button variant='default' className='group flex items-center'>
                                <PlusCircle className='group-hover:rotate-90 transition-all' />
                                Create Task</Button>
                        </Link>
                    )}
                </div>

                {/* Tasks Table */}
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
                                        <div className='flex flex-col items-center gap-2'>
                                            <FileText className='size-8 opacity-50' />
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
                                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex gap-1'>
                                                <Link href={`/tasks/${task.id}`}>
                                                    <Button size="sm" variant="ghost">View</Button>
                                                </Link>
                                                {hasAnyPermission(["tasks edit"]) && (
                                                    <Link href={`/tasks/${task.id}/edit`}>
                                                        <Button size="sm" variant="ghost">
                                                            <Edit2Icon className='size-4' />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {hasAnyPermission(["tasks delete"]) && (
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
                {tasks.links && tasks.links.length > 0 && (
                    <div className="flex justify-center gap-1">
                        {tasks.links.map((link: any, i) => (
                            link.url ? (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
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
            </div>
        </AppLayout>
    );
}
