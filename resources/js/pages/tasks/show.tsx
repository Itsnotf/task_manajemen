import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, usePage, router } from '@inertiajs/react';
import { BreadcrumbItem, Task, SharedData } from '@/types';
import { ChevronLeft, Download, Edit2Icon, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ActivityFeed from '@/components/activity-feed';
import hasAnyPermission, { isOverdue } from '@/lib/utils';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import DeleteButton from '@/components/delete-button';
import TaskCommentSection from '@/components/task-comment-section';

interface Props {
    task: Task;
}

export default function TaskShowPage({ task }: Props) {
    const { auth } = usePage<SharedData>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: '/tasks',
        },
        {
            title: task.title,
            href: `/tasks/${task.id}`,
        },
    ];

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

    const canClaim = task.status === 'open' && !task.assignee_id && hasAnyPermission(['tasks claim']);
    const canEdit = task.creator_id === auth.user.id && hasAnyPermission(['tasks edit']);
    const canDelete = task.creator_id === auth.user.id && hasAnyPermission(['tasks delete']);
    const canExport = hasAnyPermission(['tasks index']);
    const canUpdateStatus =
        task.assignee_id === auth.user.id ||
        task.creator_id  === auth.user.id;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={task.title} />

            <div className="p-4 space-y-6">

                {/* Header with Actions */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Link href="/tasks">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ChevronLeft className="size-4" />
                                Back to Tasks
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">{task.title}</h1>
                        <p className="text-muted-foreground mt-2">Created by {task.creator?.name}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {canExport && (
                            <a href={`/tasks/${task.id}/export-pdf`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline">
                                    <Download className="size-4" />
                                    Export PDF
                                </Button>
                            </a>
                        )}
                        {canClaim && (
                            <Button
                                variant="default"
                                onClick={() => router.post(`/tasks/${task.id}/claim`)}
                            >
                                Claim Task
                            </Button>
                        )}
                        {canEdit && (
                            <Link href={`/tasks/${task.id}/edit`}>
                                <Button variant="outline">
                                    <Edit2Icon className="size-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {canDelete && (
                            <DeleteButton
                                id={task.id}
                                featured="tasks"
                            />
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">

                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Description */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <h2 className="text-lg font-semibold mb-3">Description</h2>
                            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
                        </div>

                        {/* Attachment */}
                        {task.attachment_path && (
                            <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold mb-3">Attachment</h2>
                                <a href={`/storage/${task.attachment_path}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline">
                                        <Download className="size-4" />
                                        Download File
                                    </Button>
                                </a>
                            </div>
                        )}

                        {/* Activity Feed */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <h2 className="text-lg font-semibold mb-4">Activity</h2>
                            <ActivityFeed activities={task.activities || []} />
                        </div>

                        {/* Discussion / Comments */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <h2 className="text-lg font-semibold mb-4">Diskusi</h2>
                            <TaskCommentSection task={task} />
                        </div>

                    </div>

                    {/* Sidebar - Details */}
                    <div className="space-y-4">

                        {/* Status */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">STATUS</p>
                            {canUpdateStatus ? (
                                <Select
                                    value={task.status}
                                    onValueChange={(value) =>
                                        router.patch(`/tasks/${task.id}/status`, { status: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge variant={getStatusColor(task.status) as any} className="text-base py-1.5">
                                    {task.status}
                                </Badge>
                            )}
                            {isOverdue(task.deadline, task.status) && (
                                <div className="flex items-center gap-1.5 mt-2 text-destructive text-sm">
                                    <AlertCircle className="size-4" />
                                    <span className="font-medium">Melewati tenggat!</span>
                                </div>
                            )}
                        </div>

                        {/* Priority */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">PRIORITY</p>
                            <Badge variant={getPriorityColor(task.priority) as any} className="text-base py-1.5">
                                {task.priority}
                            </Badge>
                        </div>

                        {/* Assignee */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">ASSIGNEE</p>
                            <p className="font-medium">
                                {task.assignee ? task.assignee.name : 'Unassigned'}
                            </p>
                        </div>

                        {/* Deadline */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">DEADLINE</p>
                            <p className="font-medium">
                                {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                }) : '-'}
                            </p>
                        </div>

                        {/* Created Date */}
                        <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">CREATED</p>
                            <p className="font-medium text-sm">
                                {new Date(task.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
