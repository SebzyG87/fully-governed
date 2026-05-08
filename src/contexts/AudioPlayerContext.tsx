import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface Track {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    audioUrl: string;
}

interface AudioPlayerContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    progress: number;
    duration: number;
    volume: number;
    analyserRef: React.RefObject<AnalyserNode | null>;
    playTrack: (track: Track) => void;
    togglePlayPause: () => void;
    seek: (amount: number) => void;
    setVolume: (amount: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.8);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = volume;
        audioRef.current.crossOrigin = 'anonymous';

        const updateProgress = () => {
            if (audioRef.current) {
                setProgress(audioRef.current.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            if (audioRef.current) {
                setDuration(audioRef.current.duration);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        const audio = audioRef.current;
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
            audioCtxRef.current?.close();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const ensureAudioContext = () => {
        if (!audioRef.current) return;
        if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
        }
        if (!sourceRef.current) {
            sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.connect(audioCtxRef.current.destination);
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    // Handle play/pause logic when currentTrack or isPlaying changes
    useEffect(() => {
        if (!audioRef.current) return;

        if (currentTrack && audioRef.current.src !== currentTrack.audioUrl) {
            audioRef.current.src = currentTrack.audioUrl;
            setProgress(0);
            if (isPlaying) {
                ensureAudioContext();
                audioRef.current.play().catch(() => {});
                setupMediaSession(currentTrack);
            }
        } else if (isPlaying && audioRef.current.paused) {
            ensureAudioContext();
            audioRef.current.play().catch(() => {});
        } else if (!isPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }, [currentTrack, isPlaying]);

    // Media Session API for lock screen controls
    const setupMediaSession = (track: Track) => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: 'Fully Governed',
                artwork: track.coverUrl ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }] : []
            });

            navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
            navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime && audioRef.current) {
                    audioRef.current.currentTime = details.seekTime;
                    setProgress(details.seekTime);
                }
            });
        }
    };

    const playTrack = (track: Track) => {
        if (currentTrack?.id === track.id) {
            setIsPlaying(!isPlaying);
            return;
        }
        setCurrentTrack(track);
        setIsPlaying(true);

        const needleDrop = new Audio('/sounds/needle-drop.mp3');
        needleDrop.volume = 0.5;
        needleDrop.play().catch(() => {});
    };

    const togglePlayPause = () => {
        if (currentTrack) {
            setIsPlaying(!isPlaying);
        }
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const setVolume = (newVolume: number) => {
        setVolumeState(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    return (
        <AudioPlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            progress,
            duration,
            volume,
            analyserRef,
            playTrack,
            togglePlayPause,
            seek,
            setVolume
        }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};
