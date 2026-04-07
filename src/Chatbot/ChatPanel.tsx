import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import "./ChatPanel.scss";
import { MeasureContext } from "../api/useAIService";

interface ChatPanelProps {
  onChatToggle?: () => void;
  measureId?: string;
  measureContext?: MeasureContext;
}

type Theme = "light" | "dark";

const ChatPanel: React.FC<ChatPanelProps> = ({
  onChatToggle,
  measureId,
  measureContext,
}) => {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className={`chat-panel chat-panel--${theme}`} data-testid="chat-panel">
      <div className="chat-panel__content">
        <ChatWindow
          onClose={onChatToggle}
          theme={theme}
          onToggleTheme={toggleTheme}
          measureId={measureId}
          measureContext={measureContext}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
