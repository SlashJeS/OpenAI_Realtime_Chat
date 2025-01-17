import React, { useRef, useEffect } from 'react';
import { Button } from './button/Button';
import { X, Zap } from 'react-feather';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';

interface ActionsBarProps {
  isConnected: boolean;
  connectConversation: () => void;
  disconnectConversation: () => void;
  wavRecorder?: WavRecorder;
  wavStreamPlayer?: WavStreamPlayer;
  hasConversation: boolean;
}

export function ActionsBar({
                             isConnected,
                             connectConversation,
                             disconnectConversation,
                             wavRecorder,
                             wavStreamPlayer,
                             hasConversation,
                           }: ActionsBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    const renderLoop = () => {
      if (!isMounted) return;
      if (canvasRef.current && wavRecorder && wavStreamPlayer?.analyser) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const devicePixelRatio = window.devicePixelRatio || 1;
          const width = canvas.offsetWidth * devicePixelRatio;
          const height = canvas.offsetHeight * devicePixelRatio;

          if (!canvas.width || !canvas.height) {
            canvas.width = width;
            canvas.height = height;
            ctx.scale(devicePixelRatio, devicePixelRatio);
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const userFreq = wavRecorder.recording
            ? wavRecorder.getFrequencies('voice').values
            : new Float32Array([0]);
          const assistantFreq = wavStreamPlayer.getFrequencies('voice').values;

          const w = canvas.width;
          const h = canvas.height;

          ctx.save();

          ctx.fillStyle = '#0099ff';
          const barWidth = 2;
          let x = 0;
          for (let i = 0; i < userFreq.length; i++) {
            const v = userFreq[i];
            const y = v * h;
            ctx.fillRect(x, h - y, barWidth, y);
            x += barWidth + 1;
            if (x > w / 2 - barWidth) break;
          }

          ctx.fillStyle = '#009900';
          let x2 = w / 2;
          for (let i = 0; i < assistantFreq.length; i++) {
            const v = assistantFreq[i];
            const y = v * h;
            ctx.fillRect(x2, h - y, barWidth, y);
            x2 += barWidth + 1;
            if (x2 > w - barWidth) break;
          }

          ctx.restore();
        }
      }
      requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      isMounted = false;
    };
  }, [wavRecorder, wavStreamPlayer]);

  return (
    <div className="actions-bar">
      <div className="actions-bar-inner">
        {!isConnected && hasConversation && (
          <Button
            label="Connect"
            iconPosition="start"
            icon={Zap}
            buttonStyle="connect"
            onClick={connectConversation}
          />
        )}
        {isConnected && (
          <Button
            label="Disconnect"
            iconPosition="end"
            icon={X}
            buttonStyle="regular"
            onClick={disconnectConversation}
          />
        )}
        <div className="audio-visualizer">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
