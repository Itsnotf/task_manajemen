<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\TaskCommentService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TaskCommentController extends Controller implements HasMiddleware
{
    public function __construct(private TaskCommentService $taskCommentService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:comments create', only: ['store']),
        ];
    }

    public function store(Request $request, Task $task)
    {

        $request->validate([
            'body' => 'required|string|min:2|max:2000',
        ]);

        $this->taskCommentService->create((string) $task->id, $request->body);

        return redirect()->route('tasks.show', $task->id)->with('success', 'Komentar ditambahkan.');
    }
}
