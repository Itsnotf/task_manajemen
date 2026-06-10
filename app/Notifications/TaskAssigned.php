<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Notifications\Notification;

class TaskAssigned extends Notification
{
    public function __construct(private Task $task) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'message' => "Anda mendapat tugas baru: \"{$this->task->title}\"",
            'task_id' => $this->task->id,
            'type'    => 'task_assigned',
        ];
    }
}
