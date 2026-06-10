import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: Permission[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    permissions?: string[];
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    roles?: Role;
    [key: string]: unknown; // This allows for additional properties...
}

    export interface Permission {
        id: number;
        name: string;
        label: string;
        guard_name: string;
        created_at: string;
        updated_at: string;
        [key: string]: unknown;
    }

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    deadline: string | null;
    attachment_path: string | null;
    creator_id: number;
    assignee_id: number | null;
    creator?: User;
    assignee?: User;
    handovers?: TaskHandover[];
    activities?: TaskActivity[];
    created_at: string;
    updated_at: string;
}

export interface TaskHandover {
    id: number;
    task_id: number;
    from_user_id: number;
    to_user_id: number;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    proof_path: string | null;
    task?: Task;
    from_user?: User;
    to_user?: User;
    created_at: string;
    updated_at: string;
}

export interface TaskActivity {
    id: number;
    task_id: number;
    user_id: number;
    action_type: string;
    description: string;
    user?: User;
    created_at: string;
}
