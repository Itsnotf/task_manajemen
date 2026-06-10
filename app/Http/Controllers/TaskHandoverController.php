<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\TaskHandover;
use App\Http\Requests\StoreTaskHandoverRequest;
use App\Services\TaskHandoverService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TaskHandoverController extends Controller implements HasMiddleware
{
    public function __construct(private TaskHandoverService $taskHandoverService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:handovers index',  only: ['index']),
            new Middleware('permission:handovers create', only: ['create', 'store']),
            new Middleware('permission:handovers respond', only: ['respond']),
        ];
    }

    public function index(Request $request)
    {
        return inertia('handovers/index', [
            'handovers' => $this->taskHandoverService->getAll($request->search),
            'filters'   => $request->only('search'),
        ]);
    }

    public function create()
    {
        return inertia('handovers/create', [
            'tasks' => Task::where('creator_id', Auth::id())->orWhere('assignee_id', Auth::id())->get(),
            'users' => User::where('id', '!=', Auth::id())->get(),
        ]);
    }

    public function store(StoreTaskHandoverRequest $request)
    {
        $this->taskHandoverService->create($request->validated());

        return redirect()->route('handovers.index')->with('success', 'Handover request created successfully');
    }

    public function respond(Request $request, string $id)
    {
        $request->validate(['action' => 'required|in:approve,reject']);

        if ($request->action === 'approve') {
            $this->taskHandoverService->approve($id);
            $message = 'Handover approved successfully';
        } else {
            $this->taskHandoverService->reject($id);
            $message = 'Handover rejected successfully';
        }

        return redirect()->back()->with('success', $message);
    }
}
