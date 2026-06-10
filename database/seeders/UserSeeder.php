<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Super Admin',    'email' => 'admin@polsri.ac.id',  'role' => 'admin'],
            ['name' => 'Budi Santoso',   'email' => 'budi@polsri.ac.id',   'role' => 'ketua_bidang'],
            ['name' => 'Andi Prasetyo',  'email' => 'andi@polsri.ac.id',   'role' => 'anggota'],
            ['name' => 'Risa Putri',     'email' => 'risa@polsri.ac.id',   'role' => 'anggota'],
            ['name' => 'Dian Kusuma',    'email' => 'dian@polsri.ac.id',   'role' => 'anggota'],
            ['name' => 'Fajar Ramadhan', 'email' => 'fajar@polsri.ac.id',  'role' => 'anggota'],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => 'password',
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles([$data['role']]);
        }
    }
}
