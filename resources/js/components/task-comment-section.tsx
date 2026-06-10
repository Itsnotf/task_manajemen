import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { type Task, type SharedData } from '@/types';
import { format } from 'date-fns';

interface Props {
    task: Task;
}

export default function TaskCommentSection({ task }: Props) {
    const { auth } = usePage<SharedData>().props;
    const comments = task.comments ?? [];

    const { data, setData, post, processing, reset, errors } = useForm({ body: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasks.comments.store', task.id), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    };

    return (
        <div className="space-y-4">
            {/* Comment list */}
            {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
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
                                <div className="flex-shrink-0 size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-medium">
                                            {comment.author?.name ?? 'Unknown'}
                                        </span>
                                        {isOwn && (
                                            <span className="text-xs text-muted-foreground">(Anda)</span>
                                        )}
                                        <span className="text-xs text-muted-foreground ml-auto">
                                            {format(new Date(comment.created_at), 'dd MMM, HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">
                                        {comment.body}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New comment form */}
            <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-sidebar-border/70">
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
                    <Button type="submit" size="sm" disabled={processing || !data.body.trim()}>
                        {processing ? <Spinner /> : 'Kirim'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
