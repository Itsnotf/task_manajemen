<?php

namespace App\Notifications;

use App\Models\TaskHandover;
use Illuminate\Notifications\Notification;

class HandoverRequested extends Notification
{
    public function __construct(private TaskHandover $handover) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'message'    => "Ada permintaan handover task \"{$this->handover->task->title}\" untuk Anda",
            'handover_id' => $this->handover->id,
            'type'       => 'handover_requested',
        ];
    }
}
