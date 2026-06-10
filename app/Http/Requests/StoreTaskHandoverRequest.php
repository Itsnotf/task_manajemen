<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskHandoverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task_id'    => 'required|exists:tasks,id',
            'to_user_id' => 'required|exists:users,id',
            'notes'      => 'nullable|string',
            'proof_path' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
        ];
    }
}
