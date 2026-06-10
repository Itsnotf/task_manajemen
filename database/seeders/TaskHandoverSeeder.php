<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskHandover;
use App\Models\User;
use App\Notifications\HandoverRequested;
use App\Services\TaskActivityService;
use Illuminate\Database\Seeder;

class TaskHandoverSeeder extends Seeder
{
    public function run(): void
    {
        $activity = app(TaskActivityService::class);

        $andi  = User::where('email', 'andi@polsri.ac.id')->firstOrFail();
        $risa  = User::where('email', 'risa@polsri.ac.id')->firstOrFail();
        $dian  = User::where('email', 'dian@polsri.ac.id')->firstOrFail();
        $fajar = User::where('email', 'fajar@polsri.ac.id')->firstOrFail();

        // Ambil task berdasarkan judul untuk fleksibilitas urutan seed
        $videoTeaser     = Task::where('title', 'like', '%teaser acara wisuda%')->first();
        $posterSeminar   = Task::where('title', 'like', '%poster seminar nasional%')->first();
        $motionGraphic   = Task::where('title', 'like', '%Motion graphic intro%')->first();
        $imsakiyah       = Task::where('title', 'like', '%imsakiyah%')->first();
        $instaStory      = Task::where('title', 'like', '%Instagram Story 5 hari%')->first();

        $handovers = [

            // 1. Andi → Risa untuk "Video teaser wisuda" — PENDING
            [
                'task_id'      => $videoTeaser?->id,
                'from_user_id' => $andi->id,
                'to_user_id'   => $risa->id,
                'status'       => 'pending',
                'notes'        => 'Saya ada keperluan mendadak dan tidak bisa melanjutkan task review ini tepat waktu. Mohon bantuan Risa untuk finalisasi.',
                'proof_path'   => null,
                'rejection_reason' => null,
                'recipient'    => $risa,
                'from_name'    => $andi->name,
            ],

            // 2. Dian → Fajar untuk "Desain poster seminar" (overdue) — PENDING
            [
                'task_id'      => $posterSeminar?->id,
                'from_user_id' => $dian->id,
                'to_user_id'   => $fajar->id,
                'status'       => 'pending',
                'notes'        => 'Task ini sudah overdue dan saya butuh bantuan. Fajar punya skill desain poster yang lebih cocok untuk tema seminar ini.',
                'proof_path'   => null,
                'rejection_reason' => null,
                'recipient'    => $fajar,
                'from_name'    => $dian->name,
            ],

            // 3. Fajar → Andi untuk "Motion graphic" — APPROVED (historis)
            [
                'task_id'      => $motionGraphic?->id,
                'from_user_id' => $fajar->id,
                'to_user_id'   => $andi->id,
                'status'       => 'approved',
                'notes'        => 'Fajar sedang sakit, mohon izin handover ke Andi yang sudah familiar dengan motion graphic.',
                'proof_path'   => null,
                'rejection_reason' => null,
                'recipient'    => null,
                'from_name'    => $fajar->name,
            ],

            // 4. Risa → Dian untuk "Infografis imsakiyah" (overdue) — REJECTED
            [
                'task_id'      => $imsakiyah?->id,
                'from_user_id' => $risa->id,
                'to_user_id'   => $dian->id,
                'status'       => 'rejected',
                'notes'        => 'Task ini sudah overdue 3 hari, saya perlu bantuan segera.',
                'proof_path'   => null,
                'rejection_reason' => 'Maaf Risa, task saya saat ini juga sudah full. Desain poster seminar yang saya pegang juga sudah overdue. Coba koordinasi langsung dengan kak Budi.',
                'recipient'    => null,
                'from_name'    => $risa->name,
            ],

            // 5. Andi → Risa untuk "Konten Instagram Story" (overdue) — REJECTED
            [
                'task_id'      => $instaStory?->id,
                'from_user_id' => $andi->id,
                'to_user_id'   => $risa->id,
                'status'       => 'rejected',
                'notes'        => 'Konten ini sudah melewati deadline kemarin. Tolong bantu ya Risa.',
                'proof_path'   => null,
                'rejection_reason' => 'Mohon maaf, saya sedang mengerjakan task PKM yang deadlinenya 2 minggu lagi dan membutuhkan fokus penuh. Tidak bisa menerima handover saat ini.',
                'recipient'    => null,
                'from_name'    => $andi->name,
            ],
        ];

        foreach ($handovers as $data) {
            $recipient = $data['recipient'];
            $fromName  = $data['from_name'];
            $taskId    = $data['task_id'];

            unset($data['recipient'], $data['from_name']);

            if (! $taskId) {
                continue;
            }

            $handover = TaskHandover::create($data);

            // Log activity pada task
            $activity->logAction(
                $taskId,
                $data['from_user_id'],
                'handover_requested',
                "{$fromName} mengajukan permintaan handover task"
            );

            if ($data['status'] === 'approved') {
                $activity->logAction(
                    $taskId,
                    $data['to_user_id'],
                    'handover_approved',
                    "Handover disetujui oleh penerima"
                );
            }

            if ($data['status'] === 'rejected') {
                $activity->logAction(
                    $taskId,
                    $data['to_user_id'],
                    'handover_rejected',
                    "Handover ditolak: {$data['rejection_reason']}"
                );
            }

            // Kirim notifikasi ke penerima untuk handover pending
            if ($data['status'] === 'pending' && $recipient) {
                $recipient->notify(new HandoverRequested($handover->load('task')));
            }
        }
    }
}
