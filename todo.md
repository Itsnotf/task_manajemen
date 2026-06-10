# TODO: Full-Stack Task Management Implementation

## TAHAP 1: DATABASE & BACKEND LOGIC

### 1. Konfigurasi Sistem (RBAC)
- [x] Buka `config/starterkit.php`.
- [x] Tambahkan permissions baru ke dalam array `permissions`:
      - [x] `'tasks index' => 'View Tasks'`
      - [x] `'tasks create' => 'Create Task'`
      - [x] `'tasks edit' => 'Edit Task'`
      - [x] `'tasks delete' => 'Delete Task'`
      - [x] `'tasks claim' => 'Claim Open Task'`
      - [x] `'handovers index' => 'View Handovers'`
      - [x] `'handovers create' => 'Request Task Handover'`
      - [x] `'handovers respond' => 'Approve/Reject Handover'`
      - [x] `'activities index' => 'View Activity Logs'`

### 2. Generasi File (Scaffolding)
- [x] `php artisan make:feature Task`
- [x] `php artisan make:feature TaskHandover`
- [x] `php artisan make:feature TaskActivity`

### 3. Eksekusi Database Migrations
- [x] Edit file migrasi `create_tasks_table`:
      - [x] `string('title')`
      - [x] `text('description')`
      - [x] `string('status')` (open, in_progress, review, done)
      - [x] `string('priority')` (low, medium, high)
      - [x] `timestamp('deadline')->nullable()`
      - [x] `string('attachment_path')->nullable()`
      - [x] `foreignId('creator_id')->constrained('users')`
      - [x] `foreignId('assignee_id')->nullable()->constrained('users')`
- [x] Edit file migrasi `create_task_handovers_table`:
      - [x] `foreignId('task_id')->constrained('tasks')->cascadeOnDelete()`
      - [x] `foreignId('from_user_id')->constrained('users')`
      - [x] `foreignId('to_user_id')->constrained('users')`
      - [x] `string('status')` (pending, approved, rejected)
      - [x] `text('notes')->nullable()`
      - [x] `string('proof_path')->nullable()`
- [x] Edit file migrasi `create_task_activities_table`:
      - [x] `foreignId('task_id')->constrained('tasks')->cascadeOnDelete()`
      - [x] `foreignId('user_id')->constrained('users')`
      - [x] `string('action_type')`
      - [x] `text('description')`
      - [x] `$table->timestamp('created_at');`
- [x] `php artisan migrate`
- [x] `php artisan db:seed`

### 4. Konfigurasi Relasi Model (Eloquent)
- [x] **Task.php**: `creator()`, `assignee()`, `handovers()`, `activities()`
- [x] **TaskHandover.php**: `task()`, `fromUser()`, `toUser()`
- [x] **User.php**: `createdTasks()`, `assignedTasks()`

### 5. Setup Service Layer (Logika Inti)
- [x] **TaskService.php**:
      - [x] `getAll()`: Filter data berdasar role.
      - [x] `findById()`: Load relasi terkait.
      - [x] `create()`: Upload file `attachment_path` ke disk `public`.
      - [x] `update()`: Handle replace file lama.
      - [x] `delete()`: Hapus data & file fisik.
      - [x] `claim()`: Update `assignee_id` dan log ke TaskActivity.
- [x] **TaskHandoverService.php**:
      - [x] `getAll()`
      - [x] `create()`: Upload file `proof_path`.
      - [x] `approve()`: Update status, ubah assignee di Task.
      - [x] `reject()`: Update status ditolak.
- [x] **TaskActivityService.php**:
      - [x] `logAction()`: Helper untuk insert log.

### 6. Validasi Request Layer (Form Requests)
- [x] **StoreTaskRequest / UpdateTaskRequest**: `attachment_path` (`nullable|file|mimes:pdf,doc,docx,zip|max:5120`).
- [x] **StoreHandoverRequest**: `proof_path` (`nullable|file|mimes:pdf,jpg,png|max:5120`).

---

## TAHAP 2: CONTROLLER & ROUTING

