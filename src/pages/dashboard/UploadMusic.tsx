import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Music, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const UploadMusic = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("Hip Hop / Rap");
    const [price, setPrice] = useState("0.99");
    const [releaseType, setReleaseType] = useState("Single");

    // File state
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!title || !audioFile) {
            toast({ title: "Incomplete", description: "Title and audio file are required.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        let uploadedAudioPath: string | null = null;
        let uploadedCoverPath: string | null = null;
        try {
            let audioUrl = null;
            let coverUrl = null;

            // 1. Upload audio file to 'tracks' bucket
            if (audioFile) {
                const audioExt = audioFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'audio';
                const audioFileName = `${user.id}/${crypto.randomUUID()}.${audioExt}`;
                const { error: audioError } = await supabase.storage
                    .from('tracks')
                    .upload(audioFileName, audioFile);

                if (audioError) throw audioError;
                uploadedAudioPath = audioFileName;

                const { data: audioData } = supabase.storage.from('tracks').getPublicUrl(audioFileName);
                audioUrl = audioData.publicUrl;
            }

            // 2. Upload cover file to 'covers' bucket
            if (coverFile) {
                const coverExt = coverFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'image';
                const coverFileName = `${user.id}/${crypto.randomUUID()}.${coverExt}`;
                const { error: coverError } = await supabase.storage
                    .from('covers')
                    .upload(coverFileName, coverFile);

                if (coverError) throw coverError;
                uploadedCoverPath = coverFileName;

                const { data: coverData } = supabase.storage.from('covers').getPublicUrl(coverFileName);
                coverUrl = coverData.publicUrl;
            }

            // 3. Insert record into music_tracks
            const { error: dbError } = await (supabase.from('music_tracks') as any)
                .from('music_tracks')
                .insert({
                    user_id: user.id,
                    title,
                    genre,
                    price: parseFloat(price) || 0,
                    file_url: audioUrl,
                    cover_url: coverUrl,
                    release_type: releaseType, // Added release type
                    status: 'pending_review' // Explicitly set to pending_review
                });

            if (dbError) throw dbError;

            setSuccess(true);
            toast({ title: "Success!", description: "Track submitted for review." });

        } catch (error: any) {
            await Promise.all([
                uploadedAudioPath ? supabase.storage.from('tracks').remove([uploadedAudioPath]) : Promise.resolve(),
                uploadedCoverPath ? supabase.storage.from('covers').remove([uploadedCoverPath]) : Promise.resolve(),
            ]);
            toast({ title: "Upload Failed", description: error.message || "An error occurred during upload.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return null; // Handled by ProtectedRoute
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container pt-32 pb-24 max-w-3xl border-b border-border">
                {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-card border border-border rounded-lg space-y-6">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                        <h2 className="font-bebas text-4xl text-foreground tracking-wider">TRACK SUBMITTED</h2>
                        <p className="text-muted-foreground font-barlow max-w-md mx-auto">
                            Your music has been uploaded and is currently pending admin review. We'll notify you once it's live on the Digital Vinyl store.
                        </p>
                        <div className="pt-6">
                            <Button onClick={() => setSuccess(false)} variant="outline" className="mr-4 font-bebas tracking-wider">UPLOAD ANOTHER</Button>
                            <Link to="/dashboard"><Button className="font-bebas tracking-wider">BACK TO DASHBOARD</Button></Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div>
                            <h1 className="font-bebas text-4xl text-foreground tracking-wider">UPLOAD MUSIC</h1>
                            <p className="text-muted-foreground font-barlow mt-2">
                                Submit your track for the Digital Vinyl store. All submissions are reviewed by our A&R team before going live.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 md:p-8 space-y-8">

                            {/* Media Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label>Audio File (WAV, MP3) <span className="text-red-500">*</span></Label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-interactive hover:bg-interactive/10 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Music className="w-8 h-8 text-muted-foreground mb-2" />
                                            <p className="text-sm font-barlow text-muted-foreground">
                                                {audioFile ? audioFile.name : "Click to upload audio"}
                                            </p>
                                        </div>
                                        <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} required />
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <Label>Cover Artwork (PNG, JPG)</Label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-interactive hover:bg-interactive/10 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                            <p className="text-sm font-barlow text-muted-foreground">
                                                {coverFile ? coverFile.name : "Click to upload cover img"}
                                            </p>
                                        </div>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                                    </label>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Track Title <span className="text-red-500">*</span></Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midnight Drive" required className="bg-background" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="genre">Primary Genre</Label>
                                        <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:border-interactive focus:outline-none">
                                            <option>Hip Hop / Rap</option>
                                            <option>R&B / Soul</option>
                                            <option>Afrobeats</option>
                                            <option>Grime / Drill</option>
                                            <option>Electronic / Dance</option>
                                            <option>Pop</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="release-type">Release Type</Label>
                                        <select id="release-type" value={releaseType} onChange={(e) => setReleaseType(e.target.value)} className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:border-interactive focus:outline-none">
                                            <option>Single</option>
                                            <option>EP</option>
                                            <option>Beat Lease</option>
                                            <option>Producer Stems</option>
                                            <option>USB Content</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (£)</Label>
                                        <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.99" className="bg-background" />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-4 border-t border-border flex justify-end gap-4">
                                <Link to="/dashboard">
                                    <Button variant="ghost" type="button" className="font-bebas tracking-wider" disabled={isSubmitting}>CANCEL</Button>
                                </Link>
                                <Button type="submit" className="font-bebas text-lg tracking-wider px-8" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> UPLOADING...</> : <><Upload className="w-5 h-5 mr-2" /> SUBMIT TRACK</>}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default UploadMusic;
