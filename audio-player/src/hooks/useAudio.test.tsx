import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../store';
import { setCurrentTrack, setIsPlaying } from '../store/playerSlice';
import { useAudio } from './useAudio';

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

const HookHarness: React.FC = () => {
  useAudio();
  return null;
};

describe('useAudio', () => {
  let container: HTMLDivElement;
  let root: Root;
  let isMounted: boolean;
  let audioConstructor: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    audioMock.currentTime = 0;
    audioMock.duration = 120;
    audioMock.volume = 1;
    audioMock.src = '';
    isMounted = true;
    audioConstructor = jest.spyOn(window, 'Audio').mockImplementation(
      () => audioMock as unknown as HTMLAudioElement
    );

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
    audioConstructor.mockRestore();
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
});