### 1. Setup Controllers (Hanya Layer HTTP)
- [x] **TaskController**: Inject `TaskService`. Implement `HasMiddleware` untuk pengecekan permission Spatie. Buat fungsi CRUD dan fungsi kustom `claim()`.
- [x] **TaskHandoverController**: Inject `TaskHandoverService`. Implement `HasMiddleware`. Buat fungsi index, create, store, dan fungsi kustom `respond()` (untuk approve/reject).

### 2. Mendaftarkan Routes (`routes/web.php`)
- [x] Bungkus ke dalam middleware `auth` dan `verified`:
      - [x] `Route::resource('tasks', TaskController::class);`
      - [x] `Route::post('tasks/{task}/claim', [TaskController::class, 'claim'])->name('tasks.claim');`
      - [x] `Route::resource('handovers', TaskHandoverController::class)->except(['edit', 'update', 'destroy']);`
      - [x] `Route::post('handovers/{handover}/respond', [TaskHandoverController::class, 'respond'])->name('handovers.respond');`

---

## TAHAP 3: FRONTEND - TYPESCRIPT INTERFACES

### 1. Update `resources/js/types/index.d.ts`
- [x] Tambahkan *interface* `Task`:
      ```typescript
      export interface Task {
          id: number;
          title: string;
          description: string;
          status: 'open' | 'in_progress' | 'review' | 'done';
          priority: 'low' | 'medium' | 'high';
          deadline: string | null;
          attachment_path: string | null;
          creator_id: number;
          assignee_id: number | null;
          creator?: User;
          assignee?: User;
          created_at: string;
      }
      ```
- [x] Tambahkan *interface* `TaskHandover`:
      ```typescript
      export interface TaskHandover {
          id: number;
          task_id: number;
          from_user_id: number;
          to_user_id: number;
          status: 'pending' | 'approved' | 'rejected';
          notes: string | null;
          proof_path: string | null;
          task?: Task;
          from_user?: User;
          to_user?: User;
          created_at: string;
      }
      ```
- [x] Tambahkan *interface* `TaskActivity`:
      ```typescript
      export interface TaskActivity {
          id: number;
          user_id: number;
          action_type: string;
          description: string;
          user?: User;
          created_at: string;
      }
      ```

---

## TAHAP 4: FRONTEND - REACT PAGES (INERTIA)

### 1. Halaman Dashboard (Role-Based)
- [ ] Buat `resources/js/pages/Dashboard/Admin.tsx` (Fokus ke statistik global & audit).
- [ ] Buat `resources/js/pages/Dashboard/Ketua.tsx` (Fokus ke monitoring Open Pool & beban kerja staf).
- [ ] Buat `resources/js/pages/Dashboard/Anggota.tsx` (Fokus ke My Tasks, klaim Open Pool, dan notifikasi Handover masuk).
- [ ] Sesuaikan `DashboardController.php` untuk merender *page* yang tepat berdasarkan role user.

### 2. Halaman Modul Task
- [ ] Buat `resources/js/pages/Tasks/Index.tsx`:
      - Tampilkan tabel/grid data (bisa dipisah tab "My Tasks" dan "Open Pool").
      - Pasang tombol "Klaim" untuk tugas berstatus Open.
- [ ] Buat `resources/js/pages/Tasks/Create.tsx`:
      - Gunakan `useForm` Inertia untuk handle input teks dan file upload (`attachment_path`).
- [ ] Buat `resources/js/pages/Tasks/Edit.tsx`:
      - Form untuk update data.
- [ ] Buat `resources/js/pages/Tasks/Show.tsx`:
      - Tampilkan detail lengkap tugas.
      - Berikan link/tombol untuk mengunduh dokumen (`attachment_path`).
      - Render komponen `<ActivityFeed activities={task.activities} />` di bagian bawah untuk log riwayat.

### 3. Halaman Modul Handover
- [ ] Buat `resources/js/pages/Handovers/Create.tsx`:
      - Form pengajuan delegasi (Dropdown pilih `to_user_id`, input `notes`, input file `proof_path`).
- [ ] Buat UI untuk merespons Handover (Bisa berupa Page `Handovers/Show.tsx` atau langsung Modal dari Dashboard Anggota):
      - Tampilkan alasan (notes) dan link download bukti (proof).
      - Sediakan dua tombol besar: "Approve" (Hijau) dan "Reject" (Merah) yang menembak route `handovers.respond`.
