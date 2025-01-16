import React from 'react';
import { Button } from './button/Button';

interface ContentTopProps {
  onToggleSidebar: () => void;
}

export function ContentTop({ onToggleSidebar }: ContentTopProps) {
  return (
    <div className="content-top">
      <div className="content-title">
        <img src="/openai-logomark.svg" alt="OpenAI Logo" />
        <span>Realtime Voice Chat</span>
      </div>
      <div className="settings-button">
        <Button
          label="Settings"
          buttonStyle="regular"
          onClick={onToggleSidebar}
        />
      </div>
    </div>
  );
}
