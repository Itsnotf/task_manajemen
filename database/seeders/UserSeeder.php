<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Super Admin',    'email' => 'admin@demo.id',  'role' => 'admin'],
            ['name' => 'Budi Santoso',   'email' => 'budi@demo.id',   'role' => 'ketua_bidang'],
            ['name' => 'Andi Prasetyo',  'email' => 'andi@demo.id',   'role' => 'anggota'],
            ['name' => 'Risa Putri',     'email' => 'risa@demo.id',   'role' => 'anggota'],
            ['name' => 'Dian Kusuma',    'email' => 'dian@demo.id',   'role' => 'anggota'],
            ['name' => 'Fajar Ramadhan', 'email' => 'fajar@demo.id',  'role' => 'anggota'],
        ];

        foreach ($users as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'password'          => bcrypt('password'),
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles([$data['role']]);
        }
    }
}
