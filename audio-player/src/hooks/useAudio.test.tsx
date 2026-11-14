import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../store';
import { RootState } from '../store';
import { setCurrentTrack, setIsPlaying } from '../store/playerSlice';
import { useAudio } from './useAudio';

(global as any).IS_REACT_ACT_ENVIRONMENT = true;

const audioMock = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  removeAttribute: jest.fn(),
  load: jest.fn(),
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  currentTime: 0,
  duration: 120,
  volume: 1,
  src: '',
};

let audioControls: ReturnType<typeof useAudio>;

const HookHarness: React.FC = () => {
  audioControls = useAudio();
  return null;
};

describe('useAudio', () => {
  let container: HTMLDivElement;
  let root: Root;
  let isMounted: boolean;
  let originalAudio: typeof Audio;

  beforeEach(() => {
    jest.clearAllMocks();
    audioMock.currentTime = 0;
    audioMock.duration = 120;
    audioMock.volume = 1;
    audioMock.src = '';
    isMounted = true;
    store.dispatch(setIsPlaying(false));
    originalAudio = global.Audio;
    (global as any).Audio = jest.fn(() => audioMock);

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root.render(
        <Provider store={store}>
          <HookHarness />
        </Provider>
      );
    });
  });

  afterEach(() => {
    if (isMounted) {
      act(() => root.unmount());
    }
    (global as any).Audio = originalAudio;
    container.remove();
  });

  it('removes all audio event listeners and releases the media resource on unmount', () => {
    const listeners = audioMock.addEventListener.mock.calls;

    expect(listeners).toHaveLength(5);

    act(() => root.unmount());
    isMounted = false;

    listeners.forEach(([eventName, handler]) => {
      expect(audioMock.removeEventListener).toHaveBeenCalledWith(eventName, handler);
    });
    expect(audioMock.pause).toHaveBeenCalledTimes(2);
    expect(audioMock.removeAttribute).toHaveBeenCalledWith('src');
    expect(audioMock.load).toHaveBeenCalledTimes(1);
  });

  it('starts playback when a track is selected while playback is enabled', async () => {
    await act(async () => {
      store.dispatch(setCurrentTrack({
        id: '2',
        title: 'Test track',
        artist: 'Test artist',
        duration: 120,
      }));
      store.dispatch(setIsPlaying(true));
    });

    expect(audioMock.src).toContain('SoundHelix-Song-3.mp3');
    expect(audioMock.play).toHaveBeenCalledTimes(1);
  });

  it('pauses and resumes playback when the playing state changes', async () => {
    await act(async () => {
      store.dispatch(setIsPlaying(true));
    });
    expect(audioMock.play).toHaveBeenCalledTimes(1);

    await act(async () => {
      store.dispatch(setIsPlaying(false));
    });
    expect(audioMock.pause).toHaveBeenCalled();

    await act(async () => {
      store.dispatch(setIsPlaying(true));
    });
    expect(audioMock.play).toHaveBeenCalledTimes(2);
  });

  it('loads the newly selected track and keeps playback active', async () => {
    await act(async () => {
      store.dispatch(setCurrentTrack({ id: '2', title: 'First', artist: 'Artist', duration: 120 }));
      store.dispatch(setIsPlaying(true));
    });
    await act(async () => {
      store.dispatch(setCurrentTrack({ id: '3', title: 'Second', artist: 'Artist', duration: 120 }));
    });

    expect(audioMock.src).toContain('SoundHelix-Song-4.mp3');
    expect(audioMock.load).toHaveBeenCalled();
    expect(audioMock.play).toHaveBeenCalledTimes(2);
  });

  it('seeks and skips within the media duration', () => {
    audioMock.duration = 100;
    audioControls.seek(30);
    expect(audioMock.currentTime).toBe(30);

    audioControls.skipForward();
    expect(audioMock.currentTime).toBe(40);

    audioControls.skipBackward();
    expect(audioMock.currentTime).toBe(30);
  });
});
