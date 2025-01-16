// src/hooks/useAudioVisualizer.ts
import { useEffect } from 'react';
import { WavRenderer } from '../utils/wav_renderer';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';

interface UseAudioVisualizerProps {
  clientCanvasRef: React.RefObject<HTMLCanvasElement>;
  serverCanvasRef: React.RefObject<HTMLCanvasElement>;
  wavRecorder?: WavRecorder;      // Можно передавать рекордер
  wavStreamPlayer?: WavStreamPlayer; // Или вытащить их прямо из useRealtimeClient
}

export function useAudioVisualizer({
                                     clientCanvasRef,
                                     serverCanvasRef,
                                     wavRecorder,
                                     wavStreamPlayer,
                                   }: UseAudioVisualizerProps) {
  useEffect(() => {
    let isMounted = true;

    function renderLoop() {
      if (!isMounted) return;

      // mic canvas
      if (clientCanvasRef.current && wavRecorder) {
        const canvas = clientCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!canvas.width || !canvas.height) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const result = wavRecorder.recording
            ? wavRecorder.getFrequencies('voice')
            : { values: new Float32Array([0]) };
          WavRenderer.drawBars(canvas, ctx, result.values, '#0099ff', 10, 0, 8);
        }
      }

      // assistant playback canvas
      if (serverCanvasRef.current && wavStreamPlayer?.analyser) {
        const canvas = serverCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (!canvas.width || !canvas.height) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const result = wavStreamPlayer.getFrequencies('voice');
          WavRenderer.drawBars(canvas, ctx, result.values, '#009900', 10, 0, 8);
        }
      }

      requestAnimationFrame(renderLoop);
    }

    renderLoop();

    return () => {
      isMounted = false;
    };
  }, [clientCanvasRef, serverCanvasRef, wavRecorder, wavStreamPlayer]);
}
