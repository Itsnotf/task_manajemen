import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Paperclip, GripVertical } from 'lucide-react';
import { isOverdue } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface Props {
    task: Task;
}

const priorityVariant: Record<string, 'destructive' | 'secondary' | 'outline'> = {
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
};

export default function KanbanCard({ task }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const overdue = isOverdue(task.deadline, task.status);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="rounded-lg border border-sidebar-border/70 bg-card p-3 shadow-sm dark:border-sidebar-border"
        >
            {/* Header row: drag handle + title + priority */}
            <div className="flex items-start gap-1.5 mb-2">
                {/* Drag handle — HANYA area ini yang bisa di-drag */}
                <div
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing mt-0.5 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    title="Drag untuk pindah kolom"
                >
                    <GripVertical className="size-3.5" />
                </div>

                {/* Title — klik langsung ke halaman detail */}
                <Link
                    href={`/tasks/${task.id}`}
                    className="text-sm font-medium leading-snug hover:underline line-clamp-2 flex-1"
                >
                    {task.title}
                </Link>

                <Badge variant={priorityVariant[task.priority] ?? 'outline'} className="text-[10px] shrink-0">
                    {task.priority}
                </Badge>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-2 pl-5">
                <div className="flex items-center gap-1.5">
                    {overdue && (
                        <span title="Overdue">
                            <AlertCircle className="size-3.5 text-destructive" />
                        </span>
                    )}
                    {task.attachment_path && (
                        <span title="Has attachment">
                            <Paperclip className="size-3.5 text-muted-foreground" />
                        </span>
                    )}
                    {task.deadline && (
                        <span className={`text-[10px] ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                    )}
                </div>

                {task.assignee && (
                    <div
                        className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0"
                        title={task.assignee.name}
                    >
                        {task.assignee.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
}
