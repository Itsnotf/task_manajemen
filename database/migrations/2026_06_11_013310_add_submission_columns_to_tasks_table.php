<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('submission_path')->nullable()->after('attachment_path');
            $table->text('submission_note')->nullable()->after('submission_path');
            $table->timestamp('submitted_at')->nullable()->after('submission_note');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['submission_path', 'submission_note', 'submitted_at']);
        });
    }
};
