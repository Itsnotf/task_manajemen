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
            'total_users'       => User::count(),
            'total_roles'       => Role::count(),
            'total_permissions' => Permission::count(),
            'recent_users'      => User::with('roles')->latest()->take(5)->get(),
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
        ];
    }

    public function memberStats(User $user): array
    {
        return [
            'roles'       => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'member_since' => $user->created_at->format('d M Y'),
            'my_tasks' => Task::where('assignee_id', $user->id)->count(),
            'open_pool_tasks' => Task::whereNull('assignee_id')->count(),
        ];
    }
}
