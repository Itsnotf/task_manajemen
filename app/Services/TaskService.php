<?php

namespace App\Services;

use App\Models\Task;
use App\Notifications\TaskAssigned;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TaskService
{
    public function __construct(private TaskActivityService $activityService) {}

    public function getAll(?string $search = null): LengthAwarePaginator
    {
        $user = Auth::user();
        $query = Task::with('creator', 'assignee');

        // Role-based filtering
        if ($user->hasRole('anggota')) {
            // Anggota: hanya tugas mereka + open pool
            $query->where(function ($q) use ($user) {
                $q->where('assignee_id', $user->id)
                    ->orWhereNull('assignee_id');
            });
        } elseif ($user->hasRole('ketua_bidang')) {
            // Ketua: tugas yang mereka buat
            $query->where('creator_id', $user->id);
        }
        // Admin: lihat semua (no filter)

        $query->when($search, fn ($q) => $q->where('title', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%"));

        return $query->paginate(config('starterkit.pagination'))
            ->withQueryString();
    }

    public function getAllForKanban(?string $search = null): Collection
    {
        $user = Auth::user();
        $query = Task::with('creator', 'assignee');

        if ($user->hasRole('anggota')) {
            $query->where(function ($q) use ($user) {
                $q->where('assignee_id', $user->id)->orWhereNull('assignee_id');
            });
        } elseif ($user->hasRole('ketua_bidang')) {
            $query->where('creator_id', $user->id);
        }

        $query->when($search, fn ($q) => $q->where('title', 'like', "%{$search}%")
            ->orWhere('description', 'like', "%{$search}%"));

        return $query->orderBy('status')->get();
    }

    public function findById(string $id): Task
    {
        return Task::with('creator', 'assignee', 'handovers', 'activities.user', 'comments.author')
            ->findOrFail($id);
    }

    public function create(array $data): Task
    {
        $data['creator_id'] = Auth::id();
        $data['status'] = 'open';

        // Handle file upload
        if (isset($data['attachment_path']) && $data['attachment_path']) {
            $file = $data['attachment_path'];
            $data['attachment_path'] = $file->store('tasks/attachments', 'public');
        }

        $task = Task::create($data);

        $this->activityService->logAction($task->id, Auth::id(), 'created', "Task '{$task->title}' created");

        if ($task->assignee_id) {
            $task->assignee->notify(new TaskAssigned($task));
        }

        return $task;
    }

    public function update(string $id, array $data): Task
    {
        $task = $this->findById($id);

        // Handle file upload
        if (isset($data['attachment_path']) && $data['attachment_path']) {
            // Delete old file
            if ($task->attachment_path) {
                Storage::disk('public')->delete($task->attachment_path);
            }

            $file = $data['attachment_path'];
            $data['attachment_path'] = $file->store('tasks/attachments', 'public');
        } else {
            unset($data['attachment_path']);
        }

        $task->update($data);

        // Log activity
        $this->activityService->logAction($id, Auth::id(), 'updated', "Task '{$task->title}' updated");

        return $task;
    }

    public function delete(string $id): void
    {
        $task = $this->findById($id);

        // Delete file if exists
        if ($task->attachment_path) {
            Storage::disk('public')->delete($task->attachment_path);
        }

        $this->activityService->logAction($id, Auth::id(), 'deleted', "Task '{$task->title}' deleted");
        $task->delete();
    }

    public function claim(string $id): Task
    {
        $task = $this->findById($id);

        // Check if task is open
        if ($task->assignee_id !== null) {
            throw new \Exception('Task already assigned to someone');
        }

        $task->update([
            'assignee_id' => Auth::id(),
            'status' => 'in_progress',
        ]);

        $this->activityService->logAction($id, Auth::id(), 'claimed', Auth::user()->name." claimed task '{$task->title}'");

        $task->refresh();
        $task->assignee->notify(new TaskAssigned($task));

        return $task;
    }

    public function updateStatus(string $id, string $status): Task
    {
        $task = $this->findById($id);
        $oldStatus = $task->status;

        $task->update(['status' => $status]);

        $this->activityService->logAction($id, Auth::id(), 'status_updated', "Status changed from '{$oldStatus}' to '{$status}'");

        return $task;
    }

    public function submitResult(string $id, array $data): Task
    {
        $task = $this->findById($id);

        if ($task->assignee_id !== Auth::id()) {
            throw new \Exception('Hanya pemegang task yang dapat menyerahkan hasil kerja.');
        }

        if (in_array($task->status, ['open', 'done'])) {
            throw new \Exception('Hasil kerja hanya dapat diserahkan untuk task berstatus In Progress atau Review.');
        }

        $updateData = [
            'submission_note' => $data['submission_note'] ?? null,
            'submitted_at' => now(),
        ];

        if (! empty($data['submission_path']) && $data['submission_path'] instanceof \Illuminate\Http\UploadedFile) {
            if ($task->submission_path) {
                Storage::disk('public')->delete($task->submission_path);
            }
            $updateData['submission_path'] = $data['submission_path']->store('tasks/submissions', 'public');
        }

        if ($task->status === 'in_progress') {
            $updateData['status'] = 'review';
            $this->activityService->logAction($id, Auth::id(), 'status_updated', "Status otomatis berubah ke 'review' setelah hasil kerja diserahkan");
        }

        $task->update($updateData);

        $this->activityService->logAction(
            $id,
            Auth::id(),
            'submitted',
            Auth::user()->name.' menyerahkan hasil kerja'
        );

        return $task->fresh();
    }
}
