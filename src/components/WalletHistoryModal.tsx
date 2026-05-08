import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Wallet, Loader2 } from 'lucide-react';

interface LedgerEntry {
    id: string;
    amount: number;
    description: string;
    type: string;
    created_at: string;
}

const WalletHistoryModal = ({ open, onOpenChange, userId }: { open: boolean, onOpenChange: (o: boolean) => void, userId: string }) => {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && userId) {
            const fetchLedger = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('wallet_ledger')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setEntries(data as LedgerEntry[]);
                }
                setLoading(false);
            };
            fetchLedger();
        }
    }, [open, userId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-bebas text-2xl flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-primary" />
                        TRANSACTION HISTORY
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto pr-2 space-y-3 mt-4">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                    ) : entries.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground font-barlow italic">No transactions yet.</p>
                    ) : (
                        entries.map((entry) => (
                            <div key={entry.id} className="bg-background border border-border rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${entry.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {entry.amount > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-foreground font-medium">{entry.description}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{format(new Date(entry.created_at), 'd MMM yyyy, HH:mm')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-mono text-sm ${entry.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {entry.amount > 0 ? '+' : ''}£{Math.abs(entry.amount).toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-mono">{entry.type}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WalletHistoryModal;
