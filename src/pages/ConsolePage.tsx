import React, { useEffect, useState } from 'react';
import './ConsolePage.scss';
import { useRealtimeClient } from '../hooks/useRealtimeClient';
import { ContentTop } from '../components/ContentTop';
import { ConversationBlock } from '../components/ConversationBlock';
import { ActionsBar } from '../components/ActionsBar';
import { SettingsSidebar } from '../components/SettingsSidebar';
import { Button } from '../components/button/Button';
import { Zap } from 'react-feather';

export function ConsolePage() {
  const {
    client,
    items,
    isConnected,
    isRecording,
    connectConversation,
    disconnectConversation,
    deleteConversationItem,
    wavRecorder,
    wavStreamPlayer,
    itemTimestamps,
  } = useRealtimeClient({ apiKey: process.env.REACT_APP_OPENAI_API_KEY || '' });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('--- ConsolePage Render ---');
    console.log('isConnected:', isConnected);
    console.log('isRecording:', isRecording);
    console.log('Conversation Items:', items);
    if (items.length > 0) {
      console.log('Last Item:', items[items.length - 1]);
    }
  }, [isConnected, isRecording, items]);

  useEffect(() => {
    const convoEls = document.querySelectorAll('[data-conversation-content]');
    convoEls.forEach((el) => {
      (el as HTMLDivElement).scrollTop = el.scrollHeight;
    });
  }, [items]);

  const hasConversation = items.length > 0;


  return (
    <div data-component="ConsolePage">
      <ContentTop onToggleSidebar={() => setIsSidebarOpen(true)} />
      <div className="content-main">
        <div className="content-logs">
          {!(isConnected || hasConversation) && (
            <div className="connect-center">
              <Button
                label="Connect"
                iconPosition="start"
                icon={Zap}
                buttonStyle="connect"
                onClick={connectConversation}
              />
            </div>
          )}

          {(isConnected || hasConversation) && (
            <>
              <ConversationBlock
                items={items}
                deleteConversationItem={deleteConversationItem}
                itemTimestamps={itemTimestamps}
              />
            </>
          )}
        </div>
        <SettingsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          client={client}
        />
      </div>
      {(isConnected || hasConversation) && (
        <ActionsBar
          isConnected={isConnected}
          isRecording={isRecording}
          connectConversation={connectConversation}
          disconnectConversation={disconnectConversation}
          wavRecorder={wavRecorder}
          wavStreamPlayer={wavStreamPlayer}
          hasConversation={hasConversation}
        />
      )}
    </div>
  );
}