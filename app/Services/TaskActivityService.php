<?php

namespace App\Services;

use App\Models\TaskActivity;
use Illuminate\Support\Facades\DB;

class TaskActivityService
{
    public function logAction(int $taskId, int $userId, string $actionType, string $description): TaskActivity
    {
        return TaskActivity::create([
            'task_id'     => $taskId,
            'user_id'     => $userId,
            'action_type' => $actionType,
            'description' => $description,
            'created_at'  => now(),
        ]);
    }

    public function getByTask(int $taskId)
    {
        return TaskActivity::where('task_id', $taskId)
            ->with('user')
            ->orderByDesc('created_at')
            ->get();
    }
}
