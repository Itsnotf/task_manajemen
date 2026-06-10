import { useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { type Task } from '@/types';
import { router } from '@inertiajs/react';
import KanbanColumn from './kanban-column';
import KanbanCard from './kanban-card';

interface Props {
    tasks: Task[];
}

const COLUMNS: { id: string; label: string; dot: string }[] = [
    { id: 'open',        label: 'Open Pool',  dot: 'bg-gray-400' },
    { id: 'in_progress', label: 'In Progress', dot: 'bg-blue-500' },
    { id: 'review',      label: 'Review',      dot: 'bg-purple-500' },
    { id: 'done',        label: 'Done',        dot: 'bg-green-500' },
];

export default function KanbanBoard({ tasks: initialTasks }: Props) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const tasksByColumn = useMemo(() => {
        const map: Record<string, Task[]> = {
            open: [], in_progress: [], review: [], done: [],
        };
        tasks.forEach(task => {
            if (map[task.status]) map[task.status].push(task);
        });
        return map;
    }, [tasks]);

    const findColumn = (taskId: number): string | null => {
        for (const [col, colTasks] of Object.entries(tasksByColumn)) {
            if (colTasks.some(t => t.id === taskId)) return col;
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        setActiveTask(task ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as number;
        const overId   = over.id as string | number;

        const fromCol = findColumn(activeId);

        // Determine target column: could be a column id (string) or another task id (number)
        const toCol = typeof overId === 'string' && COLUMNS.some(c => c.id === overId)
            ? overId
            : findColumn(overId as number);

        if (!fromCol || !toCol) return;

        if (fromCol === toCol) {
            // Reorder within same column (no server call needed)
            const colTasks = tasksByColumn[fromCol];
            const oldIdx = colTasks.findIndex(t => t.id === activeId);
            const newIdx = colTasks.findIndex(t => t.id === overId);
            if (oldIdx !== -1 && newIdx !== -1) {
                const reordered = arrayMove(colTasks, oldIdx, newIdx);
                setTasks(prev => [
                    ...prev.filter(t => t.status !== fromCol as Task['status']),
                    ...reordered,
                ]);
            }
            return;
        }

        // Move to a different column — optimistic update + server patch
        setTasks(prev =>
            prev.map(t => t.id === activeId ? { ...t, status: toCol as Task['status'] } : t)
        );

        router.patch(`/tasks/${activeId}/status`, { status: toCol }, {
            preserveScroll: true,
            onError: () => {
                // Rollback on failure
                setTasks(prev =>
                    prev.map(t => t.id === activeId ? { ...t, status: fromCol as Task['status'] } : t)
                );
            },
        });
    };

    return (
        <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        label={col.label}
                        dot={col.dot}
                        tasks={tasksByColumn[col.id] ?? []}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <KanbanCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
