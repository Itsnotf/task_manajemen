<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskHandoverController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('tasks', TaskController::class);
    Route::post('tasks/{task}/claim', [TaskController::class, 'claim'])->name('tasks.claim');
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    Route::post('tasks/{task}/submit', [TaskController::class, 'submitResult'])->name('tasks.submit');
    Route::resource('handovers', TaskHandoverController::class)->except(['edit', 'update', 'destroy', 'show']);
    Route::post('handovers/{handover}/respond', [TaskHandoverController::class, 'respond'])->name('handovers.respond');

    Route::get('tasks/{task}/export-pdf', [TaskController::class, 'exportPdf'])->name('tasks.exportPdf');
    Route::post('tasks/{task}/comments', [TaskCommentController::class, 'store'])->name('tasks.comments.store');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/read', [NotificationController::class, 'markAllRead'])->name('notifications.read');
});

require __DIR__.'/settings.php';
