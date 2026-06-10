<?php

namespace App\Services;

use App\Models\TaskHandover;
use App\Models\Task;
use App\Models\User;
use App\Notifications\HandoverRequested;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class TaskHandoverService
{
    public function __construct(private TaskActivityService $activityService) {}

    public function getAll(?string $search = null): LengthAwarePaginator
    {
        return TaskHandover::with('task', 'fromUser', 'toUser')
            ->when($search, fn($q) => $q->whereHas('task', fn($qq) => $qq->where('title', 'like', "%{$search}%")))
            ->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    public function getIncoming(): LengthAwarePaginator
    {
        return TaskHandover::with('task', 'fromUser', 'toUser')
            ->where('to_user_id', Auth::id())
            ->where('status', 'pending')
            ->paginate(config('starterkit.pagination'));
    }

    public function findById(string $id): TaskHandover
    {
        return TaskHandover::with('task', 'fromUser', 'toUser')->findOrFail($id);
    }

    public function create(array $data): TaskHandover
    {
        $task = Task::findOrFail($data['task_id']);

        if (is_null($task->assignee_id)) {
            throw new \Exception('Task ini belum diklaim oleh siapapun dan tidak dapat di-handover.');
        }

        if ($task->status === 'open') {
            throw new \Exception('Task berstatus Open tidak dapat di-handover.');
        }

        if ($task->assignee_id !== Auth::id()) {
            throw new \Exception('Hanya pemegang task saat ini yang dapat mengajukan handover.');
        }

        $data['from_user_id'] = Auth::id();

        // Handle file upload
        if (isset($data['proof_path']) && $data['proof_path']) {
            $file = $data['proof_path'];
            $data['proof_path'] = $file->store('handovers/proofs', 'public');
        }

        $handover = TaskHandover::create($data);

        $task = Task::find($data['task_id']);
        $this->activityService->logAction($data['task_id'], Auth::id(), 'handover_requested', "Handover requested for task '{$task->title}'");

        $recipient = User::find($handover->to_user_id);
        $recipient?->notify(new HandoverRequested($handover->load('task')));

        return $handover;
    }

    public function approve(string $id): TaskHandover
    {
        $handover = $this->findById($id);

        // Only to_user can approve
        if ($handover->to_user_id !== Auth::id()) {
            throw new \Exception('Only recipient can approve handover');
        }

        $handover->update(['status' => 'approved']);

        // Update task assignee
        $task = $handover->task;
        $task->update([
            'assignee_id' => $handover->to_user_id,
            'status' => 'in_progress',
        ]);

        // Log activity
        $this->activityService->logAction($handover->task_id, Auth::id(), 'handover_approved', "Handover approved for task '{$task->title}'");

        return $handover;
    }

    public function reject(string $id, string $reason): TaskHandover
    {
        $handover = $this->findById($id);

        if ($handover->to_user_id !== Auth::id()) {
            throw new \Exception('Only recipient can reject handover');
        }

        $handover->update([
            'status'           => 'rejected',
            'rejection_reason' => $reason,
        ]);

        $this->activityService->logAction(
            $handover->task_id,
            Auth::id(),
            'handover_rejected',
            "Handover ditolak dengan alasan: {$reason}"
        );

        return $handover;
    }

    public function delete(string $id): void
    {
        $handover = $this->findById($id);

        // Delete file if exists
        if ($handover->proof_path) {
            Storage::disk('public')->delete($handover->proof_path);
        }

        $handover->delete();
    }
}
