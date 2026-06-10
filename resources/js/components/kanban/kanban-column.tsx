import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Task } from '@/types';
import KanbanCard from './kanban-card';

interface Props {
    id: string;
    label: string;
    dot: string;
    tasks: Task[];
}

export default function KanbanColumn({ id, label, dot, tasks }: Props) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col min-h-[400px]">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`size-2.5 rounded-full ${dot}`} />
                <span className="text-sm font-semibold">{label}</span>
                <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {tasks.length}
                </span>
            </div>

            {/* Drop zone */}
            <div
                ref={setNodeRef}
                className={`flex-1 rounded-xl p-2 space-y-2 transition-colors min-h-[200px] ${
                    isOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'bg-muted/30'
                }`}
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                            Tidak ada task
                        </div>
                    ) : (
                        tasks.map(task => <KanbanCard key={task.id} task={task} />)
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
