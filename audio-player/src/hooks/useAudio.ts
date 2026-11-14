import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  setIsPlaying,
  setCurrentTime,
  setDuration,
  nextTrack,
} from '../store/playerSlice';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dispatch = useAppDispatch();

  const { currentTrack, isPlaying, volume } = useAppSelector((state) => state.player);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audio.currentTime));
    };
    const handleLoadedMetadata = () => {
      dispatch(setDuration(Number.isFinite(audio.duration) ? audio.duration : 0));
    };
    const handlePlay = () => dispatch(setIsPlaying(true));
    const handlePause = () => dispatch(setIsPlaying(false));
    const handleEnded = () => dispatch(nextTrack());

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(parseInt(currentTrack.id, 10) % 8) + 1}.mp3`;
    audio.load();
    dispatch(setCurrentTime(0));
    dispatch(setDuration(0));
  }, [currentTrack, dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      audio.pause();
      return;
    }

    let cancelled = false;
    void audio.play().catch((error: unknown) => {
      if (cancelled) return;
      console.error('Audio playback failed:', error);
      dispatch(setIsPlaying(false));
    });

    return () => {
      cancelled = true;
    };
  }, [currentTrack, dispatch, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      dispatch(setCurrentTime(time));
    }
  }, [dispatch]);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        audioRef.current.duration
      );
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  }, []);

  return {
    seek,
    skipForward,
    skipBackward,
  };
};
