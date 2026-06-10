<?php

namespace App\Http\Controllers;

use App\Models\TaskActivity;
use App\Http\Requests\StoreTaskActivityRequest;
use App\Http\Requests\UpdateTaskActivityRequest;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TaskActivityController extends Controller implements HasMiddleware
{
    public function __construct(private TaskActivityService $taskActivityService) {}

    // Sesuaikan nama resource dengan permission di config/starterkit.php
    public static function middleware(): array
    {
        return [
            new Middleware('permission:taskActivity index',  only: ['index']),
            new Middleware('permission:taskActivity create', only: ['create', 'store']),
            new Middleware('permission:taskActivity edit',   only: ['edit', 'update']),
            new Middleware('permission:taskActivity delete', only: ['destroy']),
        ];
    }

    public function index(Request $request)
    {
        //
    }

    public function create()
    {
        //
    }

    public function store(StoreTaskActivityRequest $request)
    {
        //
    }

    public function show(TaskActivity $taskActivity)
    {
        //
    }

    public function edit(TaskActivity $taskActivity)
    {
        //
    }

    public function update(UpdateTaskActivityRequest $request, TaskActivity $taskActivity)
    {
        //
    }

    public function destroy(TaskActivity $taskActivity)
    {
        //
    }
}
