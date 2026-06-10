import { TaskActivity } from '@/types';
import { format } from 'date-fns';
import { Activity, CheckCircle2, FileText, HandshakeIcon, Trash2 } from 'lucide-react';

interface Props {
    activities: TaskActivity[];
}

const getActionIcon = (actionType: string) => {
    switch (actionType) {
        case 'created':
            return <FileText className="size-4" />;
        case 'claimed':
            return <CheckCircle2 className="size-4" />;
        case 'status_updated':
            return <Activity className="size-4" />;
        case 'handover_requested':
            return <HandshakeIcon className="size-4" />;
        case 'handover_approved':
            return <CheckCircle2 className="size-4" />;
        case 'handover_rejected':
            return <Trash2 className="size-4" />;
        default:
            return <Activity className="size-4" />;
    }
};

const getActionColor = (actionType: string) => {
    switch (actionType) {
        case 'created':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
        case 'claimed':
            return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
        case 'status_updated':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200';
        case 'handover_requested':
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200';
        case 'handover_approved':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200';
        case 'handover_rejected':
            return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
    }
};

export default function ActivityFeed({ activities }: Props) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground">
                No activities yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                        <div className={`rounded-full p-2 ${getActionColor(activity.action_type)}`}>
                            {getActionIcon(activity.action_type)}
                        </div>
                        {index < activities.length - 1 && (
                            <div className="w-0.5 h-12 bg-border my-2"></div>
                        )}
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 py-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-sm">
                                    {activity.user?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.description}
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                {format(new Date(activity.created_at), 'MMM d, HH:mm')}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
