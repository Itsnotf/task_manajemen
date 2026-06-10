<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskAssigned;
use App\Services\TaskActivityService;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $activity = app(TaskActivityService::class);

        $ketua = User::where('email', 'budi@polsri.ac.id')->firstOrFail();
        $andi  = User::where('email', 'andi@polsri.ac.id')->firstOrFail();
        $risa  = User::where('email', 'risa@polsri.ac.id')->firstOrFail();
        $dian  = User::where('email', 'dian@polsri.ac.id')->firstOrFail();
        $fajar = User::where('email', 'fajar@polsri.ac.id')->firstOrFail();

        $tasks = [

            // ── Open Pool ─────────────────────────────────────────────────────
            [
                'title'       => 'Desain banner Instagram Ramadan series',
                'description' => 'Buat 5 frame konten banner Instagram bertema Ramadan untuk posting minggu pertama. Gunakan palet warna #1B4F72 dan putih. Brief lengkap ada di folder shared drive.',
                'status'      => 'open',
                'priority'    => 'high',
                'deadline'    => now()->addDays(5),
                'creator_id'  => $ketua->id,
                'assignee_id' => null,
            ],
            [
                'title'       => 'Konten carousel Tips Digital Marketing',
                'description' => 'Buat konten carousel Instagram 8 slide tentang tips digital marketing untuk UKM. Target audience: mahasiswa semester 3-5.',
                'status'      => 'open',
                'priority'    => 'medium',
                'deadline'    => now()->addDays(10),
                'creator_id'  => $ketua->id,
                'assignee_id' => null,
            ],
            [
                'title'       => 'Cover artikel majalah internal edisi Juli',
                'description' => 'Desain cover majalah internal Polsri edisi Juli 2026. Tema: "Inovasi & Teknologi". Ukuran A4, resolusi 300dpi.',
                'status'      => 'open',
                'priority'    => 'low',
                'deadline'    => null,
                'creator_id'  => $ketua->id,
                'assignee_id' => null,
            ],

            // ── In Progress (aktif, belum overdue) ────────────────────────────
            [
                'title'       => 'Edit video company profile Polsri 2026',
                'description' => 'Edit video company profile terbaru. Durasi maksimal 3 menit. Gunakan footage dari event Dies Natalis ke-37. Musik background sudah disiapkan.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'deadline'    => now()->addDays(8),
                'creator_id'  => $ketua->id,
                'assignee_id' => $andi->id,
            ],
            [
                'title'       => 'Video dokumentasi kegiatan PKM mahasiswa',
                'description' => 'Dokumentasikan seluruh rangkaian kegiatan PKM dengan format video highlight 5-7 menit. Include wawancara singkat dengan peserta.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'deadline'    => now()->addDays(14),
                'creator_id'  => $ketua->id,
                'assignee_id' => $risa->id,
            ],
            [
                'title'       => 'Jadwal kuliah semester genap untuk Instagram',
                'description' => 'Buat infografis jadwal kuliah semester genap 2025/2026 untuk semua prodi. Format feed Instagram 1:1 dan story 9:16.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'deadline'    => now()->addDays(3),
                'creator_id'  => $ketua->id,
                'assignee_id' => $dian->id,
            ],
            [
                'title'       => 'Template presentasi PPT standar divisi',
                'description' => 'Buat master template PowerPoint untuk kebutuhan presentasi seluruh divisi. Include 15 layout berbeda, sesuai brand guideline terbaru.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'deadline'    => now()->addDays(6),
                'creator_id'  => $ketua->id,
                'assignee_id' => $fajar->id,
            ],

            // ── In Progress (OVERDUE) ──────────────────────────────────────────
            [
                'title'       => 'Konten Instagram Story 5 hari berturut-turut',
                'description' => 'Buat konten Instagram Story untuk kampanye 5 hari berturut-turut menyambut hari jadi kampus. Setiap story harus punya CTA yang jelas.',
                'status'      => 'in_progress',
                'priority'    => 'medium',
                'deadline'    => now()->subDay(),
                'creator_id'  => $ketua->id,
                'assignee_id' => $andi->id,
            ],
            [
                'title'       => 'Infografis jadwal imsakiyah Ramadan',
                'description' => 'Buat infografis jadwal imsakiyah dan sholat selama Ramadan 1447H untuk kota Palembang. Sumber data: BMKG & Kemenag.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'deadline'    => now()->subDays(3),
                'creator_id'  => $ketua->id,
                'assignee_id' => $risa->id,
            ],
            [
                'title'       => 'Desain poster seminar nasional ICT 2026',
                'description' => 'Desain poster seminar nasional "ICT for Sustainable Future 2026". Ukuran A2 untuk cetak dan versi digital. Deadline dari panitia sudah sangat mepet.',
                'status'      => 'in_progress',
                'priority'    => 'high',
                'deadline'    => now()->subDays(5),
                'creator_id'  => $ketua->id,
                'assignee_id' => $dian->id,
            ],

            // ── Review ─────────────────────────────────────────────────────────
            [
                'title'       => 'Video teaser acara wisuda 2026',
                'description' => 'Produksi video teaser acara wisuda Polsri 2026. Durasi 60-90 detik. Tone: cinematic, emosional. Sertakan footage wisuda tahun lalu sebagai referensi.',
                'status'      => 'review',
                'priority'    => 'high',
                'deadline'    => now()->addDays(2),
                'creator_id'  => $ketua->id,
                'assignee_id' => $andi->id,
            ],
            [
                'title'       => 'Thumbnail series YouTube channel divisi',
                'description' => 'Desain thumbnail konsisten untuk semua video di channel YouTube divisi. Buat 10 varian template thumbnail sesuai kategori konten.',
                'status'      => 'review',
                'priority'    => 'low',
                'deadline'    => now()->addDays(3),
                'creator_id'  => $ketua->id,
                'assignee_id' => $dian->id,
            ],
            [
                'title'       => 'Motion graphic intro video profil kampus',
                'description' => 'Buat animasi motion graphic 10 detik sebagai intro standard untuk semua video official kampus. Format MP4 4K dengan alpha channel.',
                'status'      => 'review',
                'priority'    => 'high',
                'deadline'    => now()->addDay(),
                'creator_id'  => $ketua->id,
                'assignee_id' => $fajar->id,
            ],

            // ── Done ───────────────────────────────────────────────────────────
            [
                'title'       => 'Newsletter bulanan edisi Mei 2026',
                'description' => 'Buat newsletter bulanan edisi Mei 2026. Berisi: highlight kegiatan, pengumuman penting, dan kolom tips. Format PDF 8 halaman.',
                'status'      => 'done',
                'priority'    => 'medium',
                'deadline'    => null,
                'creator_id'  => $ketua->id,
                'assignee_id' => $fajar->id,
            ],
            [
                'title'       => 'Dokumentasi foto kegiatan malam keakraban',
                'description' => 'Dokumentasikan seluruh rangkaian acara malam keakraban mahasiswa baru 2025/2026. Hasilkan minimum 50 foto terpilih siap publish.',
                'status'      => 'done',
                'priority'    => 'low',
                'deadline'    => null,
                'creator_id'  => $ketua->id,
                'assignee_id' => $andi->id,
            ],
            [
                'title'       => 'Backdrop banner wisuda Prodi TI',
                'description' => 'Desain backdrop banner wisuda Program Studi Teknologi Informasi. Ukuran 6x3 meter. Format AI dan PDF untuk percetakan.',
                'status'      => 'done',
                'priority'    => 'high',
                'deadline'    => null,
                'creator_id'  => $ketua->id,
                'assignee_id' => $risa->id,
            ],
        ];

        foreach ($tasks as $data) {
            $task = Task::create($data);

            $activity->logAction(
                $task->id,
                $ketua->id,
                'created',
                "Task \"{$task->title}\" dibuat oleh {$ketua->name}"
            );

            // Log status-specific activity
            if ($task->status === 'in_progress' && $task->assignee_id) {
                $activity->logAction(
                    $task->id,
                    $task->assignee_id,
                    'claimed',
                    "{$task->assignee->name} mulai mengerjakan task ini"
                );
            }

            if ($task->status === 'review' && $task->assignee_id) {
                $activity->logAction(
                    $task->id,
                    $task->assignee_id,
                    'claimed',
                    "{$task->assignee->name} mulai mengerjakan task ini"
                );
                $activity->logAction(
                    $task->id,
                    $task->assignee_id,
                    'status_updated',
                    "Status diubah dari 'in_progress' ke 'review'"
                );
            }

            if ($task->status === 'done' && $task->assignee_id) {
                $activity->logAction(
                    $task->id,
                    $task->assignee_id,
                    'claimed',
                    "{$task->assignee->name} mulai mengerjakan task ini"
                );
                $activity->logAction(
                    $task->id,
                    $task->assignee_id,
                    'status_updated',
                    "Status diubah dari 'in_progress' ke 'review'"
                );
                $activity->logAction(
                    $task->id,
                    $ketua->id,
                    'status_updated',
                    "Status diubah dari 'review' ke 'done' — task selesai diverifikasi"
                );
            }

            // Kirim notifikasi ke assignee jika ada
            if ($task->assignee_id && in_array($task->status, ['in_progress', 'review'])) {
                $task->assignee->notify(new TaskAssigned($task));
            }
        }
    }
}
