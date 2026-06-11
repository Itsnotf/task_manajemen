<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 28px 32px; }

    /* ── Header ── */
    .header-table { width: 100%; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px; margin-bottom: 18px; }
    .header-title  { font-size: 17px; font-weight: bold; color: #111; }
    .header-meta   { font-size: 10px; color: #666; margin-top: 3px; }
    .header-badge-cell { text-align: right; vertical-align: bottom; }

    /* ── Info grid (table-based, DomPDF safe) ── */
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    .info-table td { padding: 6px 10px; font-size: 11px; vertical-align: top; width: 33.33%; }
    .info-table tr:nth-child(odd) td { background: #f9fafb; }
    .info-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
    .info-value { font-size: 11px; font-weight: 600; color: #111; }

    /* ── Badges ── */
    .badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; }
    .badge-open        { background: #e5e7eb; color: #374151; }
    .badge-in_progress { background: #dbeafe; color: #1e40af; }
    .badge-review      { background: #ede9fe; color: #5b21b6; }
    .badge-done        { background: #dcfce7; color: #166534; }
    .badge-high        { background: #fee2e2; color: #991b1b; }
    .badge-medium      { background: #fef3c7; color: #92400e; }
    .badge-low         { background: #f0fdf4; color: #166534; }
    .badge-overdue     { background: #fee2e2; color: #991b1b; }

    /* ── Section title ── */
    .section-title { font-size: 12px; font-weight: bold; color: #111; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; }

    /* ── Description box ── */
    .desc-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px 12px; margin-bottom: 18px; font-size: 11px; line-height: 1.7; color: #374151; white-space: pre-wrap; }

    /* ── Submission box ── */
    .submission-box { border: 1px solid #d1fae5; background: #f0fdf4; padding: 10px 12px; margin-bottom: 18px; }
    .submission-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
    .submission-value { font-size: 11px; color: #111; }

    /* ── Activity table ── */
    .activity-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .activity-table th { background: #f3f4f6; text-align: left; padding: 7px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; color: #6b7280; border: 1px solid #e5e7eb; }
    .activity-table td { padding: 7px 10px; font-size: 10.5px; border: 1px solid #e5e7eb; vertical-align: top; line-height: 1.5; }
    .activity-table tr:nth-child(even) td { background: #f9fafb; }
    .col-time   { width: 115px; white-space: nowrap; color: #555; }
    .col-user   { width: 110px; font-weight: 500; }
    .col-action { width: 95px; }
    .col-desc   { }
    .action-pill { display: inline-block; padding: 1px 6px; border-radius: 2px; font-size: 9px; font-weight: bold; text-transform: uppercase; background: #e0e7ff; color: #3730a3; }

    /* ── Handover table ── */
    .handover-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .handover-table th { background: #f3f4f6; text-align: left; padding: 7px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; color: #6b7280; border: 1px solid #e5e7eb; }
    .handover-table td { padding: 7px 10px; font-size: 10.5px; border: 1px solid #e5e7eb; vertical-align: top; line-height: 1.5; }
    .handover-table tr:nth-child(even) td { background: #f9fafb; }

    /* ── Footer ── */
    .footer { border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 9px; color: #9ca3af; }
    .footer-table { width: 100%; }
    .footer-left { text-align: left; }
    .footer-right { text-align: right; }
    .empty-msg { color: #9ca3af; font-size: 11px; font-style: italic; padding: 8px 0; }
    .overdue-text { color: #991b1b; font-weight: 600; }
</style>
</head>
<body>

{{-- ── HEADER ── --}}
<table class="header-table"><tr>
    <td>
        <div class="header-title">{{ $task->title }}</div>
        <div class="header-meta">
            Activity Log Export &nbsp;&bull;&nbsp;
            Diekspor pada {{ now()->timezone('Asia/Jakarta')->format('d M Y, H:i') }} WIB
        </div>
    </td>
    <td class="header-badge-cell">
        <span class="badge badge-{{ $task->status }}">{{ strtoupper(str_replace('_', ' ', $task->status)) }}</span>
        &nbsp;
        <span class="badge badge-{{ $task->priority }}">{{ strtoupper($task->priority) }}</span>
        @if($task->deadline && \Carbon\Carbon::parse($task->deadline)->isPast() && $task->status !== 'done')
            &nbsp;<span class="badge badge-overdue">OVERDUE</span>
        @endif
    </td>
</tr></table>

{{-- ── INFO GRID (table-based, DomPDF safe) ── --}}
<table class="info-table">
    <tr>
        <td>
            <div class="info-label">Pembuat</div>
            <div class="info-value">{{ $task->creator->name ?? '—' }}</div>
        </td>
        <td>
            <div class="info-label">Pemegang Saat Ini</div>
            <div class="info-value">{{ $task->assignee->name ?? 'Unassigned' }}</div>
        </td>
        <td>
            <div class="info-label">Deadline</div>
            <div class="info-value {{ ($task->deadline && \Carbon\Carbon::parse($task->deadline)->isPast() && $task->status !== 'done') ? 'overdue-text' : '' }}">
                {{ $task->deadline ? \Carbon\Carbon::parse($task->deadline)->format('d M Y') : '—' }}
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="info-label">Tanggal Dibuat</div>
            <div class="info-value">{{ $task->created_at->format('d M Y, H:i') }}</div>
        </td>
        <td>
            <div class="info-label">Terakhir Diperbarui</div>
            <div class="info-value">{{ $task->updated_at->format('d M Y, H:i') }}</div>
        </td>
        <td>
            <div class="info-label">Jumlah Aktivitas</div>
            <div class="info-value">{{ $task->activities->count() }} entri</div>
        </td>
    </tr>
</table>

{{-- ── DESKRIPSI ── --}}
@if($task->description)
<p class="section-title">Deskripsi Task</p>
<div class="desc-box">{{ $task->description }}</div>
@endif

{{-- ── HASIL KERJA (jika ada submission) ── --}}
@if($task->submission_path || $task->submission_note)
<p class="section-title">Hasil Kerja yang Diserahkan</p>
<div class="submission-box">
    @if($task->submission_note)
    <div style="margin-bottom: 6px;">
        <div class="submission-label">Catatan / Link</div>
        <div class="submission-value">{{ $task->submission_note }}</div>
    </div>
    @endif
    @if($task->submission_path)
    <div>
        <div class="submission-label">File</div>
        <div class="submission-value">{{ basename($task->submission_path) }}</div>
    </div>
    @endif
    @if($task->submitted_at)
    <div style="margin-top: 6px;">
        <div class="submission-label">Diserahkan Pada</div>
        <div class="submission-value">{{ \Carbon\Carbon::parse($task->submitted_at)->format('d M Y, H:i') }} WIB</div>
    </div>
    @endif
</div>
@endif

{{-- ── RIWAYAT HANDOVER (jika ada) ── --}}
@if($task->handovers && $task->handovers->count() > 0)
<p class="section-title">Riwayat Handover ({{ $task->handovers->count() }} entri)</p>
<table class="handover-table">
    <thead>
        <tr>
            <th style="width:100px">Tanggal</th>
            <th style="width:100px">Dari</th>
            <th style="width:100px">Kepada</th>
            <th style="width:70px">Status</th>
            <th>Catatan</th>
        </tr>
    </thead>
    <tbody>
        @foreach($task->handovers as $handover)
        <tr>
            <td>{{ \Carbon\Carbon::parse($handover->created_at)->format('d M Y') }}</td>
            <td>{{ $handover->fromUser->name ?? '—' }}</td>
            <td>{{ $handover->toUser->name ?? '—' }}</td>
            <td><span class="badge badge-{{ $handover->status === 'approved' ? 'done' : ($handover->status === 'rejected' ? 'high' : 'in_progress') }}">{{ strtoupper($handover->status) }}</span></td>
            <td>
                {{ $handover->notes ?? '—' }}
                @if($handover->rejection_reason)
                    <br><span style="color:#991b1b;font-size:9.5px;">Alasan tolak: {{ $handover->rejection_reason }}</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- ── ACTIVITY LOG ── --}}
<p class="section-title">Activity Log ({{ $task->activities->count() }} entri)</p>

@if($task->activities->count() === 0)
<p class="empty-msg">Belum ada aktivitas tercatat.</p>
@else
<table class="activity-table">
    <thead>
        <tr>
            <th class="col-time">Waktu</th>
            <th class="col-user">User</th>
            <th class="col-action">Aksi</th>
            <th class="col-desc">Deskripsi</th>
        </tr>
    </thead>
    <tbody>
        @foreach($task->activities as $activity)
        <tr>
            <td class="col-time">{{ \Carbon\Carbon::parse($activity->created_at)->timezone('Asia/Jakarta')->format('d M Y H:i') }}</td>
            <td class="col-user">{{ $activity->user->name ?? '—' }}</td>
            <td class="col-action"><span class="action-pill">{{ str_replace('_', ' ', $activity->action_type) }}</span></td>
            <td class="col-desc">{{ $activity->description }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- ── FOOTER ── --}}
<div class="footer">
    <table class="footer-table"><tr>
        <td class="footer-left">Task Management System &mdash; Politeknik Negeri Sriwijaya, Divisi Media &amp; Komunikasi</td>
        <td class="footer-right">Task ID: #{{ $task->id }}</td>
    </tr></table>
</div>

</body>
</html>
