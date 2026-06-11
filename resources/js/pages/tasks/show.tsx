import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, usePage, router, useForm } from '@inertiajs/react';
import { BreadcrumbItem, Task, SharedData } from '@/types';
import { ChevronLeft, Download, Edit2Icon, AlertCircle, Upload, CheckCircle2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ActivityFeed from '@/components/activity-feed';
import hasAnyPermission, { isOverdue } from '@/lib/utils';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import DeleteButton from '@/components/delete-button';
import TaskCommentSection from '@/components/task-comment-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

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
    const canExport = hasAnyPermission(['tasks export']);
    const canUpdateStatus =
        task.assignee_id === auth.user.id ||
        task.creator_id  === auth.user.id;

    const canSubmit =
        task.assignee_id === auth.user.id &&
        !['open', 'done'].includes(task.status);

    const { data: submitData, setData: setSubmitData, post: submitPost,
            processing: submitProcessing, errors: submitErrors, reset: submitReset } = useForm({
        submission_note: task.submission_note ?? '',
        submission_path: null as File | null,
    });

    const handleSubmitResult = (e: React.FormEvent) => {
        e.preventDefault();
        submitPost(`/tasks/${task.id}/submit`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => submitReset(),
        });
    };

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

                        {/* Hasil Kerja — tampil untuk semua jika sudah ada submission, atau untuk assignee */}
                        {(task.submission_path || task.submission_note || canSubmit) && (
                            <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                <h2 className="text-lg font-semibold mb-4">Hasil Kerja</h2>

                                {/* Tampilkan hasil yang sudah disubmit */}
                                {(task.submission_path || task.submission_note) && (
                                    <div className="rounded-md bg-muted/50 border border-sidebar-border/50 p-3 mb-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                                            <CheckCircle2 className="size-4" />
                                            <span>
                                                Hasil diserahkan
                                                {task.submitted_at && (
                                                    <span className="font-normal text-muted-foreground ml-1">
                                                        — {new Date(task.submitted_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {task.submission_note && (
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6">
                                                {task.submission_note}
                                            </p>
                                        )}
                                        {task.submission_path && (
                                            <a
                                                href={`/storage/${task.submission_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="pl-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                            >
                                                <Download className="size-3.5" />
                                                Unduh file hasil kerja
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Form submit — hanya untuk assignee, hanya jika belum done */}
                                {canSubmit && (
                                    <>
                                        {(task.submission_path || task.submission_note) && (
                                            <Separator className="mb-4" />
                                        )}
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {task.submission_path || task.submission_note
                                                ? 'Perbarui hasil kerja:'
                                                : 'Serahkan hasil kerja kamu:'}
                                        </p>
                                        <form onSubmit={handleSubmitResult} className="space-y-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="submission_note">
                                                    Catatan atau Link
                                                </Label>
                                                <Textarea
                                                    id="submission_note"
                                                    placeholder="Tambahkan deskripsi, link Google Drive, atau catatan lainnya..."
                                                    value={submitData.submission_note}
                                                    onChange={(e) => setSubmitData('submission_note', e.target.value)}
                                                    rows={3}
                                                    disabled={submitProcessing}
                                                />
                                                {submitErrors.submission_note && (
                                                    <p className="text-xs text-destructive">{submitErrors.submission_note}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="submission_path">
                                                    Upload File <span className="text-muted-foreground font-normal">(opsional, maks 20MB)</span>
                                                </Label>
                                                <Input
                                                    id="submission_path"
                                                    type="file"
                                                    disabled={submitProcessing}
                                                    onChange={(e) => setSubmitData('submission_path', e.target.files?.[0] ?? null)}
                                                />
                                                {submitErrors.submission_path && (
                                                    <p className="text-xs text-destructive">{submitErrors.submission_path}</p>
                                                )}
                                            </div>
                                            <div className="flex justify-end">
                                                <Button type="submit" disabled={submitProcessing}>
                                                    <Upload className="size-4" />
                                                    {submitProcessing
                                                        ? 'Mengirim...'
                                                        : task.status === 'in_progress'
                                                            ? 'Serahkan & Pindah ke Review'
                                                            : 'Perbarui Hasil Kerja'}
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                )}
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
