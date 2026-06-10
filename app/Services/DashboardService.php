<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardService
{
    public function adminStats(): array
    {
        return [
            'total_users'        => User::count(),
            'total_roles'        => Role::count(),
            'total_permissions'  => Permission::count(),
            'recent_users'       => User::with('roles')->latest()->take(5)->get(),
            'total_tasks'        => Task::count(),
            'overdue_tasks'      => Task::whereNotIn('status', ['done'])
                                        ->whereNotNull('deadline')
                                        ->where('deadline', '<', now())
                                        ->count(),
            'pending_handovers'  => \App\Models\TaskHandover::where('status', 'pending')->count(),
            'task_status_counts' => Task::selectRaw('status, count(*) as total')
                                        ->groupBy('status')
                                        ->pluck('total', 'status'),
            'recent_activities'  => \App\Models\TaskActivity::with('user', 'task')
                                        ->latest('created_at')
                                        ->take(8)
                                        ->get(),
        ];
    }

    public function ketuaStats(User $user): array
    {
        return [
            'total_tasks'      => Task::where('creator_id', $user->id)->count(),
            'open_tasks'       => Task::where('creator_id', $user->id)->where('status', 'open')->count(),
            'assigned_tasks'   => Task::where('creator_id', $user->id)->whereNotNull('assignee_id')->count(),
            'team_members'     => User::whereHas('roles', fn($q) => $q->where('name', 'anggota'))->count(),
            'recent_tasks'     => Task::where('creator_id', $user->id)->with('creator', 'assignee')->latest()->take(5)->get(),
            'overdue_tasks'    => Task::where('creator_id', $user->id)
                                    ->whereNotIn('status', ['done'])
                                    ->whereNotNull('deadline')
                                    ->where('deadline', '<', now())
                                    ->count(),
            'workload'         => User::whereHas('roles', fn($q) => $q->where('name', 'anggota'))
                                    ->withCount([
                                        'assignedTasks as active_tasks' => fn($q) =>
                                            $q->whereNotIn('status', ['done']),
                                        'assignedTasks as overdue_tasks' => fn($q) =>
                                            $q->whereNotIn('status', ['done'])
                                              ->whereNotNull('deadline')
                                              ->where('deadline', '<', now()),
                                    ])
                                    ->get(['id', 'name']),
        ];
    }

    public function memberStats(User $user): array
    {
        $q = fn() => Task::where('assignee_id', $user->id);

        return [
            'roles'              => $user->getRoleNames(),
            'permissions'        => $user->getAllPermissions()->pluck('name'),
            'member_since'       => $user->created_at->format('d M Y'),
            'my_tasks'           => $q()->count(),
            'open_pool_tasks'    => Task::whereNull('assignee_id')->where('status', 'open')->count(),
            'overdue_tasks'      => $q()->whereNotIn('status', ['done'])
                                        ->whereNotNull('deadline')
                                        ->where('deadline', '<', now())
                                        ->count(),
            'task_by_status'     => $q()->selectRaw('status, count(*) as total')
                                        ->groupBy('status')
                                        ->pluck('total', 'status'),
            'upcoming_deadlines' => $q()->whereNotIn('status', ['done'])
                                        ->whereNotNull('deadline')
                                        ->whereBetween('deadline', [now(), now()->addDays(7)])
                                        ->orderBy('deadline')
                                        ->take(5)
                                        ->get(),
            'incoming_handovers' => \App\Models\TaskHandover::with('task', 'fromUser')
                                        ->where('to_user_id', $user->id)
                                        ->where('status', 'pending')
                                        ->latest()
                                        ->take(3)
                                        ->get(),
        ];
    }
}
