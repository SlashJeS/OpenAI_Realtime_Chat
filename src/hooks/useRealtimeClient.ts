import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { WavRecorder, WavStreamPlayer } from '../lib/wavtools';
import { instructions } from '../utils/conversation_config';
import { LOCAL_RELAY_SERVER_URL } from '../utils/constants';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client';

interface UseRealtimeClientProps {
  apiKey: string;
}

export function useRealtimeClient({ apiKey }: UseRealtimeClientProps) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [canPushToTalk, setCanPushToTalk] = useState(false);

  const [itemTimestamps, setItemTimestamps] = useState<{ [id: string]: string }>({});

  const clientRef = useRef<RealtimeClient>();
  const wavRecorderRef = useRef<WavRecorder>();
  const wavStreamPlayerRef = useRef<WavStreamPlayer>();

  useEffect(() => {
    const client = new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
          apiKey,
          dangerouslyAllowAPIKeyInBrowser: true,
        }
    );
    const recorder = new WavRecorder({ sampleRate: 24000 });
    const player = new WavStreamPlayer({ sampleRate: 24000 });

    clientRef.current = client;
    wavRecorderRef.current = recorder;
    wavStreamPlayerRef.current = player;

    client.updateSession({
      instructions,
      input_audio_transcription: { model: 'whisper-1' },
      turn_detection: { type: 'server_vad' },
    });

    client.on('realtime.event', (evt: any) => {
      setRealtimeEvents((prev) => {
        const last = prev[prev.length - 1];
        if (last?.event.type === evt.event.type) {
          last.count = (last.count || 0) + 1;
          return [...prev.slice(0, -1), last];
        } else {
          return [...prev, evt];
        }
      });
    });

    client.on('conversation.updated', async ({ item, delta }: any) => {
      const newItems = client.conversation.getItems();

      if (delta?.audio) {
        player.add16BitPCM(delta.audio, item.id);
      }

      if (item.status === 'completed' && item.formatted.audio?.length) {
        try {
          const wavFile = await WavRecorder.decode(
            item.formatted.audio,
            24000,
            24000
          );
          item.formatted.file = wavFile;
        } catch (error) {
          console.error('Error decoding audio:', error);
        }
      }

      setItemTimestamps((prev) => ({
        ...prev,
        [item.id]: new Date().toISOString(),
      }));

      setItems([...newItems]);
    });

    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await player.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });

    client.on('error', (err: any) => {
      console.error('[useRealtimeClient] error:', err);
    });

    setItems(client.conversation.getItems());

    return () => {
      client.reset();
    };
  }, [apiKey]);

  const connectConversation = useCallback(async () => {
    const client = clientRef.current;
    const recorder = wavRecorderRef.current;
    const player = wavStreamPlayerRef.current;
    if (!client || !recorder || !player) return;
    setIsConnected(true);
    setItems(client.conversation.getItems());
    await recorder.begin();
    await player.connect();
    await client.connect();
    client.sendUserMessageContent([
      {
        type: 'input_text',
        text: 'Hello!',
      },
    ]);
    if (client.getTurnDetectionType() === 'server_vad') {
      setIsRecording(true);
      await recorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, []);

  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setIsRecording(false);
    const client = clientRef.current;
    const recorder = wavRecorderRef.current;
    const player = wavStreamPlayerRef.current;
    if (!client || !recorder || !player) return;
    client.disconnect();
    await recorder.end();
    await player.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    clientRef.current?.deleteItem(id);
    setItemTimestamps((prev) => {
      const newTimestamps = { ...prev };
      delete newTimestamps[id];
      return newTimestamps;
    });
  }, []);

  return {
    items,
    realtimeEvents,
    isConnected,
    isRecording,
    canPushToTalk,
    connectConversation,
    disconnectConversation,
    deleteConversationItem,
    wavRecorder: wavRecorderRef.current,
    wavStreamPlayer: wavStreamPlayerRef.current,
    itemTimestamps,
  };
}
