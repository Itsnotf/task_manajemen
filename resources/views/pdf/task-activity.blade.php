<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 30px; }

    .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .header .meta { font-size: 11px; color: #555; }

    .info-grid { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
    .info-item { flex: 1; min-width: 120px; }
    .info-item .key { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .info-item .val { font-size: 12px; font-weight: 600; }

    .badge { display: inline-block; padding: 1px 8px; border-radius: 3px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
    .badge-open        { background: #e5e7eb; color: #374151; }
    .badge-in_progress { background: #dbeafe; color: #1d4ed8; }
    .badge-review      { background: #ede9fe; color: #6d28d9; }
    .badge-done        { background: #dcfce7; color: #166534; }
    .badge-high        { background: #fee2e2; color: #991b1b; }
    .badge-medium      { background: #fef9c3; color: #854d0e; }
    .badge-low         { background: #f0fdf4; color: #166534; }

    .section-title { font-size: 13px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f3f4f6; text-align: left; padding: 6px 10px; font-size: 10px; text-transform: uppercase; color: #6b7280; border: 1px solid #e5e7eb; }
    td { padding: 6px 10px; font-size: 11px; border: 1px solid #e5e7eb; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }

    .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 10px; color: #9ca3af; text-align: right; }

    .description-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; margin-bottom: 20px; font-size: 11px; line-height: 1.6; white-space: pre-wrap; }
</style>
</head>
<body>

<div class="header">
    <h1>{{ $task->title }}</h1>
    <p class="meta">Activity Log Export &nbsp;|&nbsp; Diekspor pada {{ now()->format('d M Y, H:i') }} WIB</p>
</div>

<div class="info-grid">
    <div class="info-item">
        <div class="key">Status</div>
        <div class="val">
            <span class="badge badge-{{ $task->status }}">{{ str_replace('_', ' ', $task->status) }}</span>
        </div>
    </div>
    <div class="info-item">
        <div class="key">Prioritas</div>
        <div class="val">
            <span class="badge badge-{{ $task->priority }}">{{ $task->priority }}</span>
        </div>
    </div>
    <div class="info-item">
        <div class="key">Pembuat</div>
        <div class="val">{{ $task->creator->name ?? '—' }}</div>
    </div>
    <div class="info-item">
        <div class="key">Pemegang</div>
        <div class="val">{{ $task->assignee->name ?? 'Unassigned' }}</div>
    </div>
    <div class="info-item">
        <div class="key">Deadline</div>
        <div class="val">{{ $task->deadline ? \Carbon\Carbon::parse($task->deadline)->format('d M Y') : '—' }}</div>
    </div>
    <div class="info-item">
        <div class="key">Dibuat</div>
        <div class="val">{{ $task->created_at->format('d M Y') }}</div>
    </div>
</div>

@if($task->description)
<p class="section-title">Deskripsi</p>
<div class="description-box">{{ $task->description }}</div>
@endif

<p class="section-title">Activity Log ({{ $task->activities->count() }} entri)</p>

@if($task->activities->count() === 0)
<p style="color:#9ca3af;font-size:11px;">Belum ada aktivitas tercatat.</p>
@else
<table>
    <thead>
        <tr>
            <th style="width:130px">Waktu</th>
            <th style="width:120px">User</th>
            <th style="width:100px">Aksi</th>
            <th>Deskripsi</th>
        </tr>
    </thead>
    <tbody>
        @foreach($task->activities as $activity)
        <tr>
            <td>{{ \Carbon\Carbon::parse($activity->created_at)->format('d M Y H:i') }}</td>
            <td>{{ $activity->user->name ?? '—' }}</td>
            <td>{{ str_replace('_', ' ', $activity->action_type) }}</td>
            <td>{{ $activity->description }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

<div class="footer">
    Task Management System &mdash; Politeknik Negeri Sriwijaya, Divisi Media &amp; Komunikasi
</div>

</body>
</html>
