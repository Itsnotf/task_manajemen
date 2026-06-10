<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskCommentSeeder extends Seeder
{
    public function run(): void
    {
        $ketua = User::where('email', 'budi@demo.id')->firstOrFail();
        $andi  = User::where('email', 'andi@demo.id')->firstOrFail();
        $risa  = User::where('email', 'risa@demo.id')->firstOrFail();
        $dian  = User::where('email', 'dian@demo.id')->firstOrFail();
        $fajar = User::where('email', 'fajar@demo.id')->firstOrFail();

        $comments = [

            // Task: Video teaser wisuda (review, Andi)
            'Video teaser acara wisuda 2026' => [
                [$ketua,  "Jangan lupa sertakan footage acara wisuda tahun lalu sebagai referensi visual. Tone-nya harus cinematic dan emosional."],
                [$andi,   "Siap kak, sudah saya siapkan footage wisuda 2025. Draft versi pertama sudah bisa dicek di shared drive."],
                [$ketua,  "Bagus sekali. Pastikan resolusi minimal 1080p ya. Saya butuh versi final paling lambat besok siang."],
                [$andi,   "Noted kak. Tinggal color grading dan sound mixing, insyaAllah selesai malam ini."],
            ],

            // Task: Desain poster seminar nasional (overdue, Dian)
            'Desain poster seminar nasional ICT 2026' => [
                [$ketua,  "Dian, poster seminar ini sudah overdue 5 hari. Tim panitia sudah menghubungi saya. Apa kendalanya?"],
                [$dian,   "Mohon maaf kak, sudah 90% selesai tapi masih menunggu konfirmasi susunan pembicara dari panitia. Nomornya belum fix."],
                [$risa,   "Kalau butuh bantuan Dian, aku bisa handle bagian layout typographynya supaya bisa lebih cepat."],
                [$dian,   "Makasih Risa! Aku forward brief-nya ya. Kita kerjakan parallel."],
            ],

            // Task: Infografis imsakiyah (overdue, Risa)
            'Infografis jadwal imsakiyah Ramadan' => [
                [$ketua,  "Risa, infografis ini sudah melewati deadline. Data dari BMKG sudah bisa diakses belum?"],
                [$risa,   "Sudah kak, kemarin baru release dari website resminya. Sedang saya susun sekarang, estimasi 2 jam lagi selesai."],
            ],

            // Task: Template PPT (in_progress, Fajar)
            'Template presentasi PPT standar divisi' => [
                [$fajar,  "Draft v1 sudah selesai kak, ada 15 layout. Bisa dicek di folder shared drive: Divisi Media/Template/PPT-2026-v1"],
                [$ketua,  "Ok nanti saya review. Pastikan color palette sesuai brand guideline terbaru ya, yang di-update Maret kemarin."],
                [$fajar,  "Sudah kak, saya pakai hex #1B4F72 dan #F39C12 sesuai manual brand terbaru."],
            ],
        ];

        foreach ($comments as $taskTitle => $taskComments) {
            $task = Task::where('title', $taskTitle)->first();
            if (! $task) continue;

            foreach ($taskComments as [$author, $body]) {
                TaskComment::create([
                    'task_id' => $task->id,
                    'user_id' => $author->id,
                    'body'    => $body,
                ]);
            }
        }
    }
}
