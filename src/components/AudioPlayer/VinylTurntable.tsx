import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Disc3, Music } from 'lucide-react';

const VinylTurntable = () => {
    const { currentTrack, isPlaying } = useAudioPlayer();
    const [isHovered, setIsHovered] = useState(false);

    if (!currentTrack) return null;

    return (
        <div 
            className="hidden lg:flex flex-col items-center justify-center p-8 bg-card/30 border border-border rounded-2xl backdrop-blur-md relative overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Texture/Grain */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Turntable Base Shadow */}
                <div className="absolute inset-0 translate-y-4 blur-2xl bg-black/40 rounded-full" />
                
                {/* Turntable Platter */}
                <div className="absolute inset-0 bg-[#111] rounded-full border-[10px] border-[#222] shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    
                    {/* The Record */}
                    <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="relative w-[92%] h-[92%] rounded-full bg-[#050505] shadow-2xl flex items-center justify-center"
                        style={{
                            backgroundImage: `repeating-radial-gradient(circle, #000, #000 1px, #080808 2px, #000 3px)`,
                            boxShadow: '0 0 20px rgba(0,0,0,1), inset 0 0 10px rgba(255,255,255,0.05)'
                        }}
                    >
                        {/* Grooves Highlight */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                        
                        {/* Center Label */}
                        <div className="w-1/3 h-1/3 rounded-full bg-white relative overflow-hidden shadow-lg border-2 border-primary/20">
                            {currentTrack.coverUrl ? (
                                <img src={currentTrack.coverUrl} alt="Album Art" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                    <Disc3 className="w-10 h-10" />
                                </div>
                            )}
                            {/* Spindle Hole */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background border border-border shadow-inner" />
                        </div>
                    </motion.div>
                </div>

                {/* Tonearm */}
                <motion.div
                    initial={{ rotate: -45 }}
                    animate={{ rotate: isPlaying ? 0 : -45 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    style={{ originX: "85%", originY: "15%" }}
                    className="absolute top-0 right-[-10px] w-48 h-12 pointer-events-none"
                >
                    {/* Tonearm Base */}
                    <div className="absolute right-0 top-0 w-12 h-12 rounded-full bg-gradient-to-b from-[#444] to-[#222] border border-[#555] shadow-lg" />
                    
                    {/* Tonearm Pipe */}
                    <div className="absolute top-5 right-6 w-40 h-2 bg-gradient-to-b from-[#888] to-[#555] rounded-full shadow-md" />
                    
                    {/* Headshell & Needle */}
                    <div className="absolute top-3 left-0 w-8 h-6 bg-[#222] rounded-sm transform -rotate-15 shadow-md border-t border-white/10" />
                </motion.div>
            </div>

            {/* Liner Notes Overlay (on hover) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-6 left-6 right-6 p-4 bg-background/80 backdrop-blur-xl border border-primary/20 rounded-xl space-y-2 text-center"
                    >
                        <p className="font-mono text-[10px] text-primary tracking-[0.2em] uppercase">Now Spinning</p>
                        <h4 className="font-bebas text-xl text-foreground tracking-wider">{currentTrack.title}</h4>
                        <p className="text-xs text-muted-foreground font-barlow italic">Released via Fully Governed Vault</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-primary animate-pulse">LIVE ACCESS</span>
                    <span className="text-[10px] font-mono text-muted-foreground">STUDIO MASTER 96kHZ/24BIT</span>
                </div>
            </div>
        </div>
    );
};

export default VinylTurntable;
