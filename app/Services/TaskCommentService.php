<?php

namespace App\Services;

use App\Models\TaskComment;
use Illuminate\Support\Facades\Auth;

class TaskCommentService
{
    public function __construct(private TaskActivityService $activityService) {}

    public function getByTask(string $taskId)
    {
        return TaskComment::with('author')
            ->where('task_id', $taskId)
            ->latest()
            ->get();
    }

    public function create(string $taskId, string $body): TaskComment
    {
        $comment = TaskComment::create([
            'task_id' => $taskId,
            'user_id' => Auth::id(),
            'body'    => $body,
        ]);

        $this->activityService->logAction(
            $taskId,
            Auth::id(),
            'commented',
            Auth::user()->name . ' menambahkan komentar'
        );

        return $comment;
    }
}
