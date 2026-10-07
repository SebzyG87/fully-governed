import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, X, ChevronUp, Music } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import VinylTurntable from './VinylTurntable';
import { Button } from '@/components/ui/button';

const AudioPlayerBar = () => {
    const {
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        togglePlayPause,
        seek,
        setVolume
    } = useAudioPlayer();

    const [isExpanded, setIsExpanded] = useState(false);

    if (!currentTrack) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        seek(Number(e.target.value));
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(e.target.value));
    };

    return (
        <>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col pt-12"
                    >
                        <button 
                            onClick={() => setIsExpanded(false)}
                            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div className="container max-w-6xl flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 px-6">
                            {/* Left — 3D Turntable */}
                            <VinylTurntable />

                            {/* Right — Info & Controls */}
                            <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                                <div className="space-y-2">
                                    <p className="font-mono text-xs tracking-[0.4em] text-primary uppercase">Fully Governed Exclusive</p>
                                    <h2 className="font-bebas text-6xl md:text-8xl text-foreground tracking-wider leading-none">{currentTrack.title}</h2>
                                    <p className="text-xl md:text-2xl text-muted-foreground font-barlow italic">by {currentTrack.artist}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
                                        <span className="w-12 text-right">{formatTime(progress)}</span>
                                        <input
                                            type="range"
                                            min={0}
                                            max={duration || 100}
                                            value={progress}
                                            onChange={handleProgressChange}
                                            className="flex-1 h-2 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary cursor-pointer h-1.5"
                                        />
                                        <span className="w-12">{formatTime(duration)}</span>
                                    </div>

                                    <div className="flex items-center justify-center lg:justify-start gap-12 pt-4">
                                        <button className="text-muted-foreground hover:text-foreground transition-colors active:text-primary">
                                            <SkipBack className="w-10 h-10 fill-current" />
                                        </button>

                                        <button
                                            onClick={togglePlayPause}
                                            className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-colors hover:bg-interactive active:bg-primary/90"
                                        >
                                            {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-2" />}
                                        </button>

                                        <button className="text-muted-foreground hover:text-foreground transition-colors active:text-primary">
                                            <SkipForward className="w-10 h-10 fill-current" />
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-12 flex flex-wrap justify-center lg:justify-start gap-4">
                                    <Button variant="outline" className="font-bebas text-lg px-8 border-border hover:border-interactive">VIEW LINER NOTES</Button>
                                    <Button variant="outline" className="font-bebas text-lg px-8 border-border hover:border-interactive">SHARE TRACK</Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 flex flex-col md:flex-row items-center gap-4"
            >
                {/* Track Info */}
                <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
                    <div 
                        className="w-12 h-12 rounded-md overflow-hidden bg-background shrink-0 border border-border cursor-pointer group"
                        onClick={() => setIsExpanded(true)}
                    >
                        {currentTrack.coverUrl ? (
                            <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover transition-opacity group-hover:opacity-90" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                <span className="font-bebas text-lg">FG</span>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setIsExpanded(true)}>
                        <p className="font-bebas text-lg text-foreground truncate tracking-wider">{currentTrack.title}</p>
                        <p className="text-xs text-muted-foreground font-barlow truncate">{currentTrack.artist}</p>
                    </div>
                </div>

                {/* Controls & Progress */}
                <div className="w-full md:w-1/3 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-6">
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>

                        <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-colors hover:bg-interactive"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                        </button>

                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                    </div>

                    <div className="w-full flex items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span className="w-10 text-right">{formatTime(progress)}</span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={progress}
                            onChange={handleProgressChange}
                            className="flex-1 h-1 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary cursor-pointer"
                        />
                        <span className="w-10">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Extras */}
                <div className="hidden md:flex w-1/3 items-center justify-end gap-4">
                    <div className="flex items-center gap-2 w-32">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-border rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary cursor-pointer"
                        />
                    </div>
                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-2"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Mobile Expand Hint */}
                <button 
                    onClick={() => setIsExpanded(true)}
                    className="md:hidden absolute top-[-20px] left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md rounded-t-lg px-4 py-1 border-t border-x border-border flex items-center gap-2"
                >
                    <ChevronUp className="w-4 h-4 animate-bounce" />
                    <span className="text-[10px] font-mono">EXPAND PLAYER</span>
                </button>
            </motion.div>
        </>
    );
};

export default AudioPlayerBar;
