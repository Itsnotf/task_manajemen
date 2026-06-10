import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { BreadcrumbItem, Task } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft } from 'lucide-react';

interface Props {
    task: Task;
}

export default function TaskEditPage({ task }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        attachment_path: null as File | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tasks',
            href: '/tasks',
        },
        {
            title: task.title,
            href: `/tasks/${task.id}`,
        },
        {
            title: 'Edit',
            href: `/tasks/${task.id}/edit`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/tasks/${task.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Task" />
            <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="flex flex-col gap-6 p-4"
            >
                <div className="grid gap-6 max-w-2xl">

                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            type="text"
                            required
                            autoFocus
                            placeholder="Task title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            required
                            placeholder="Task description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={5}
                            disabled={processing}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={data.priority} onValueChange={(value : any) => setData('priority', value)} disabled={processing}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.priority} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                            id="deadline"
                            type="date"
                            value={data.deadline}
                            onChange={(e) => setData('deadline', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.deadline} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="attachment_path">Attachment (PDF, DOC, ZIP - Max 5MB)</Label>
                        {task.attachment_path && (
                            <p className="text-sm text-muted-foreground">
                                Current: <a href={`/storage/${task.attachment_path}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">View File</a>
                            </p>
                        )}
                        <Input
                            id="attachment_path"
                            type="file"
                            onChange={(e) => setData('attachment_path', e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx,.zip"
                            disabled={processing}
                        />
                        <InputError message={errors.attachment_path} />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? <Spinner /> : 'Update Task'}
                        </Button>
                        <Link href={`/tasks/${task.id}`}>
                            <Button type="button" variant="outline" disabled={processing}>
                                <ChevronLeft className="size-4" />
                                Cancel
                            </Button>
                        </Link>
                    </div>

                </div>
            </form>
        </AppLayout>
    );
}
