import React, { useState, useRef, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { IconButton, Select, MenuItem, FormControl } from "@mui/material";
import ApiKeyDialog from "./ApiKeyDialog";
import "./ChatWindow.scss";
import useAIServiceApi from "../api/useAIService";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MODES = ["Ask", "Agent"] as const;
type Mode = (typeof MODES)[number];

const MODELS = [
  "gpt-5.4",
  "gpt-5.4mini",
  "gpt-5.3-codex",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

const MODEL_PROVIDER: Record<string, string> = {
  "gpt-5.4": "OPENAI",
  "gpt-5.4mini": "OPENAI",
  "gpt-5.3-codex": "OPENAI",
  "gemini-3.1-pro-preview": "GOOGLE",
  "gemini-2.5-flash": "GOOGLE",
  "gemini-2.5-pro": "GOOGLE",
};

const getProvider = (model: string): string => MODEL_PROVIDER[model] ?? model;

interface ChatWindowProps {
  onClose?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  onClose,
  theme = "light",
  onToggleTheme,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("Ask");
  const [model, setModel] = useState(MODELS[0]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!apiKeys[getProvider(model)]) {
      setShowApiKeyDialog(true);
      return;
    }

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(updatedMessages);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const chatRequest = {
      api_key: apiKeys[getProvider(model)],
      provider: getProvider(model),
      model: model,
      messages: updatedMessages,
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const aiService = await useAIServiceApi();
    setIsLoading(true);
    aiService
      .claraChat(chatRequest)
      .then((resp) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: resp.content,
          },
        ]);
      })
      .catch((error) => {
        // TODO: show toast
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSaveApiKey = (apiKey: string, _persist: boolean) => {
    setApiKeys((prev) => ({ ...prev, [getProvider(model)]: apiKey }));
    setShowApiKeyDialog(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`chat-window chat-window--${theme}`}
      data-testid="chat-window"
    >
      {/* Header */}
      <div className="chat-window__header">
        <div className="chat-window__header-title-group">
          <span className="chat-window__title">CLARA</span>
          <span className="chat-window__subtitle">
            (Clinical Logic Assistant for Reliable Authoring)
          </span>
        </div>
        <div className="chat-window__header-actions">
          {onToggleTheme && (
            <IconButton
              data-testid="theme-toggle-button"
              aria-label="toggle theme"
              size="small"
              onClick={onToggleTheme}
              className="chat-window__theme-btn"
            >
              {theme === "light" ? (
                <DarkModeIcon fontSize="small" />
              ) : (
                <LightModeIcon fontSize="small" />
              )}
            </IconButton>
          )}
          {onClose && (
            <IconButton
              data-testid="chat-close-button"
              aria-label="close chat"
              size="small"
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-window__messages" data-testid="chat-messages">
        {messages.length === 0 && (
          <div className="chat-window__empty">
            <p>Hi, I'm Clara!</p>
            <p className="chat-window__hint">
              Ask me questions about your CQL code
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-window__message chat-window__message--${msg.role}`}
          >
            <div className="chat-window__message-label">
              {msg.role === "user" ? "You" : "Clara"}
            </div>
            <div className="chat-window__message-content">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-window__message chat-window__message--assistant">
            <div className="chat-window__message-label">Clara</div>
            <div className="chat-window__typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        {showApiKeyDialog && (
          <ApiKeyDialog
            model={model}
            onSave={handleSaveApiKey}
            onCancel={() => setShowApiKeyDialog(false)}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-window__input-area">
        <div className="chat-window__input-row">
          <textarea
            ref={inputRef}
            data-testid="chat-input"
            className="chat-window__textarea"
            placeholder={
              mode === "Ask"
                ? "Ask a question..."
                : "Describe what you want the agent to do..."
            }
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <IconButton
            data-testid="chat-send-button"
            aria-label="send message"
            className="chat-window__send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="small"
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </div>
        <div className="chat-window__input-controls">
          <FormControl size="small" className="chat-window__select">
            <Select
              data-testid="chat-mode-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              variant="outlined"
              MenuProps={{
                anchorOrigin: { vertical: "top", horizontal: "left" },
                transformOrigin: { vertical: "bottom", horizontal: "left" },
              }}
              sx={{
                fontSize: "0.75rem",
                height: 26,
                color: "inherit",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d4d4d4",
                },
              }}
            >
              {MODES.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" className="chat-window__select">
            <Select
              data-testid="chat-model-select"
              value={model}
              onChange={(e) => {
                const newModel = e.target.value;
                setModel(newModel);
                if (!apiKeys[getProvider(newModel)]) {
                  setShowApiKeyDialog(true);
                }
              }}
              variant="outlined"
              MenuProps={{
                anchorOrigin: { vertical: "top", horizontal: "left" },
                transformOrigin: { vertical: "bottom", horizontal: "left" },
              }}
              sx={{
                fontSize: "0.75rem",
                height: 26,
                color: "inherit",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d4d4d4",
                },
              }}
            >
              {MODELS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
