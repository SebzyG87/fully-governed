import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Disc } from 'lucide-react';

const BAR_COUNT = 12;

const EQBars = ({ analyserRef, isPlaying }: { analyserRef: React.RefObject<AnalyserNode | null>; isPlaying: boolean }) => {
    const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(0));
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const draw = () => {
            if (analyserRef.current && isPlaying) {
                const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(data);
                // Sample BAR_COUNT evenly spaced bins, focus on mid frequencies
                const step = Math.floor(data.length / BAR_COUNT);
                const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
                    const val = data[i * step] ?? 0;
                    return Math.max(4, (val / 255) * 100);
                });
                setBars(newBars);
            } else {
                setBars(prev => prev.map(v => Math.max(4, v * 0.85)));
            }
            rafRef.current = requestAnimationFrame(draw);
        };

        rafRef.current = requestAnimationFrame(draw);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [analyserRef, isPlaying]);

    return (
        <div className="flex items-end justify-center gap-[2px] h-10 w-full px-2">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/70 transition-none"
                    style={{ height: `${h}%`, opacity: isPlaying ? 0.9 : 0.3 }}
                />
            ))}
        </div>
    );
};

const VinylPlayer3D = () => {
    const { currentTrack, isPlaying, analyserRef } = useAudioPlayer();
    const controls = useAnimation();

    useEffect(() => {
        if (isPlaying) {
            controls.start({
                rotate: 360,
                transition: { duration: 4, repeat: Infinity, ease: "linear" }
            });
        } else {
            controls.stop();
        }
    }, [isPlaying, controls]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-sm mx-auto aspect-square flex items-center justify-center pointer-events-none">
                {/* Turntable Platter Base */}
                <div className="absolute inset-4 rounded-full bg-zinc-900 border-[8px] border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">

                    {/* The Vinyl Disc itself */}
                    <motion.div
                        animate={controls}
                        className="relative w-[95%] h-[95%] rounded-full bg-[#111] flex items-center justify-center shadow-inner"
                        style={{
                            background: 'repeating-radial-gradient(#111, #111 2px, #1a1a1a 3px, #111 4px)'
                        }}
                    >
                        {/* Vinyl Grooves */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent mix-blend-overlay" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent via-white/5 to-transparent mix-blend-overlay rotate-45" />

                        {/* Label / Album Artwork */}
                        <div className="relative w-1/3 h-1/3 rounded-full bg-background border-4 border-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
                            {currentTrack?.coverUrl ? (
                                <img src={currentTrack.coverUrl} className="w-full h-full object-cover" alt="Vinyl Label" />
                            ) : (
                                <div className="w-full h-full bg-primary/20 flex flex-col justify-center items-center text-primary">
                                    <Disc className="w-6 h-6 mb-1 opacity-50" />
                                    <span className="font-bebas text-xs tracking-widest">FG</span>
                                </div>
                            )}
                            <div className="absolute w-3 h-3 bg-zinc-900 rounded-full border border-zinc-700 shadow-inner" />
                        </div>
                    </motion.div>
                </div>

                {/* Tonearm */}
                <motion.div
                    initial={{ rotate: -20 }}
                    animate={{ rotate: isPlaying ? 15 : -20 }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    className="absolute top-0 right-8 w-8 h-48 origin-top shadow-2xl"
                >
                    <div className="w-6 h-6 rounded-full bg-zinc-300 absolute top-0 -left-1 shadow-lg border-2 border-zinc-400" />
                    <div className="w-2 h-32 bg-zinc-400 mx-auto mt-4 rounded-full shadow-lg" />
                    <div className="w-6 h-10 bg-zinc-800 mx-auto -mt-2 rounded-sm border-b-4 border-primary shadow-xl" />
                </motion.div>
            </div>

            {/* EQ Bars — frequency-driven when playing */}
            <EQBars analyserRef={analyserRef} isPlaying={isPlaying} />
        </div>
    );
};

export default VinylPlayer3D;
