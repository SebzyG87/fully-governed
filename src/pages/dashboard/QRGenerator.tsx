import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode as QrIcon, Link as LinkIcon, AlertCircle, Plus, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const genSlug = () => Math.random().toString(36).substring(2, 10).toUpperCase();

const QRGenerator = () => {
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const defaultUrl = profile?.full_name
        ? `${window.location.origin}/artists/${profile.full_name.replace(/\s+/g, '-').toLowerCase()}`
        : window.location.origin;

    const [url, setUrl] = useState(defaultUrl);
    const qrRef = useRef<SVGSVGElement>(null);

    // Unlock link form
    const [unlockTitle, setUnlockTitle] = useState('');
    const [unlockDesc, setUnlockDesc] = useState('');
    const [unlockType, setUnlockType] = useState<'track' | 'video' | 'message' | 'exclusive'>('track');
    const [unlockFileUrl, setUnlockFileUrl] = useState('');
    const [creatingUnlock, setCreatingUnlock] = useState(false);
    const [createdSlug, setCreatedSlug] = useState('');

    const { data: myQRCodes, refetch } = useQuery({
        queryKey: ['fg_qr_codes', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('fg_qr_codes')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });
            if (error) {
                toast({
                    title: 'Digital unlocks are being set up',
                    description: 'QR code history will appear once the database is ready.',
                    variant: 'destructive',
                });
                return [];
            }
            return data ?? [];
        },
    });

    const handleDownloadQR = (svgEl: SVGSVGElement | null, filename: string) => {
        if (!svgEl) return;
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
                const pngFile = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = filename;
                link.href = pngFile;
                link.click();
            }
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const createUnlockLink = async () => {
        if (!user || !unlockTitle.trim()) return;
        setCreatingUnlock(true);
        const slug = genSlug();
        const { error } = await supabase.from('fg_qr_codes').insert({
            user_id: user.id,
            code_slug: slug,
            content_type: unlockType,
            content_title: unlockTitle,
            content_description: unlockDesc || null,
            file_url: unlockFileUrl || null,
        });
        if (error) {
            toast({ title: 'Digital unlocks are being set up', description: 'Could not create unlock link yet. Please try again after the database setup is finished.', variant: 'destructive' });
        } else {
            setCreatedSlug(slug);
            refetch();
            toast({ title: 'Unlock link created', description: `QR code ready to download.` });
        }
        setCreatingUnlock(false);
    };

    const unlockUrl = createdSlug ? `${window.location.origin}/unlock/${createdSlug}` : '';
    const unlockQRRef = useRef<SVGSVGElement>(null);

    return (
        <div className="min-h-screen bg-background pb-32">
            <Navbar />
            <div className="container pt-32 max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="font-bebas text-5xl tracking-wider text-foreground flex items-center gap-3">
                        <QrIcon className="w-10 h-10 text-primary" />
                        QR CODE GENERATOR
                    </h1>
                    <p className="text-muted-foreground font-barlow mt-2">
                        Generate standard QR codes or create physical-to-digital unlock links tied to exclusive content.
                    </p>
                </div>

                <Tabs defaultValue="standard">
                    <TabsList className="w-full">
                        <TabsTrigger value="standard" className="flex-1 font-bebas tracking-wider">STANDARD QR</TabsTrigger>
                        <TabsTrigger value="unlock" className="flex-1 font-bebas tracking-wider">DIGITAL UNLOCK</TabsTrigger>
                        <TabsTrigger value="mycodes" className="flex-1 font-bebas tracking-wider">MY CODES</TabsTrigger>
                    </TabsList>

                    {/* Standard QR */}
                    <TabsContent value="standard" className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 bg-card border border-border rounded-xl p-6">
                                <div className="space-y-2">
                                    <Label htmlFor="url" className="font-barlow flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-primary" /> Destination URL
                                    </Label>
                                    <Input id="url" value={url} onChange={e => setUrl(e.target.value)} className="font-mono text-sm" />
                                    <p className="text-xs text-muted-foreground">Pre-filled with your artist profile. Change to any URL.</p>
                                </div>
                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground">Keep printed codes at least 2cm wide. The PNG download includes a white border for reliable scanning on dark backgrounds.</p>
                                </div>
                                <Button onClick={() => handleDownloadQR(qrRef.current, `QR-${profile?.full_name || 'FG'}.png`)} className="w-full font-bebas text-lg tracking-wider py-6">
                                    <Download className="w-5 h-5 mr-2" /> DOWNLOAD HIGH-RES PNG
                                </Button>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                                <div className="bg-white p-6 rounded-xl shadow-lg border-4 border-primary/20">
                                    <QRCodeSVG value={url || 'https://fullygoverned.com'} size={220} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={false} ref={qrRef} />
                                </div>
                                <p className="font-mono text-xs text-muted-foreground mt-4 uppercase tracking-widest">Live Preview</p>
                            </motion.div>
                        </div>
                    </TabsContent>

                    {/* Digital Unlock */}
                    <TabsContent value="unlock" className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                                <h2 className="font-bebas text-xl tracking-wider text-foreground">CREATE UNLOCK LINK</h2>
                                <p className="text-xs text-muted-foreground font-barlow">Print this QR on merch, postcards, or USB packaging. When scanned, fans land on a page showing your exclusive content - no app needed.</p>
                                <div className="space-y-2">
                                    <Label className="font-barlow">Content type</Label>
                                    <select value={unlockType} onChange={e => setUnlockType(e.target.value as 'track' | 'video' | 'message' | 'exclusive')} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-barlow">
                                        <option value="track">Track / Audio</option>
                                        <option value="video">Video</option>
                                        <option value="message">Personal Message</option>
                                        <option value="exclusive">Exclusive Content</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-barlow">Title *</Label>
                                    <Input placeholder="e.g. Unreleased Track - Summer 2026" value={unlockTitle} onChange={e => setUnlockTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-barlow">Description (optional)</Label>
                                    <Input placeholder="A message or description for fans" value={unlockDesc} onChange={e => setUnlockDesc(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-barlow">Content URL (optional)</Label>
                                    <Input placeholder="https://... link to audio/video/download" value={unlockFileUrl} onChange={e => setUnlockFileUrl(e.target.value)} />
                                </div>
                                <Button onClick={createUnlockLink} disabled={creatingUnlock || !unlockTitle.trim()} className="w-full font-bebas text-lg tracking-wider py-6">
                                    {creatingUnlock ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />CREATING...</> : <><Plus className="w-5 h-5 mr-2" />CREATE UNLOCK QR</>}
                                </Button>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                                {createdSlug ? (
                                    <>
                                        <div className="bg-white p-6 rounded-xl shadow-lg border-4 border-primary/20">
                                            <QRCodeSVG value={unlockUrl} size={220} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={false} ref={unlockQRRef} />
                                        </div>
                                        <p className="font-mono text-xs text-muted-foreground mt-4 text-center break-all">{unlockUrl}</p>
                                        <div className="flex gap-2 mt-4 w-full">
                                            <Button onClick={() => handleDownloadQR(unlockQRRef.current, `unlock-${createdSlug}.png`)} className="flex-1 font-bebas tracking-wider">
                                                <Download className="w-4 h-4 mr-1" /> DOWNLOAD
                                            </Button>
                                            <Button variant="outline" onClick={() => window.open(unlockUrl, '_blank')} className="font-bebas tracking-wider">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center space-y-2">
                                        <QrIcon className="w-12 h-12 text-primary/20 mx-auto" />
                                        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">QR will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* My Codes */}
                    <TabsContent value="mycodes" className="pt-4">
                        <div className="bg-card border border-border rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <h2 className="font-bebas text-xl tracking-wider text-foreground">YOUR UNLOCK CODES</h2>
                            </div>
                            {!myQRCodes || myQRCodes.length === 0 ? (
                                <p className="p-8 text-center text-muted-foreground font-barlow text-sm">No unlock codes yet. Create one in the Digital Unlock tab.</p>
                            ) : (
                                <div className="divide-y divide-border">
                                    {myQRCodes.map((code: { id: string; content_title: string; content_type: string; code_slug: string; scan_count: number }) => (
                                        <div key={code.id} className="px-4 py-3 flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-barlow text-sm text-foreground truncate">{code.content_title}</p>
                                                <p className="font-mono text-xs text-muted-foreground">{code.content_type} - {code.scan_count} scans</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-mono text-xs text-primary">{code.code_slug}</span>
                                                <Button size="sm" variant="outline" onClick={() => window.open(`/unlock/${code.code_slug}`, '_blank')}>
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <Footer />
        </div>
    );
};

export default QRGenerator;

