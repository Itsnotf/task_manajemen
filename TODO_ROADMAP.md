# 📋 Roadmap Pengembangan — Task Management System
> Politeknik Negeri Sriwijaya — Divisi Media & Komunikasi

---

## Cara Penggunaan Dokumen Ini

Setiap task memiliki blok **Progress** di bagian atas. Isi kolom **Status** dan **Waktu Selesai** setelah task tuntas.

| Simbol | Arti |
|--------|------|
| ⬜ | Belum dimulai |
| 🔄 | Sedang dikerjakan |
| ✅ | Selesai |

Untuk setiap langkah individual, ubah `[ ]` menjadi `[x]` setelah selesai, dan isi waktu di sampingnya.

---

## FASE 0 — Bug Fixes (Kerjakan Pertama)

---

### BUG-01 — Fix Claim Task: Native Form → Inertia Router

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Masalah:** Tombol "Claim Task" di halaman Show menggunakan `<form method="post">` biasa tanpa CSRF token, sehingga request akan ditolak oleh Laravel middleware.

**File yang diubah:** `resources/js/pages/tasks/show.tsx`

**Langkah:**

- [x] **1.** Buka `resources/js/pages/tasks/show.tsx`
  - Tambahkan import `router` dari Inertia di baris paling atas:
    ```ts
    import { Link, Head, usePage, router } from '@inertiajs/react';
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Temukan blok `canClaim` (sekitar baris 40-an), ganti seluruh elemen `<form>`:
  ```tsx
  // ❌ HAPUS INI:
  <form method="post" action={`/tasks/${task.id}/claim`}>
      <Button variant="default">Claim Task</Button>
  </form>

  // ✅ GANTI DENGAN INI:
  <Button
      variant="default"
      onClick={() => router.post(`/tasks/${task.id}/claim`)}
  >
      Claim Task
  </Button>
  ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Test manual: login sebagai user dengan role `anggota`, buka task berstatus `open` tanpa assignee, klik "Claim Task", pastikan task statusnya berubah ke `in_progress` dan assignee terisi.
  - Waktu selesai: 2026-06-11

---

### BUG-02 — Fix Handover Logic: Blokir Task Unassigned/Open

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Masalah:** Sistem saat ini memperbolehkan user membuat handover untuk task yang belum diklaim siapapun (assignee = null, status = open), padahal handover hanya masuk akal jika ada pemegang task aktif.

**File yang diubah:**
- `app/Services/TaskHandoverService.php`
- `resources/js/pages/handovers/create.tsx`

**Langkah:**

