import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Link, Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/components/delete-button';
import { PlusCircle, FileText } from 'lucide-react';
import { BreadcrumbItem, SharedData, TaskHandover } from '@/types';
import { toast } from 'sonner';
import hasAnyPermission from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


interface Props {
    handovers: {
        data: TaskHandover[];
        links: any[];
    };
    filters: {
        search?: string;
    };
    flash?: {
        success?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Handovers',
        href: '/handovers',
    },
];

export default function HandoversPage({ handovers, filters, flash }: Props) {
    const user = usePage<SharedData>().props.auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const [shownMessages] = useState(new Set());
    const [rejectDialog, setRejectDialog] = useState<{
        open: boolean;
        handoverId: number | null;
        reason: string;
    }>({ open: false, handoverId: null, reason: '' });

    useEffect(() => {
        if (flash?.success && !shownMessages.has(flash.success)) {
            toast.success(flash.success);
            shownMessages.add(flash.success);
        }
    }, [flash?.success]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/handovers', { search }, { preserveState: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const handleApprove = (id: number) => {
        router.post(`/handovers/${id}/respond`, { action: 'approve' }, {
            preserveScroll: true,
        });
    };

    const handleRejectSubmit = () => {
        if (!rejectDialog.handoverId || !rejectDialog.reason.trim()) return;
        router.post(`/handovers/${rejectDialog.handoverId}/respond`, {
            action: 'reject',
            rejection_reason: rejectDialog.reason,
        }, {
            preserveScroll: true,
            onSuccess: () => setRejectDialog({ open: false, handoverId: null, reason: '' }),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Handovers" />

            <div className="p-4 space-y-4">

                {/* Search Bar & Create Button */}
                <div className='flex space-x-1'>
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/3">
                        <Input
                            placeholder="Search handovers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button variant='outline' type="submit">Search</Button>
                    </form>
                    {hasAnyPermission(["handovers create"]) && (
                        <Link href="/handovers/create">
                            <Button variant='default' className='group flex items-center'>
                                <PlusCircle className='group-hover:rotate-90 transition-all' />
                                Request Handover</Button>
                        </Link>
                    )}
                </div>

                {/* Handovers Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Alasan Tolak</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {handovers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        <div className='flex flex-col items-center gap-2'>
                                            <FileText className='size-8 opacity-50' />
                                            <p>No handovers found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                handovers.data.map((handover) => (
                                    <TableRow key={handover.id}>
                                        <TableCell className="font-medium max-w-xs truncate">
                                            {handover.task?.title}
                                        </TableCell>
                                        <TableCell>{handover.from_user?.name}</TableCell>
                                        <TableCell>{handover.to_user?.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(handover.status) as any}>
                                                {handover.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-xs">
                                            {handover.rejection_reason ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(handover.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex gap-1'>
                                                {handover.status === 'pending' && handover.to_user_id === user.id && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleApprove(handover.id)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => setRejectDialog({
                                                                open: true,
                                                                handoverId: handover.id,
                                                                reason: '',
                                                            })}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {handover.proof_path && (
                                                    <a href={`/storage/${handover.proof_path}`} target="_blank" rel="noopener noreferrer">
                                                        <Button size="sm" variant="outline">View Proof</Button>
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {handovers.links && handovers.links.length > 0 && (
                    <div className="flex justify-center gap-1">
                        {handovers.links.map((link: any, i) => (
                            link.url ? (
                                <Button
                                    key={i}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => router.visit(link.url, { preserveScroll: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <Button key={i} variant="ghost" size="sm" disabled>
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            )
                        ))}
                    </div>
                )}
            </div>
            <Dialog
                open={rejectDialog.open}
                onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Permintaan Handover</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                        <Label htmlFor="rejection_reason">
                            Alasan Penolakan <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="rejection_reason"
                            placeholder="Contoh: Saya sedang overload tugas lain hingga akhir bulan..."
                            value={rejectDialog.reason}
                            onChange={(e) => setRejectDialog(prev => ({
                                ...prev, reason: e.target.value
                            }))}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            Alasan ini akan terlihat oleh pemohon handover.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectDialog({ open: false, handoverId: null, reason: '' })}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={!rejectDialog.reason.trim()}
                            onClick={handleRejectSubmit}
                        >
                            Tolak Handover
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
