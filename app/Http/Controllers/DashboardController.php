<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return inertia('dashboard/admin', $this->dashboardService->adminStats());
        } elseif ($user->hasRole('ketua_bidang')) {
            return inertia('dashboard/ketua', $this->dashboardService->ketuaStats($user));
        }

        return inertia('dashboard/anggota', $this->dashboardService->memberStats($user));
    }
}
