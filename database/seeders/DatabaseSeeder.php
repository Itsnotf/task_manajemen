<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,  // 1. buat semua permission
            RoleSeeder::class,        // 2. buat roles + assign permissions
            UserSeeder::class,        // 3. buat users + assign roles
            TaskSeeder::class,        // 4. buat 16 task + activities + notifications
            TaskHandoverSeeder::class,// 5. buat 5 handover + activities + notifications
            TaskCommentSeeder::class, // 6. buat komentar diskusi
        ]);
    }
}
