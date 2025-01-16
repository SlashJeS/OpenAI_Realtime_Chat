import React from 'react';
import { ItemType } from '@openai/realtime-api-beta/dist/lib/client';
import { X } from 'react-feather';

interface ConversationBlockProps {
  items: ItemType[];
  deleteConversationItem: (id: string) => void;
  itemTimestamps: { [id: string]: string };
}

export function ConversationBlock({
                                    items,
                                    deleteConversationItem,
                                    itemTimestamps,
                                  }: ConversationBlockProps) {
  return (
    <div className="conversation-block">
      <div className="content-block-title">Conversation</div>
      <div className="content-block-body">
        {!items.length &&
          <div className="waiting-text">Awaiting connection...</div>
        }
        {items.map((item) => {
          const speakerLabel =
            (item.role || item.type)?.replaceAll('_', ' ');

          const formattedTime = itemTimestamps[item.id]
            ? new Date(itemTimestamps[item.id]).toLocaleTimeString()
            : '';

          return (
            <div className="conversation-item" key={item.id}>
              <div className={`speaker ${item.role || ''}`}>
                <div>
                  {speakerLabel}
                  {formattedTime && (
                    <span className="timestamp"> {formattedTime}</span>
                  )}
                </div>
                <div className="close" onClick={() => deleteConversationItem(item.id)}>
                  <X />
                </div>
              </div>
              <div className="speaker-content">
                {item.type === 'function_call_output' && (
                  <div>{item.formatted.output}</div>
                )}
                {!!item.formatted.tool && (
                  <div>
                    {item.formatted.tool.name}({item.formatted.tool.arguments})
                  </div>
                )}
                {!item.formatted.tool && item.role === 'user' && (
                  <div>
                    {item.formatted.transcript ||
                      (item.formatted.audio?.length
                        ? '(awaiting transcript)'
                        : item.formatted.text || '(item sent)')}
                  </div>
                )}
                {!item.formatted.tool && item.role === 'assistant' && (
                  <div>
                    {item.formatted.transcript ||
                      item.formatted.text ||
                      '(truncated)'}
                  </div>
                )}
                {item.formatted.file && (
                  <audio src={item.formatted.file.url} controls />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
