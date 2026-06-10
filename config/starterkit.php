<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    'pagination' => 8,

    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

    'roles' => [
        'admin',
        'ketua_bidang',
        'anggota',
    ],

    'default_admin_role' => 'admin',

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    | Format: '<resource> <action>' => '<human readable label>'
    */

    'permissions' => [
        'users index'  => 'View Users',
        'users create' => 'Create User',
        'users edit'   => 'Edit User',
        'users delete' => 'Delete User',
        'roles index'  => 'View Roles',
        'roles create' => 'Create Role',
        'roles edit'   => 'Edit Role',
        'roles delete' => 'Delete Role',
        'tasks index'      => 'View Tasks',
        'tasks create'     => 'Create Task',
        'tasks edit'       => 'Edit Task',
        'tasks delete'     => 'Delete Task',
        'tasks claim'      => 'Claim Open Task',
        'handovers index'  => 'View Handovers',
        'handovers create' => 'Request Task Handover',
        'handovers respond' => 'Approve/Reject Handover',
        'activities index' => 'View Activity Logs',
    ],

];