- [x] **1.** Buka `app/Services/TaskHandoverService.php`, di dalam method `create()`, tambahkan validasi sebelum baris `$data['from_user_id'] = Auth::id();`:
    ```php
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
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buka `app/Http/Controllers/TaskHandoverController.php`, di dalam method `create()`, ubah query pengambilan tasks:
    ```php
    // ❌ GANTI baris ini:
    'tasks' => Task::where('creator_id', Auth::id())
                   ->orWhere('assignee_id', Auth::id())->get(),

    // ✅ MENJADI (hanya task yang sedang dipegang user & bukan open):
    'tasks' => Task::where('assignee_id', Auth::id())
                   ->whereNotIn('status', ['open', 'done'])
                   ->get(),
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Buka `resources/js/pages/handovers/create.tsx`, tambahkan pesan jika daftar tasks kosong, di dalam `<SelectContent>`:
    ```tsx
    {tasks.length === 0 ? (
        <div className="p-3 text-sm text-muted-foreground text-center">
            Tidak ada task aktif yang bisa di-handover.
        </div>
    ) : (
        tasks.map((task) => (
            <SelectItem key={task.id} value={task.id.toString()}>
                {task.title} — {task.status}
            </SelectItem>
        ))
    )}
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Test manual: pastikan dropdown task pada form Create Handover hanya menampilkan task yang sedang dipegang user aktif dengan status `in_progress` atau `review`.
  - Waktu selesai: 2026-06-11

---

### BUG-03 — Tambah Rejection Reason pada Handover Reject

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Masalah:** Penolakan handover tanpa alasan tidak menyelesaikan masalah akuntabilitas — hanya memindahkan blame game dari lisan ke digital.

**File yang diubah:**
- `database/migrations/` (file baru)
- `app/Services/TaskHandoverService.php`
- `app/Http/Controllers/TaskHandoverController.php`
- `resources/js/types/index.d.ts`
- `resources/js/pages/handovers/index.tsx`

**Langkah:**

- [x] **1.** Buat file migration baru:
    ```bash
    php artisan make:migration add_rejection_reason_to_task_handovers_table
    ```
    Buka file migration yang baru dibuat, isi method `up()`:
    ```php
    Schema::table('task_handovers', function (Blueprint $table) {
        $table->text('rejection_reason')->nullable()->after('proof_path');
    });
    ```
    Jalankan: `php artisan migrate`
  - Waktu selesai: 2026-06-11

- [x] **2.** Buka `app/Models/TaskHandover.php`, tambahkan `rejection_reason` ke array `$fillable`.
  - Waktu selesai: 2026-06-11

- [x] **3.** Buka `app/Services/TaskHandoverService.php`, update method `reject()`:
    ```php
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

        $task = $handover->task;
        $this->activityService->logAction(
            $handover->task_id,
            Auth::id(),
            'handover_rejected',
            "Handover ditolak dengan alasan: {$reason}"
        );

        return $handover;
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Buka `app/Http/Controllers/TaskHandoverController.php`, update method `respond()`:
    ```php
    public function respond(Request $request, string $id)
    {
        $request->validate([
            'action'           => 'required|in:approve,reject',
            'rejection_reason' => 'required_if:action,reject|nullable|string|max:500',
        ]);

        if ($request->action === 'approve') {
            $this->taskHandoverService->approve($id);
            $message = 'Handover approved successfully';
        } else {
            $this->taskHandoverService->reject($id, $request->rejection_reason);
            $message = 'Handover rejected successfully';
        }

        return redirect()->back()->with('success', $message);
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **5.** Buka `resources/js/types/index.d.ts`, tambahkan field `rejection_reason` ke interface `TaskHandover`:
    ```ts
    rejection_reason: string | null;
    ```
  - Waktu selesai: 2026-06-11

- [x] **6.** Buka `resources/js/pages/handovers/index.tsx`. Tambahkan state dan Dialog untuk reject. Ganti tombol Reject yang ada:

    a. Tambahkan import `Dialog` dan `useState` di bagian atas:
    ```tsx
    import { useState } from 'react';
    import {
        Dialog, DialogContent, DialogHeader,
        DialogTitle, DialogFooter,
    } from '@/components/ui/dialog';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    ```

    b. Tambahkan state di dalam komponen:
    ```tsx
    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        handoverId: number | null;
        reason: string;
    }>({ open: false, handoverId: null, reason: '' });
    ```

    c. Tambahkan handler submit reject:
    ```tsx
    const handleRejectSubmit = () => {
        if (!rejectDialog.handoverId || !rejectDialog.reason.trim()) return;
        router.post(`/handovers/${rejectDialog.handoverId}/respond`, {
            action: 'reject',
            rejection_reason: rejectDialog.reason,
        }, {
            preserveScroll: true,
            onSuccess: () => setRejectDialog({ open: false, handoverId: null, reason: '' }),
        });
    };
    ```

    d. Ganti tombol Reject yang lama:
    ```tsx
    // ❌ HAPUS: onClick langsung submit
    // ✅ GANTI dengan membuka dialog:
    <Button
        size="sm"
        variant="destructive"
        onClick={() => setRejectDialog({
            open: true,
            handoverId: handover.id,
            reason: '',
        })}
    >
        Reject
    </Button>
    ```

    e. Tambahkan komponen Dialog sebelum closing tag return:
    ```tsx
    <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}
    >
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Tolak Permintaan Handover</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
                <Label htmlFor="rejection_reason">
                    Alasan Penolakan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="rejection_reason"
                    placeholder="Contoh: Saya sedang overload tugas lain hingga akhir bulan..."
                    value={rejectDialog.reason}
                    onChange={(e) => setRejectDialog(prev => ({
                        ...prev, reason: e.target.value
                    }))}
                    rows={4}
                />
                <p className="text-xs text-muted-foreground">
                    Alasan ini akan terlihat oleh pemohon handover.
                </p>
            </div>
            <DialogFooter>
                <Button
                    variant="outline"
                    onClick={() => setRejectDialog({ open: false, handoverId: null, reason: '' })}
                >
                    Batal
                </Button>
                <Button
                    variant="destructive"
                    disabled={!rejectDialog.reason.trim()}
                    onClick={handleRejectSubmit}
                >
                    Tolak Handover
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    ```
  - Waktu selesai: 2026-06-11

- [x] **7.** Tambahkan kolom **Alasan Penolakan** di tabel handovers agar pengirim bisa melihatnya. Di `handovers/index.tsx`, tambahkan `<TableHead>` dan `<TableCell>`:
    ```tsx
    // Di TableHeader tambahkan:
    <TableHead>Alasan Tolak</TableHead>

    // Di TableBody per row tambahkan:
    <TableCell className="text-sm text-muted-foreground max-w-xs">
        {handover.rejection_reason ?? '—'}
    </TableCell>
    ```
  - Waktu selesai: 2026-06-11

- [x] **8.** Test manual: login sebagai penerima handover, klik Reject, pastikan dialog muncul, coba submit tanpa alasan (tombol harus disabled), isi alasan lalu submit, cek tabel menampilkan alasan penolakan.
  - Waktu selesai: 2026-06-11

---

## FASE 1 — Kritikal

---

### CRIT-01 — Overdue Detection: Indikator Visual Tenggat Terlewat

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Task yang sudah melewati deadline namun belum `done` harus tampil dengan sinyal visual merah agar ketua dan anggota bisa langsung mengenalinya.

**File yang diubah:**
- `resources/js/lib/utils.ts`
- `resources/js/pages/tasks/index.tsx`
- `resources/js/pages/tasks/show.tsx`
- `resources/js/pages/dashboard/ketua.tsx`

**Langkah:**

- [x] **1.** Buka `resources/js/lib/utils.ts`, tambahkan helper function:
    ```ts
    export function isOverdue(deadline: string | null, status: string): boolean {
        if (!deadline || status === 'done') return false;
        return new Date(deadline) < new Date();
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buka `resources/js/pages/tasks/index.tsx`:

    a. Import helper dan tambahkan `AlertCircle` icon:
    ```tsx
    import { isOverdue } from '@/lib/utils';
    import { AlertCircle } from 'lucide-react';
    ```

    b. Di kolom **Deadline** pada TableBody, ganti konten cell:
    ```tsx
    <TableCell>
        {task.deadline ? (
            <div className="flex items-center gap-1">
                {isOverdue(task.deadline, task.status) && (
                    <AlertCircle className="size-3.5 text-destructive" />
                )}
                <span className={isOverdue(task.deadline, task.status)
                    ? 'text-destructive font-medium'
                    : ''
                }>
                    {new Date(task.deadline).toLocaleDateString()}
                </span>
            </div>
        ) : '—'}
    </TableCell>
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Buka `resources/js/pages/tasks/show.tsx`:

    a. Import helper dan icon yang sama seperti langkah 2a.

    b. Di bagian sidebar **STATUS**, setelah Badge status, tambahkan indikator overdue:
    ```tsx
    {isOverdue(task.deadline, task.status) && (
        <div className="flex items-center gap-1.5 mt-2 text-destructive text-sm">
            <AlertCircle className="size-4" />
            <span className="font-medium">Melewati tenggat!</span>
        </div>
    )}
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Buka `app/Services/DashboardService.php`, tambahkan data overdue ke method `ketuaStats()`:
    ```php
    'overdue_tasks' => Task::where('creator_id', $user->id)
        ->whereNotIn('status', ['done'])
        ->whereNotNull('deadline')
        ->where('deadline', '<', now())
        ->count(),
    ```
  - Waktu selesai: 2026-06-11

- [x] **5.** Buka `resources/js/pages/dashboard/ketua.tsx`, update interface `Props` dan tambahkan stat card overdue:
    ```tsx
    // Tambahkan ke interface Props:
    overdue_tasks: number;

    // Tambahkan StatCard baru (gunakan warna merah/destructive):
    <StatCard
        icon={<AlertCircle className="size-5 text-destructive" />}
        label="Overdue"
        value={overdue_tasks}
        variant="danger"
    />
    ```
  - Waktu selesai: 2026-06-11

---

### CRIT-02 — Status Update UI di Halaman Show

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Anggota harus bisa mengubah status task mereka (contoh: `in_progress` → `review`) langsung dari halaman detail tanpa harus masuk halaman Edit.

**File yang diubah:** `resources/js/pages/tasks/show.tsx`

**Langkah:**

- [x] **1.** Buka `resources/js/pages/tasks/show.tsx`, tambahkan import yang dibutuhkan:
    ```tsx
    import { router } from '@inertiajs/react';
    import {
        Select, SelectContent, SelectItem,
        SelectTrigger, SelectValue,
    } from '@/components/ui/select';
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Tambahkan konstanta permission di dalam komponen (setelah `canDelete`):
    ```tsx
    const canUpdateStatus =
        task.assignee_id === auth.user.id ||
        task.creator_id  === auth.user.id;
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Temukan card **STATUS** di sidebar (yang sudah ada), ganti seluruh isinya:
    ```tsx
    <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
        <p className="text-xs font-semibold text-muted-foreground mb-2">STATUS</p>
        {canUpdateStatus ? (
            <Select
                value={task.status}
                onValueChange={(value) =>
                    router.patch(`/tasks/${task.id}/status`, { status: value })
                }
            >
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                </SelectContent>
            </Select>
        ) : (
            <Badge variant={getStatusColor(task.status) as any} className="text-base py-1.5">
                {task.status}
            </Badge>
        )}
    </div>
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Test manual: login sebagai assignee sebuah task, buka halaman show, pastikan Select muncul dan berhasil mengubah status. Login sebagai user lain (bukan creator/assignee), pastikan hanya Badge yang tampil (bukan Select).
  - Waktu selesai: 2026-06-11

---

### CRIT-03 — Workload Overview di Dashboard Ketua

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Ketua bisa melihat beban kerja tiap anggota dalam satu pandangan — siapa yang overload dan siapa yang masih bisa menerima tugas baru.

**File yang diubah:**
- `app/Services/DashboardService.php`
- `resources/js/pages/dashboard/ketua.tsx`

**Langkah:**

- [x] **1.** Buka `app/Services/DashboardService.php`, tambahkan data workload ke method `ketuaStats()`:
    ```php
    use App\Models\User;

    // Tambahkan di dalam return array ketuaStats():
    'workload' => User::whereHas('roles', fn($q) => $q->where('name', 'anggota'))
        ->withCount([
            'assignedTasks as active_tasks' => fn($q) =>
                $q->whereNotIn('status', ['done']),
            'assignedTasks as overdue_tasks' => fn($q) =>
                $q->whereNotIn('status', ['done'])
                  ->whereNotNull('deadline')
                  ->where('deadline', '<', now()),
        ])
        ->get(['id', 'name']),
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buka `resources/js/pages/dashboard/ketua.tsx`, update interface `Props`:
    ```tsx
    workload: {
        id: number;
        name: string;
        active_tasks: number;
        overdue_tasks: number;
    }[];
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Di komponen `KettuaDashboard`, tambahkan section Workload setelah tabel Recent Tasks:
    ```tsx
    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
        <div className="border-b border-sidebar-border/70 px-4 py-3 dark:border-sidebar-border">
            <h2 className="text-sm font-semibold">Beban Kerja Anggota</h2>
        </div>
        <div className="p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {workload.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                    Belum ada anggota.
                </p>
            ) : (
                workload.map((member) => (
                    <div key={member.id}
                        className="rounded-lg border border-sidebar-border/70 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{member.name}</p>
                            {member.overdue_tasks > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {member.overdue_tasks} overdue
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${Math.min(member.active_tasks * 10, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {member.active_tasks} aktif
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
    ```
  - Waktu selesai: 2026-06-11

---

## FASE 2 — Penting

---

### IMP-01 — Database Notifications (In-App)

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** User mendapat notifikasi in-app ketika ada task baru yang di-assign ke mereka atau ada permintaan handover masuk — tanpa harus aktif membuka aplikasi.

**File yang diubah/dibuat:**
- Migration notifikasi (auto)
- `app/Notifications/TaskAssigned.php` (baru)
- `app/Notifications/HandoverRequested.php` (baru)
- `app/Services/TaskService.php`
- `app/Services/TaskHandoverService.php`
- `app/Http/Controllers/NotificationController.php` (baru)
- `resources/js/components/app-header.tsx`
- `routes/web.php`

**Langkah:**

- [x] **1.** Buat tabel notifications:
    ```bash
    php artisan notifications:table
    php artisan migrate
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buat notification class untuk task assigned:
    ```bash
    php artisan make:notification TaskAssigned
    ```
    Isi `app/Notifications/TaskAssigned.php`:
    ```php
    <?php
    namespace App\Notifications;

    use App\Models\Task;
    use Illuminate\Notifications\Notification;

    class TaskAssigned extends Notification
    {
        public function __construct(private Task $task) {}

        public function via($notifiable): array
        {
            return ['database'];
        }

        public function toArray($notifiable): array
        {
            return [
                'message' => "Anda mendapat tugas baru: \"{$this->task->title}\"",
                'task_id' => $this->task->id,
                'type'    => 'task_assigned',
            ];
        }
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Buat notification class untuk handover:
    ```bash
    php artisan make:notification HandoverRequested
    ```
    Isi `app/Notifications/HandoverRequested.php` dengan pola yang sama, gunakan message:
    ```php
    'message' => "Ada permintaan handover task \"{$this->handover->task->title}\" untuk Anda",
    'handover_id' => $this->handover->id,
    'type'    => 'handover_requested',
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Buka `app/Services/TaskService.php`, di method `create()` dan di method `claim()`, kirim notifikasi ke assignee jika ada:
    ```php
    use App\Notifications\TaskAssigned;

    // Di bagian akhir method create(), setelah logAction:
    if ($task->assignee_id) {
        $task->assignee->notify(new TaskAssigned($task));
    }

    // Di bagian akhir method claim():
    // (opsional: notif ke creator bahwa task-nya diklaim)
    ```
  - Waktu selesai: 2026-06-11

- [x] **5.** Buka `app/Services/TaskHandoverService.php`, di method `create()`, kirim notifikasi ke `to_user`:
    ```php
    use App\Notifications\HandoverRequested;
    use App\Models\User;

    // Di bagian akhir method create():
    $recipient = User::find($handover->to_user_id);
    $recipient?->notify(new HandoverRequested($handover->load('task')));
    ```
  - Waktu selesai: 2026-06-11

- [x] **6.** Buat controller untuk mengambil dan menandai notifikasi:
    ```bash
    php artisan make:controller NotificationController
    ```
    Isi method:
    ```php
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->unreadNotifications->take(10)
        );
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['status' => 'ok']);
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **7.** Buka `routes/web.php`, tambahkan routes notifikasi:
    ```php
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/read', [NotificationController::class, 'markAllRead']);
    ```
  - Waktu selesai: 2026-06-11

- [x] **8.** Buka `app/Http/Middleware/HandleInertiaRequests.php`, tambahkan unread count ke shared data:
    ```php
    'notifications_count' => $request->user()?->unreadNotifications()->count() ?? 0,
    ```
  - Waktu selesai: 2026-06-11

- [x] **9.** Update `resources/js/types/index.d.ts`, tambahkan ke interface `SharedData`:
    ```ts
    notifications_count: number;
    ```
  - Waktu selesai: 2026-06-11

- [x] **10.** Buka `resources/js/components/app-header.tsx`, tambahkan notification bell icon dengan badge counter menggunakan data dari `usePage<SharedData>().props.notifications_count`.
  - Waktu selesai: 2026-06-11

---

### IMP-02 — Task Comment / Discussion Thread

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Anggota dan Ketua bisa berdiskusi atau memberikan klarifikasi brief langsung di dalam task, bukan di chat eksternal yang tidak terekam.

**File yang diubah/dibuat:**
- Migration `create_task_comments_table` (baru)
- `app/Models/TaskComment.php` (baru)
- `app/Services/TaskCommentService.php` (baru)
- `app/Http/Controllers/TaskCommentController.php` (baru)
- `resources/js/components/task-comment-section.tsx` (baru)
- `resources/js/pages/tasks/show.tsx`
- `routes/web.php`

**Langkah:**

- [x] **1.** Generate scaffolding:
    ```bash
    php artisan make:feature TaskComment
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Edit migration `create_task_comments_table`:
    ```php
    $table->id();
    $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained('users');
    $table->text('body');
    $table->timestamps();
    ```
    Jalankan: `php artisan migrate`
  - Waktu selesai: 2026-06-11

- [x] **3.** Isi `app/Models/TaskComment.php`:
    ```php
    protected $fillable = ['task_id', 'user_id', 'body'];

    public function task()   { return $this->belongsTo(Task::class); }
    public function author() { return $this->belongsTo(User::class, 'user_id'); }
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Tambahkan relasi ke `app/Models/Task.php`:
    ```php
    public function comments()
    {
        return $this->hasMany(TaskComment::class)->with('author')->latest();
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **5.** Isi `app/Services/TaskCommentService.php` dengan method:
    - `getByTask(string $taskId)` — ambil semua komentar task
    - `create(string $taskId, string $body)` — buat komentar baru + log activity
  - Waktu selesai: 2026-06-11

- [x] **6.** Isi `app/Http/Controllers/TaskCommentController.php` dengan method `store()`. Inject `TaskCommentService`. Validasi `body` minimal 2 karakter. Redirect ke `tasks.show` setelah sukses.
  - Waktu selesai: 2026-06-11

- [x] **7.** Tambahkan route di `routes/web.php`:
    ```php
    Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store'])
         ->name('tasks.comments.store');
    ```
  - Waktu selesai: 2026-06-11

- [x] **8.** Update `app/Services/TaskService.php`, method `findById()`, tambahkan `comments.author` ke eager load:
    ```php
    return Task::with('creator', 'assignee', 'handovers', 'activities.user', 'comments.author')
               ->findOrFail($id);
    ```
  - Waktu selesai: 2026-06-11

- [x] **9.** Tambahkan interface `TaskComment` ke `resources/js/types/index.d.ts`:
    ```ts
    export interface TaskComment {
        id: number;
        task_id: number;
        user_id: number;
        body: string;
        author?: User;
        created_at: string;
    }
    ```
    Tambahkan juga `comments?: TaskComment[]` ke interface `Task`.
  - Waktu selesai: 2026-06-11

- [x] **10.** Buat komponen `resources/js/components/task-comment-section.tsx` yang menampilkan list komentar (avatar inisial + nama + waktu + teks) dan form input komentar baru menggunakan `useForm` Inertia dengan `post` ke `tasks.comments.store`.
  - Waktu selesai: 2026-06-11

- [x] **11.** Buka `resources/js/pages/tasks/show.tsx`, tambahkan section komentar di bawah Activity Feed:
    ```tsx
    import TaskCommentSection from '@/components/task-comment-section';

    // Di dalam grid main content, setelah Activity Feed:
    <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
        <h2 className="text-lg font-semibold mb-4">Diskusi</h2>
        <TaskCommentSection task={task} />
    </div>
    ```
  - Waktu selesai: 2026-06-11

---

## FASE 3 — Nice to Have

---

### NTH-01 — Export Activity Log ke PDF

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Ketua atau Admin dapat mengekspor rekap lengkap activity log sebuah task sebagai file PDF — berguna untuk laporan, bukti audit, dan keperluan akademis.

**File yang diubah/dibuat:**
- `composer.json` (tambah package)
- `app/Http/Controllers/TaskController.php`
- `resources/views/pdf/task-activity.blade.php` (baru)
- `routes/web.php`
- `resources/js/pages/tasks/show.tsx`

**Langkah:**

- [x] **1.** Install package PDF:
    ```bash
    composer require barryvdh/laravel-dompdf
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Tambahkan method `exportPdf()` ke `app/Http/Controllers/TaskController.php`:
    ```php
    use Barryvdh\DomPDF\Facade\Pdf;

    public function exportPdf(string $id)
    {
        $task = $this->taskService->findById($id);
        $pdf  = Pdf::loadView('pdf.task-activity', compact('task'));

        return $pdf->download("task-{$task->id}-activity.pdf");
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Tambahkan route di `routes/web.php`:
    ```php
    Route::get('tasks/{task}/export-pdf', [TaskController::class, 'exportPdf'])
         ->name('tasks.exportPdf');
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Buat template blade `resources/views/pdf/task-activity.blade.php`. Tampilkan:
    - Header: nama task, creator, assignee, status, priority, deadline
    - Tabel activity log: tanggal, user, action, deskripsi
    - Footer: tanggal export
    Gunakan styling inline CSS sederhana (DomPDF tidak support Tailwind).
  - Waktu selesai: 2026-06-11

- [x] **5.** Buka `resources/js/pages/tasks/show.tsx`, tambahkan tombol Export PDF di area action header:
    ```tsx
    <a href={`/tasks/${task.id}/export-pdf`} target="_blank">
        <Button variant="outline">
            <Download className="size-4" />
            Export PDF
        </Button>
    </a>
    ```
  - Waktu selesai: 2026-06-11

---

### NTH-02 — Kanban Board

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Ganti tampilan default halaman Tasks dari tabel menjadi Kanban board dengan 4 kolom (Open Pool / In Progress / Review / Done) yang mendukung drag & drop untuk update status.

**File yang diubah/dibuat:**
- `package.json` (tambah dependency)
- `resources/js/components/kanban/kanban-board.tsx` (baru)
- `resources/js/components/kanban/kanban-column.tsx` (baru)
- `resources/js/components/kanban/kanban-card.tsx` (baru)
- `resources/js/pages/tasks/index.tsx`

**Langkah:**

- [x] **1.** Install library drag & drop:
    ```bash
    npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buat komponen kartu `resources/js/components/kanban/kanban-card.tsx`. Tampilkan:
    - Judul task
    - Badge priority (high/medium/low)
    - Badge overdue jika melewati deadline
    - Avatar inisial assignee
    - Icon paperclip jika ada attachment
    - Tombol "Klaim" (hanya di kolom Open Pool)
    Gunakan `useSortable` dari `@dnd-kit/sortable` untuk handle drag handle.
  - Waktu selesai: 2026-06-11

- [x] **3.** Buat komponen kolom `resources/js/components/kanban/kanban-column.tsx`. Tampilkan:
    - Header kolom (nama status + dot warna + jumlah task)
    - Area drop target menggunakan `useDroppable` dari `@dnd-kit/core`
    - List kartu menggunakan `SortableContext`
  - Waktu selesai: 2026-06-11

- [x] **4.** Buat komponen board `resources/js/components/kanban/kanban-board.tsx`:
    - Terima props `tasks: Task[]`
    - Kelompokkan task per status menggunakan `useMemo`
    - Implementasi `DndContext` dengan `onDragEnd`:
      ```ts
      // Saat card di-drop ke kolom berbeda:
      // → router.patch(`/tasks/${activeId}/status`, { status: newColumn })
      ```
    - Tampilkan 4 komponen `KanbanColumn` dalam grid 4 kolom
  - Waktu selesai: 2026-06-11

- [x] **5.** Buka `resources/js/pages/tasks/index.tsx`, tambahkan toggle view dan integrasikan KanbanBoard:

    a. Tambahkan state `viewMode`:
    ```tsx
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
    ```

    b. Tambahkan toggle button di toolbar:
    ```tsx
    <div className="flex border rounded-md overflow-hidden">
        <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
        >
            <TableIcon className="size-4" />
        </Button>
        <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
        >
            <LayoutGrid className="size-4" />
        </Button>
    </div>
    ```

    c. Render kondisional:
    ```tsx
    {viewMode === 'kanban'
        ? <KanbanBoard tasks={tasks.data} />
        : <TableView ... />   // bungkus tabel yang sudah ada
    }
    ```

    Catatan: Pagination hanya aktif di view Tabel. Di view Kanban, data tasks perlu diambil tanpa paginasi (update controller untuk support `?view=kanban` yang me-return semua task tanpa paginate).
  - Waktu selesai: 2026-06-11

- [x] **6.** Update `app/Http/Controllers/TaskController.php`, method `index()`:
    ```php
    public function index(Request $request)
    {
        $tasks = $request->query('view') === 'kanban'
            ? $this->taskService->getAllForKanban($request->search)
            : $this->taskService->getAll($request->search);

        return inertia('tasks/index', [
            'tasks'   => $tasks,
            'filters' => $request->only('search'),
        ]);
    }
    ```
    Tambahkan method `getAllForKanban()` di `TaskService.php` yang sama seperti `getAll()` tapi menggunakan `->get()` bukan `->paginate()`.
  - Waktu selesai: 2026-06-11

- [x] **7.** Test end-to-end: drag satu kartu dari kolom "In Progress" ke kolom "Review", pastikan status task berubah di database dan UI ter-refresh tanpa full page reload.
  - Waktu selesai: 2026-06-11

---

### CRIT-04 — Optimasi Dashboard Admin

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Admin membutuhkan visibilitas sistem secara menyeluruh — bukan hanya data user, tapi juga kesehatan operasional task, aktivitas terkini, dan handover yang menggantung.

**File yang diubah:**
- `app/Services/DashboardService.php`
- `resources/js/pages/dashboard/admin.tsx`

**Langkah:**

- [x] **1.** Buka `app/Services/DashboardService.php`, perkaya method `adminStats()`:
    ```php
    public function adminStats(): array
    {
        return [
            // Data yang sudah ada:
            'total_users'       => User::count(),
            'total_roles'       => Role::count(),
            'total_permissions' => Permission::count(),
            'recent_users'      => User::with('roles')->latest()->take(5)->get(),

            // Tambahan baru:
            'total_tasks'       => Task::count(),
            'overdue_tasks'     => Task::whereNotIn('status', ['done'])
                                       ->whereNotNull('deadline')
                                       ->where('deadline', '<', now())
                                       ->count(),
            'pending_handovers' => \App\Models\TaskHandover::where('status', 'pending')->count(),
            'task_status_counts' => Task::selectRaw('status, count(*) as total')
                                        ->groupBy('status')
                                        ->pluck('total', 'status'),
            'recent_activities' => \App\Models\TaskActivity::with('user', 'task')
                                        ->latest('created_at')
                                        ->take(8)
                                        ->get(),
        ];
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buka `resources/js/pages/dashboard/admin.tsx`, update interface `Props`:
    ```tsx
    interface Props {
        total_users: number;
        total_roles: number;
        total_permissions: number;
        total_tasks: number;
        overdue_tasks: number;
        pending_handovers: number;
        task_status_counts: Record<string, number>;
        recent_users: User[];
        recent_activities: TaskActivity[];
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Update layout grid stat cards — dari 3 card menjadi 6 card (2 baris):
    ```tsx
    {/* Baris 1: User & Role */}
    <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Users />}     label="Total Users"       value={total_users} />
        <StatCard icon={<ShieldCheck />} label="Total Roles"     value={total_roles} />
        <StatCard icon={<KeyRound />}  label="Total Permissions" value={total_permissions} />
    </div>

    {/* Baris 2: Task Overview */}
    <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<Briefcase />}      label="Total Tasks"        value={total_tasks} />
        <StatCard icon={<AlertCircle />}    label="Overdue Tasks"      value={overdue_tasks}      variant="danger" />
        <StatCard icon={<ArrowLeftRight />} label="Pending Handovers"  value={pending_handovers}  variant="warning" />
    </div>
    ```
    Update komponen `StatCard` agar menerima prop `variant` opsional untuk mengubah warna icon/value (default, danger, warning).
  - Waktu selesai: 2026-06-11

- [x] **4.** Tambahkan section **Task Status Distribution** — visual breakdown sederhana per status:
    ```tsx
    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
        <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Distribusi Status Task</h2>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {['open', 'in_progress', 'review', 'done'].map((status) => (
                <div key={status} className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-2xl font-semibold">
                        {task_status_counts[status] ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                        {status.replace('_', ' ')}
                    </p>
                </div>
            ))}
        </div>
    </div>
    ```
  - Waktu selesai: 2026-06-11

- [x] **5.** Tambahkan section **Recent System Activity** — feed aktivitas terbaru seluruh sistem:
    ```tsx
    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
        <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Aktivitas Terkini</h2>
        </div>
        <div className="divide-y divide-sidebar-border/50">
            {recent_activities.map((activity) => (
                <div key={activity.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {activity.user?.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(activity.created_at).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>
    ```
  - Waktu selesai: 2026-06-11

- [x] **6.** Pastikan interface `TaskActivity` di `types/index.d.ts` sudah memiliki relasi opsional `task?: Task`. Jika belum, tambahkan.
  - Waktu selesai: 2026-06-11

---

### CRIT-05 — Optimasi Dashboard Anggota

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Anggota membutuhkan dashboard yang fokus pada dirinya sendiri — status task aktif, peringatan overdue, deadline mendekat, dan notifikasi handover masuk. Cukup buka dashboard, langsung tahu apa yang harus dikerjakan hari ini.

**File yang diubah:**
- `app/Services/DashboardService.php`
- `resources/js/pages/dashboard/anggota.tsx`

**Langkah:**

- [x] **1.** Buka `app/Services/DashboardService.php`, perkaya method `memberStats()`:
    ```php
    public function memberStats(User $user): array
    {
        $myTasks = Task::where('assignee_id', $user->id);

        return [
            // Data yang sudah ada:
            'roles'        => $user->getRoleNames(),
            'permissions'  => $user->getAllPermissions()->pluck('name'),
            'member_since' => $user->created_at->format('d M Y'),

            // Statistik task:
            'my_tasks'          => (clone $myTasks)->count(),
            'open_pool_tasks'   => Task::whereNull('assignee_id')->where('status', 'open')->count(),
            'overdue_tasks'     => (clone $myTasks)
                                        ->whereNotIn('status', ['done'])
                                        ->whereNotNull('deadline')
                                        ->where('deadline', '<', now())
                                        ->count(),

            // Task status breakdown:
            'task_by_status' => (clone $myTasks)
                                    ->selectRaw('status, count(*) as total')
                                    ->groupBy('status')
                                    ->pluck('total', 'status'),

            // Deadline mendekat (7 hari ke depan):
            'upcoming_deadlines' => (clone $myTasks)
                                        ->whereNotIn('status', ['done'])
                                        ->whereNotNull('deadline')
                                        ->whereBetween('deadline', [now(), now()->addDays(7)])
                                        ->orderBy('deadline')
                                        ->take(5)
                                        ->get(),

            // Handover masuk yang masih pending:
            'incoming_handovers' => \App\Models\TaskHandover::with('task', 'fromUser')
                                        ->where('to_user_id', $user->id)
                                        ->where('status', 'pending')
                                        ->latest()
                                        ->take(3)
                                        ->get(),
        ];
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buka `resources/js/pages/dashboard/anggota.tsx`, update interface `Props`:
    ```tsx
    interface Props {
        roles: string[];
        permissions: string[];
        member_since: string;
        my_tasks: number;
        open_pool_tasks: number;
        overdue_tasks: number;
        task_by_status: Record<string, number>;
        upcoming_deadlines: Task[];
        incoming_handovers: TaskHandover[];
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Tambahkan card **Overdue** ke stat grid — ubah dari 2 card menjadi 3 card. Berikan warna merah jika `overdue_tasks > 0`:
    ```tsx
    <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<ListTodo />}    label="Tugas Aktif"       value={my_tasks} />
        <StatCard icon={<Lock />}        label="Open Pool"         value={open_pool_tasks} />
        <StatCard
            icon={<AlertCircle className={overdue_tasks > 0 ? 'text-destructive' : ''} />}
            label="Overdue"
            value={overdue_tasks}
            variant={overdue_tasks > 0 ? 'danger' : 'default'}
        />
    </div>
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Tambahkan section **My Tasks by Status** — visual mini-kanban atau progress bar per status:
    ```tsx
    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4">
        <h2 className="text-sm font-semibold mb-3">Progres Tugas Saya</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
                { key: 'open',        label: 'Open',        color: 'bg-gray-400' },
                { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
                { key: 'review',      label: 'Review',      color: 'bg-purple-500' },
                { key: 'done',        label: 'Done',        color: 'bg-green-500' },
            ].map(({ key, label, color }) => (
                <div key={key} className="rounded-lg bg-muted p-3">
                    <div className={`size-2 rounded-full ${color} mb-2`} />
                    <p className="text-xl font-semibold">{task_by_status[key] ?? 0}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            ))}
        </div>
    </div>
    ```
  - Waktu selesai: 2026-06-11

- [x] **5.** Tambahkan section **Deadline Mendekat** (7 hari ke depan). Tampilkan sebagai list vertikal dengan warna deadline yang makin merah makin dekat:
    ```tsx
    {upcoming_deadlines.length > 0 && (
        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <div className="border-b px-4 py-3">
                <h2 className="text-sm font-semibold">Deadline Mendekat</h2>
            </div>
            <div className="divide-y divide-sidebar-border/50">
                {upcoming_deadlines.map((task) => {
                    const daysLeft = Math.ceil(
                        (new Date(task.deadline!).getTime() - Date.now()) / 86400000
                    );
                    return (
                        <Link key={task.id} href={`/tasks/${task.id}`}>
                            <div className="px-4 py-3 flex items-center justify-between hover:bg-muted/50">
                                <p className="text-sm font-medium truncate">{task.title}</p>
                                <span className={`text-xs font-medium ml-3 flex-shrink-0 ${
                                    daysLeft <= 1 ? 'text-destructive' :
                                    daysLeft <= 3 ? 'text-amber-600' : 'text-muted-foreground'
                                }`}>
                                    {daysLeft <= 0 ? 'Hari ini' : `${daysLeft}h lagi`}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    )}
    ```
  - Waktu selesai: 2026-06-11

- [x] **6.** Tambahkan section **Handover Masuk** jika ada permintaan pending:
    ```tsx
    {incoming_handovers.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <div className="border-b border-amber-200 dark:border-amber-800 px-4 py-3 flex items-center gap-2">
                <ArrowLeftRight className="size-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Permintaan Handover Masuk ({incoming_handovers.length})
                </h2>
            </div>
            <div className="divide-y divide-amber-100 dark:divide-amber-900">
                {incoming_handovers.map((handover) => (
                    <div key={handover.id} className="px-4 py-3">
                        <p className="text-sm font-medium">{handover.task?.title}</p>
                        <p className="text-xs text-muted-foreground">
                            Dari: {handover.from_user?.name}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <Link href="/handovers">
                                <Button size="sm" variant="outline" className="text-xs h-7">
                                    Lihat Detail
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )}
    ```
  - Waktu selesai: 2026-06-11

---

## FASE 4 — Comprehensive Seeder

---

### SEED-01 — Seeder Lengkap untuk Demo Sistem

**Progress:**
| Status | Waktu Selesai |
|--------|---------------|
| ✅ | 2026-06-11 |

**Tujuan:** Setelah semua fitur selesai diimplementasikan, seeder ini memastikan database terisi data yang cukup realistis untuk memverifikasi seluruh fitur berjalan: dashboard semua role, kanban board terisi, overdue terdeteksi, handover dengan rejection reason, notifikasi, komentar, dan workload overview.

**Skenario Data yang Harus Tersedia Setelah Seeder:**
- 1 admin, 1 ketua_bidang, 4 anggota dengan nama realistis
- 15+ task dengan variasi status, priority, deadline (termasuk beberapa yang overdue)
- 5+ handover (pending, approved, dan rejected dengan alasan)
- Activity log untuk setiap task
- Komentar di beberapa task
- Notifikasi belum-dibaca untuk beberapa user

**File yang diubah/dibuat:**
- `database/seeders/UserSeeder.php` (baru / update)
- `database/seeders/TaskSeeder.php` (baru / update)
- `database/seeders/TaskHandoverSeeder.php` (baru)
- `database/seeders/TaskCommentSeeder.php` (baru)
- `database/seeders/DatabaseSeeder.php` (update urutan)

**Langkah:**

- [x] **1.** Buka `database/seeders/DatabaseSeeder.php`, pastikan urutan pemanggilan seeder sudah benar (permissions & roles harus sebelum users):
    ```php
    public function run(): void
    {
        $this->call([
            // 1. Permission & Role (jalankan yang sudah ada)
            // Pastikan seeder ini membuat: admin, ketua_bidang, anggota
            // dengan permissions yang sesuai masing-masing role

            // 2. Users
            UserSeeder::class,

            // 3. Tasks (butuh users sudah ada)
            TaskSeeder::class,

            // 4. Handovers (butuh tasks & users)
            TaskHandoverSeeder::class,

            // 5. Comments (butuh tasks & users)
            TaskCommentSeeder::class,
        ]);
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **2.** Buat/update `database/seeders/UserSeeder.php` dengan data berikut (gunakan `User::create()` atau `User::firstOrCreate()` agar bisa di-reseed tanpa duplikat):

    | Nama | Email | Password | Role |
    |------|-------|----------|------|
    | Super Admin | admin@polsri.ac.id | password | admin |
    | Budi Santoso | budi@polsri.ac.id | password | ketua_bidang |
    | Andi Prasetyo | andi@polsri.ac.id | password | anggota |
    | Risa Putri | risa@polsri.ac.id | password | anggota |
    | Dian Kusuma | dian@polsri.ac.id | password | anggota |
    | Fajar Ramadhan | fajar@polsri.ac.id | password | anggota |

    ```php
    $users = [
        ['name' => 'Super Admin',   'email' => 'admin@polsri.ac.id',  'role' => 'admin'],
        ['name' => 'Budi Santoso',  'email' => 'budi@polsri.ac.id',   'role' => 'ketua_bidang'],
        ['name' => 'Andi Prasetyo', 'email' => 'andi@polsri.ac.id',   'role' => 'anggota'],
        ['name' => 'Risa Putri',    'email' => 'risa@polsri.ac.id',   'role' => 'anggota'],
        ['name' => 'Dian Kusuma',   'email' => 'dian@polsri.ac.id',   'role' => 'anggota'],
        ['name' => 'Fajar Ramadhan','email' => 'fajar@polsri.ac.id',  'role' => 'anggota'],
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
    ```
  - Waktu selesai: 2026-06-11

- [x] **3.** Buat `database/seeders/TaskSeeder.php`. Seed 16 task dengan skenario yang mencakup semua kondisi:

    ```php
    use App\Models\Task;
    use App\Models\User;
    use App\Services\TaskActivityService;

    // Ambil referensi user
    $ketua = User::where('email', 'budi@polsri.ac.id')->first();
    $andi  = User::where('email', 'andi@polsri.ac.id')->first();
    $risa  = User::where('email', 'risa@polsri.ac.id')->first();
    $dian  = User::where('email', 'dian@polsri.ac.id')->first();
    $fajar = User::where('email', 'fajar@polsri.ac.id')->first();

    $activityService = app(TaskActivityService::class);

    $tasks = [
        // --- Open Pool (unassigned, status open) ---
        [
            'title'       => 'Desain banner Instagram Ramadan series',
            'description' => 'Buat 5 frame konten banner Instagram bertema Ramadan untuk posting minggu pertama. Brief terlampir.',
            'status'      => 'open',
            'priority'    => 'high',
            'deadline'    => now()->addDays(5),
            'creator_id'  => $ketua->id,
            'assignee_id' => null,
        ],
        // ... (dst sesuai roadmap asli)
    ];

    foreach ($tasks as $taskData) {
        $task = Task::create($taskData);
        $activityService->logAction(
            $task->id,
            $task->creator_id,
            'created',
            "Task '{$task->title}' dibuat"
        );
    }
    ```
  - Waktu selesai: 2026-06-11

- [x] **4.** Buat `database/seeders/TaskHandoverSeeder.php`. Seed 5 handover yang mencakup semua status (pending, approved, rejected).
  - Waktu selesai: 2026-06-11

- [x] **5.** Buat `database/seeders/TaskCommentSeeder.php`. Seed beberapa komentar realistis di task yang aktif.

    Catatan: Langkah ini baru bisa dijalankan setelah `IMP-02 Task Comment` selesai diimplementasikan.
  - Waktu selesai: 2026-06-11

- [x] **6.** Jalankan seluruh seeder dari awal untuk memverifikasi tidak ada error:
    ```bash
    php artisan migrate:fresh --seed
    ```
  - Waktu selesai: 2026-06-11

- [x] **7.** Verifikasi hasil seeder dengan checklist berikut — login ke masing-masing akun dan pastikan:

    | Akun | Yang Harus Terlihat |
    |------|---------------------|
    | admin@polsri.ac.id | 6 users, 13 tasks total, 2 overdue, 2 pending handovers di dashboard |
    | budi@polsri.ac.id | Kanban terisi, workload grid menampilkan 4 anggota, ada task overdue |
    | andi@polsri.ac.id | Dashboard menampilkan task aktif, 1 deadline mendekat, 1 handover masuk pending |
    | risa@polsri.ac.id | Task in_progress dan review muncul, ada overdue detection |
    | dian@polsri.ac.id | Task in_progress overdue, dashboard menampilkan peringatan |
    | fajar@polsri.ac.id | Task done muncul di history, ada notifikasi handover rejected |
  - Waktu selesai: 2026-06-11

---

## Ringkasan Progress Keseluruhan

| Fase | Task | Status | Selesai Pada |
|------|------|--------|--------------|
| **FASE 0** | BUG-01: Fix Claim Task | ✅ | 2026-06-11 |
| | BUG-02: Fix Handover Logic | ✅ | 2026-06-11 |
| | BUG-03: Rejection Reason | ✅ | 2026-06-11 |
| **FASE 1** | CRIT-01: Overdue Detection | ✅ | 2026-06-11 |
| | CRIT-02: Status Update UI | ✅ | 2026-06-11 |
| | CRIT-03: Workload Overview (Ketua) | ✅ | 2026-06-11 |
| | CRIT-04: Dashboard Admin | ✅ | 2026-06-11 |
| | CRIT-05: Dashboard Anggota | ✅ | 2026-06-11 |
| **FASE 2** | IMP-01: Notifications | ✅ | 2026-06-11 |
| | IMP-02: Task Comments | ✅ | 2026-06-11 |
| **FASE 3** | NTH-01: Export PDF | ✅ | 2026-06-11 |
| | NTH-02: Kanban Board | ✅ | 2026-06-11 |
| **FASE 4** | SEED-01: Comprehensive Seeder | ✅ | 2026-06-11 |

---

*Dokumen ini dibuat sebagai panduan pengembangan sistem manajemen tugas Divisi Media & Komunikasi.*
*Setiap perubahan pada dokumen ini harus dicatat dengan jelas.*
