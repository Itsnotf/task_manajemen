<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'           => 'required|string|max:255',
            'description'     => 'required|string',
            'priority'        => 'required|in:low,medium,high',
            'deadline'        => 'nullable|date|after_or_equal:today',
            'attachment_path' => 'nullable|file|mimes:pdf,doc,docx,zip|max:5120',
        ];
    }
}
