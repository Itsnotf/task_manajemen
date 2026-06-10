import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { BreadcrumbItem, Task, User } from '@/types';
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


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Handovers',
        href: '/handovers',
    },
    {
        title: 'Create',
        href: '/handovers/create',
    },
];

interface Props {
    tasks: Task[];
    users: User[];
}

export default function HandoverCreatePage({ tasks, users }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        task_id: '',
        to_user_id: '',
        notes: '',
        proof_path: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/handovers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Request Handover" />
            <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="flex flex-col gap-6 p-4"
            >
                <div className="grid gap-6 max-w-2xl">

                    <div className="grid gap-2">
                        <Label htmlFor="task_id">Task</Label>
                        <Select value={data.task_id} onValueChange={(value) => setData('task_id', value)} disabled={processing}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a task" />
                            </SelectTrigger>
                            <SelectContent>
                                {tasks.length === 0 ? (
                                    <div className="p-3 text-sm text-muted-foreground text-center">
                                        Tidak ada task aktif yang bisa di-handover.
                                    </div>
                                ) : (
                                    tasks.map((task) => (
                                        <SelectItem key={task.id} value={task.id.toString()}>
                                            {task.title} — {task.status}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.task_id} />
                        <p className="text-xs text-muted-foreground">
                            Select the task you want to handover
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="to_user_id">Handover To</Label>
                        <Select value={data.to_user_id} onValueChange={(value) => setData('to_user_id', value)} disabled={processing}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select recipient" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.to_user_id} />
                        <p className="text-xs text-muted-foreground">
                            Who will receive this task handover
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any notes or instructions for the handover"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={4}
                            disabled={processing}
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="proof_path">Proof File (Optional - PDF, JPG, PNG - Max 5MB)</Label>
                        <Input
                            id="proof_path"
                            type="file"
                            onChange={(e) => setData('proof_path', e.target.files?.[0] || null)}
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={processing}
                        />
                        <InputError message={errors.proof_path} />
                        <p className="text-xs text-muted-foreground">
                            Upload evidence or documentation supporting this handover
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? <Spinner /> : 'Request Handover'}
                        </Button>
                        <Link href="/handovers">
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
