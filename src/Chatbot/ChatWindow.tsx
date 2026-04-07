import React, { useState, useRef, useEffect, useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import {
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Divider,
  ListSubheader,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ApiKeyDialog from "./ApiKeyDialog";
import "./ChatWindow.scss";
import { AIServiceApi } from "../api/useAIService";
import { useOktaTokens } from "@madie/madie-util";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  tokens?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

const MODES = ["Ask", "Agent"] as const;
type Mode = (typeof MODES)[number];

function parseErrorMessage(error: Error): {
  message: string;
  isAuthError: boolean;
} {
  const msg = error.message || "";
  if (
    msg.includes("401") ||
    msg.includes("Unauthorized") ||
    msg.includes("AuthenticationError")
  ) {
    return {
      message:
        "Your API key is invalid or expired. Please check your key and try again.",
      isAuthError: true,
    };
  }
  if (
    msg.includes("429") ||
    msg.includes("Too Many Requests") ||
    msg.includes("RateLimitError")
  ) {
    return {
      message: "Rate limit exceeded. Please wait a moment and try again.",
      isAuthError: false,
    };
  }
  if (msg.includes("500") || msg.includes("Internal Server Error")) {
    return {
      message:
        "The AI service encountered an internal error. Please try again later.",
      isAuthError: false,
    };
  }
  return {
    message: "Something went wrong. Please try again.",
    isAuthError: false,
  };
}

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
  // provider → key_id returned by the ai-service (encrypted server-side)
  const [savedKeyIds, setSavedKeyIds] = useState<Record<string, string>>({});
  // provider → raw api_key (in-memory only, per-call mode, not persisted)
  const [sessionKeys, setSessionKeys] = useState<Record<string, string>>({});
  const [model, setModel] = useState("gpt-5.4");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { getAccessToken } = useOktaTokens();
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const aiService = useMemo(
    () => new AIServiceApi(() => getAccessTokenRef.current()),
    []
  );

  const measureId = window.location.pathname.split("/")[2];

  // Load any keys the user has previously persisted in the ai-service
  useEffect(() => {
    (async () => {
      try {
        const keys = await aiService.listKeys();
        const map: Record<string, string> = {};
        // If the user has multiple keys for a provider, use the most recently created active one
        for (const key of keys) {
          if (key.active && !map[key.provider]) {
            map[key.provider] = key.id;
          }
        }
        setSavedKeyIds(map);
      } catch {
        // ai-service unavailable or user not authenticated yet — start with no saved keys
      }
    })();
  }, [aiService]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasKeyForProvider = (provider: string) =>
    !!savedKeyIds[provider] || !!sessionKeys[provider];

  const getTotalTokens = () => {
    return messages.reduce((total, msg) => {
      if (msg.tokens) {
        return total + msg.tokens.prompt_tokens + msg.tokens.completion_tokens;
      }
      return total;
    }, 0);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const provider = getProvider(model);
    if (!hasKeyForProvider(provider)) {
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

    const chatRequest = savedKeyIds[provider]
      ? { key_id: savedKeyIds[provider], model, messages: updatedMessages }
      : {
          api_key: sessionKeys[provider],
          provider,
          model,
          messages: updatedMessages,
          measure_id: measureId,
        };

    setIsLoading(true);
    aiService
      .claraChat(chatRequest)
      .then((resp) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: resp.content, tokens: resp.usage },
        ]);
      })
      .catch((error) => {
        const { message, isAuthError } = parseErrorMessage(error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: message,
            isError: true,
          } as ChatMessage,
        ]);
        if (isAuthError) {
          const errorProvider = getProvider(model);
          setSavedKeyIds((prev) => {
            const updated = { ...prev };
            delete updated[errorProvider];
            return updated;
          });
          setSessionKeys((prev) => {
            const updated = { ...prev };
            delete updated[errorProvider];
            return updated;
          });
          setShowApiKeyDialog(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSaveApiKey = async (apiKey: string, persist: boolean) => {
    const provider = getProvider(model);
    if (persist) {
      try {
        // If a saved key already exists for this provider, delete it first to avoid duplicates
        if (savedKeyIds[provider]) {
          await aiService.deleteKey(savedKeyIds[provider]);
        }
        const saved = await aiService.saveKey(provider, apiKey);
        setSavedKeyIds((prev) => ({ ...prev, [provider]: saved.id }));
        // Clear any in-memory session key for this provider since it's now persisted
        setSessionKeys((prev) => {
          const next = { ...prev };
          delete next[provider];
          return next;
        });
      } catch (err) {
        console.error("Failed to persist API key:", err);
        // Fall back to session-only if the service call fails
        setSessionKeys((prev) => ({ ...prev, [provider]: apiKey }));
      }
    } else {
      // Not persisted — store in memory only; remove any previously saved key for this provider
      if (savedKeyIds[provider]) {
        try {
          await aiService.deleteKey(savedKeyIds[provider]);
          setSavedKeyIds((prev) => {
            const next = { ...prev };
            delete next[provider];
            return next;
          });
        } catch (err) {
          console.error("Failed to delete persisted key:", err);
        }
      }
      setSessionKeys((prev) => ({ ...prev, [provider]: apiKey }));
    }
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
            className={`chat-window__message chat-window__message--${msg.role}${
              msg.isError ? " chat-window__message--error" : ""
            }`}
          >
            <div className="chat-window__message-label">
              {msg.role === "user" ? "You" : "Clara"}
              {msg.tokens && msg.role === "assistant" && (
                <span
                  className="chat-window__message-tokens"
                  title={`Prompt: ${msg.tokens.prompt_tokens}, Completion: ${msg.tokens.completion_tokens}`}
                >
                  {msg.tokens.prompt_tokens + msg.tokens.completion_tokens}{" "}
                  tokens
                </span>
              )}
            </div>
            <div className="chat-window__message-content">
              {msg.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
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
            provider={getProvider(model)}
            hasPersistedKey={!!savedKeyIds[getProvider(model)]}
            onSave={handleSaveApiKey}
            onCancel={() => setShowApiKeyDialog(false)}
          />
        )}
        {messages.length > 0 && getTotalTokens() > 0 && (
          <div className="chat-window__token-summary">
            <span className="chat-window__token-summary-label">
              Total tokens used:
            </span>
            <span className="chat-window__token-summary-value">
              {getTotalTokens()}
            </span>
          </div>
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
                if (!hasKeyForProvider(getProvider(newModel))) {
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
              <ListSubheader sx={{ fontSize: "0.75rem", fontWeight: "600" }}>
                OPENAI :
              </ListSubheader>
              {["gpt-5.4", "gpt-5.4mini", "gpt-5.3-codex"].map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: "0.75rem" }}>
                  {m}
                </MenuItem>
              ))}
              <Divider sx={{ margin: "4px 0" }} />
              <ListSubheader sx={{ fontSize: "0.75rem", fontWeight: "600" }}>
                GOOGLE :
              </ListSubheader>
              {[
                "gemini-3.1-pro-preview",
                "gemini-2.5-flash",
                "gemini-2.5-pro",
              ].map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: "0.75rem" }}>
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
