import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { type SharedData, type Task } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';

interface Props {
    task: Task;
}

export default function TaskCommentSection({ task }: Props) {
    const { auth } = usePage<SharedData>().props;
    const comments = task.comments ?? [];

    const { data, setData, post, processing, reset, errors } = useForm({
        body: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/tasks/${task.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    return (
        <div className="space-y-4">
            {/* Comment list */}
            {comments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                    Belum ada komentar. Mulai diskusi di bawah.
                </p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => {
                        const initials = (comment.author?.name ?? '?')
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();
                        const isOwn = comment.user_id === auth.user.id;

                        return (
                            <div key={comment.id} className="flex gap-3">
                                <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                    {initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-medium">
                                            {comment.author?.name ?? 'Unknown'}
                                        </span>
                                        {isOwn && (
                                            <span className="text-xs text-muted-foreground">
                                                (Anda)
                                            </span>
                                        )}
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {format(
                                                new Date(comment.created_at),
                                                'dd MMM, HH:mm',
                                            )}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-sm whitespace-pre-wrap text-muted-foreground">
                                        {comment.body}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New comment form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-2 border-t border-sidebar-border/70 pt-2"
            >
                <Textarea
                    placeholder="Tulis komentar atau pertanyaan..."
                    value={data.body}
                    onChange={(e) => setData('body', e.target.value)}
                    rows={3}
                    disabled={processing}
                />
                {errors.body && (
                    <p className="text-xs text-destructive">{errors.body}</p>
                )}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="sm"
                        disabled={processing || !data.body.trim()}
                    >
                        {processing ? <Spinner /> : 'Kirim'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
