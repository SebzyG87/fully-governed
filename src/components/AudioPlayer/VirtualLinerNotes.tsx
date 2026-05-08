import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Info, Mic, Sliders, Calendar } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const VirtualLinerNotes = () => {
    const { currentTrack } = useAudioPlayer();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-24 md:bottom-20 left-4 md:left-8 z-30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border px-4 py-2 rounded-full hover:border-interactive hover:shadow-[0_0_12px_hsl(var(--interactive))] transition-all font-bebas tracking-wider text-sm"
            >
                <Info className="w-4 h-4 text-primary" />
                LINER NOTES
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-12 left-0 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-border bg-black/20">
                            <h3 className="font-bebas text-xl text-primary tracking-wider flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                VIRTUAL LINER NOTES
                            </h3>
                            <p className="font-barlow text-sm text-foreground truncate mt-1">{currentTrack.title}</p>
                        </div>

                        <div className="p-4 space-y-4 font-mono text-xs">
                            <div className="flex gap-3 text-muted-foreground">
                                <Mic className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                    <p className="text-foreground font-semibold">Artist / Performer</p>
                                    <p>{currentTrack.artist}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 text-muted-foreground">
                                <Sliders className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                    <p className="text-foreground font-semibold">Studio Engineer</p>
                                    <p>Fully Governed Staff (Uncredited)</p>
                                </div>
                            </div>

                            <div className="flex gap-3 text-muted-foreground">
                                <Calendar className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                    <p className="text-foreground font-semibold">Recorded</p>
                                    <p>Studio A, Lewisham</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VirtualLinerNotes;
