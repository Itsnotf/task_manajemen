<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Services\TaskService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TaskController extends Controller implements HasMiddleware
{
    public function __construct(private TaskService $taskService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:tasks index',  only: ['index', 'show', 'exportPdf']),
            new Middleware('permission:tasks create', only: ['create', 'store']),
            new Middleware('permission:tasks edit',   only: ['edit', 'update', 'updateStatus']),
            new Middleware('permission:tasks delete', only: ['destroy']),
            new Middleware('permission:tasks claim',  only: ['claim']),
        ];
    }

    public function index(Request $request)
    {
        $isKanban = $request->query('view') === 'kanban';

        return inertia('tasks/index', [
            'tasks'   => $isKanban
                ? ['data' => $this->taskService->getAllForKanban($request->search), 'links' => []]
                : $this->taskService->getAll($request->search),
            'filters' => $request->only('search'),
            'view'    => $isKanban ? 'kanban' : 'table',
        ]);
    }

    public function exportPdf(string $id)
    {
        $task = $this->taskService->findById($id);

        $pdf = Pdf::loadView('pdf.task-activity', compact('task'));

        return $pdf->download("task-{$task->id}-activity.pdf");
    }

    public function create()
    {
        return inertia('tasks/create');
    }

    public function store(StoreTaskRequest $request)
    {
        $this->taskService->create($request->validated());

        return redirect()->route('tasks.index')->with('success', 'Task created successfully');
    }

    public function show(string $id)
    {
        return inertia('tasks/show', [
            'task' => $this->taskService->findById($id),
        ]);
    }

    public function edit(string $id)
    {
        return inertia('tasks/edit', [
            'task' => $this->taskService->findById($id),
        ]);
    }

    public function update(UpdateTaskRequest $request, string $id)
    {
        $this->taskService->update($id, $request->validated());

        return redirect()->route('tasks.show', $id)->with('success', 'Task updated successfully');
    }

    public function claim(string $id)
    {
        $this->taskService->claim($id);

        return redirect()->route('tasks.show', $id)->with('success', 'Task claimed successfully');
    }

    public function updateStatus(Request $request, string $id)
    {
        $request->validate(['status' => 'required|in:open,in_progress,review,done']);

        $this->taskService->updateStatus($id, $request->status);

        return redirect()->route('tasks.show', $id)->with('success', 'Task status updated successfully');
    }

    public function destroy(string $id)
    {
        $this->taskService->delete($id);

        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully');
    }
}
