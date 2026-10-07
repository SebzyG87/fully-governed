import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PoundSterling, TrendingUp, Music, ShoppingBag, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";

interface EarningStats {
    totalSales: number;
    totalRevenue: number;
    uniqueBuyers: number;
    salesThisMonth: number;
}

const Earnings = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<EarningStats>({
        totalSales: 0,
        totalRevenue: 0,
        uniqueBuyers: 0,
        salesThisMonth: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentSales, setRecentSales] = useState<any[]>([]);

    useSEO({
        title: "Earnings Dashboard",
        description: "Track your royalties, sales, and payouts from the Digital Vinyl platform.",
    });

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user) return;

            try {
                // Fetch all tracks by this artist to get their IDs
                const { data: artistTracks } = await supabase
                    .from('music_tracks')
                    .select('id, title, price')
                    .eq('user_id', user.id);

                const trackIds = artistTracks?.map(t => t.id) || [];

                if (trackIds.length > 0) {
                    // Fetch purchases for these tracks
                    const { data: sales, error } = await supabase
                        .from('purchases')
                        .select('*, profiles!purchases_buyer_id_fkey(full_name)')
                        .in('item_id', trackIds)
                        .eq('item_type', 'digital_vinyl')
                        .eq('status', 'completed');

                    if (!error && sales) {
                        const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);
                        const now = new Date();
                        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                        const monthlySales = sales.filter(s => s.created_at >= thisMonthStart).length;

                        setStats({
                            totalSales: sales.length,
                            totalRevenue,
                            uniqueBuyers: new Set(sales.map((sale) => sale.buyer_id).filter(Boolean)).size,
                            salesThisMonth: monthlySales
                        });

                        setRecentSales(sales.slice(0, 5));
                    }
                }
            } catch (err) {
                console.error("Error fetching earnings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <div className="grain-overlay" />
            
            <div className="container pt-32 pb-16 space-y-12">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <p className="font-mono text-xs tracking-[0.3em] text-primary mb-2 uppercase">Financial Overview</p>
                        <h1 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider">EARNINGS & ROYALTIES</h1>
                        <p className="text-muted-foreground font-barlow mt-2 max-w-xl">
                            Track your sales performance and manage your artist payouts.
                        </p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <PoundSterling className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-barlow uppercase">Artist share</p>
                            <p className="text-sm font-barlow text-foreground">Set by signed agreement</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">TOTAL SALES</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-mono">{stats.totalSales}</div>
                            <p className="text-xs text-muted-foreground font-barlow flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                {stats.salesThisMonth} this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">GROSS REVENUE</CardTitle>
                            <Activity className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-mono">£{stats.totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground font-barlow mt-1 uppercase">Before split</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">ARTIST SHARE</CardTitle>
                            <PoundSterling className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-barlow text-emerald-500">Per signed agreement</div>
                            <p className="text-xs text-muted-foreground font-barlow mt-1 uppercase">Share calculation is not connected</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">FAN BASE</CardTitle>
                            <Music className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-mono">{stats.uniqueBuyers}</div>
                            <p className="text-xs text-muted-foreground font-barlow mt-1 uppercase">Unique collectors</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Sales Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="font-bebas text-2xl text-foreground tracking-wider uppercase">RECENT TRANSACTIONS</h2>
                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left p-4 font-barlow font-medium text-muted-foreground">DATE</th>
                                        <th className="text-left p-4 font-barlow font-medium text-muted-foreground">BUYER</th>
                                        <th className="text-left p-4 font-barlow font-medium text-muted-foreground">TYPE</th>
                                        <th className="text-right p-4 font-barlow font-medium text-muted-foreground">AMOUNT</th>
                                        <th className="text-right p-4 font-barlow font-medium text-muted-foreground">SHARE</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array.from({ length: 3 }).map((_, i) => (
                                            <tr key={i}>
                                                <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                                                <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                                                <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="p-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                                <td className="p-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : recentSales.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-muted-foreground font-barlow">No sales recorded yet.</td>
                                        </tr>
                                    ) : (
                                        recentSales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-mono text-xs">{new Date(sale.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 font-barlow text-foreground">{sale.profiles?.full_name || "Guest User"}</td>
                                                <td className="p-4">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase font-mono">
                                                        Vinyl
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-mono text-muted-foreground">£{Number(sale.amount).toFixed(2)}</td>
                                                <td className="p-4 text-right font-mono text-muted-foreground">Per agreement</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        <h2 className="font-bebas text-2xl text-foreground tracking-wider uppercase">REVENUE BREAKDOWN</h2>
                        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                            <h3 className="font-bebas text-lg text-foreground">ARTIST PAYMENT TERMS</h3>
                            <p className="text-sm text-muted-foreground font-barlow">Your share is set out in the signed agreement for each product. This dashboard currently shows gross sales only; it does not calculate or issue artist payouts.</p>
                            <Button className="w-full font-bebas tracking-wide" disabled>
                                PAYOUTS NOT CONNECTED
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Earnings;
