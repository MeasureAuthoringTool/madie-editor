import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import "./ChatPanel.scss";

interface ChatPanelProps {
  onChatToggle?: () => void;
}

type Theme = "light" | "dark";

const ChatPanel: React.FC<ChatPanelProps> = ({ onChatToggle }) => {
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
        />
      </div>
    </div>
  );
};

export default ChatPanel;
