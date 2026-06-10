<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (config('starterkit.roles') as $role) {
            Role::create(['name' => $role]);
        }

        // Admin: semua permission
        Role::findByName('admin')
            ->givePermissionTo(Permission::all());

        // Ketua Bidang: kelola task + lihat handover/activity/user
        Role::findByName('ketua_bidang')
            ->givePermissionTo([
                'users index',
                'tasks index', 'tasks create', 'tasks edit', 'tasks delete',
                'tasks updateStatus', 'tasks export',
                'handovers index', 'handovers respond',
                'activities index',
                'comments create',
            ]);

        // Anggota: lihat & klaim task + update status + buat/balas handover
        Role::findByName('anggota')
            ->givePermissionTo([
                'tasks index', 'tasks claim', 'tasks updateStatus',
                'handovers index', 'handovers create', 'handovers respond',
                'activities index',
                'comments create',
            ]);
    }
}
