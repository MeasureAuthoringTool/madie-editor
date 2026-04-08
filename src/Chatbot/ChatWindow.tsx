import React, { useState, useRef, useEffect, useMemo } from "react";
import CloseIcon from "@mui/icons-material/Close";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
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
import { AIServiceApi, MeasureContext } from "../api/useAIService";
import { useOktaTokens } from "@madie/madie-util";
import {
  getSessionId,
  setSessionId,
  clearSessionId,
  getPreferredModel,
  setPreferredModel,
} from "./chatSessionStorage";

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
  measureId?: string;
  measureContext?: MeasureContext;
}

function getMeasureIdFromUrl(): string | null {
  const match = window.location.pathname.match(/\/measures\/([^/]+)/);
  return match ? match[1] : null;
}

const CodeBlock = ({
  children,
  className,
  inline,
  ...rest
}: {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
  [key: string]: unknown;
}) => {
  const [copied, setCopied] = useState(false);
  const childrenStr = String(children).replace(/\n$/, "");
  const isInline =
    inline ||
    (!className && typeof children === "string" && !children.includes("\n"));

  if (isInline) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  const language = className?.replace("language-", "") ?? "";

  return (
    <div className="chat-window__code-block">
      <div className="chat-window__code-block-header">
        {language && (
          <span className="chat-window__code-block-lang">{language}</span>
        )}
        <button
          className="chat-window__code-block-copy"
          aria-label="copy code"
          onClick={() => {
            navigator.clipboard.writeText(childrenStr);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? (
            <CheckIcon sx={{ fontSize: 14 }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code className={className} {...rest}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  onClose,
  theme = "light",
  onToggleTheme,
  measureId: measureIdProp,
  measureContext,
}) => {
  const measureId = measureIdProp ?? getMeasureIdFromUrl();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [mode, setMode] = useState<Mode>("Ask");
  // provider → key_id returned by the ai-service (encrypted server-side)
  const [savedKeyIds, setSavedKeyIds] = useState<Record<string, string>>({});
  // provider → raw api_key (in-memory only, per-call mode, not persisted)
  const [sessionKeys, setSessionKeys] = useState<Record<string, string>>({});
  const [model, setModel] = useState(() => getPreferredModel("gpt-5.4"));
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputDraft, setInputDraft] = useState<string>("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamAbortRef = useRef<{ abort: () => void } | null>(null);
  const { getAccessToken } = useOktaTokens();
  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const aiService = useMemo(
    () => new AIServiceApi(() => getAccessTokenRef.current()),
    []
  );

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

  // Load or create a chat session for the current measure
  useEffect(() => {
    if (!measureId) return;
    (async () => {
      try {
        const storedSessionId = getSessionId(measureId);
        if (storedSessionId) {
          // Try to resume the existing session
          try {
            const session = await aiService.getSession(storedSessionId);
            setMessages(
              session.messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
            setActiveSessionId(storedSessionId);
            return;
          } catch {
            // Session not found (deleted or expired) — fall through to create a new one
            clearSessionId(measureId);
          }
        }
        // No stored session or it was stale — create a fresh one
        const newSession = await aiService.createSession(
          measureId,
          measureContext
        );
        setActiveSessionId(newSession.id);
        setSessionId(measureId, newSession.id);
        setMessages([]);
      } catch {
        // Session service unavailable — operate without persistence
      }
    })();
  }, [measureId, aiService]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Abort any in-flight stream when the component unmounts
  useEffect(() => {
    return () => {
      streamAbortRef.current?.abort();
    };
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

  const handleAbort = () => {
    streamAbortRef.current?.abort();
    setIsStreaming(false);
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
    setHistoryIndex(-1);
    setInputDraft("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const chatRequest = savedKeyIds[provider]
      ? {
          key_id: savedKeyIds[provider],
          model,
          messages: [{ role: "user", content: trimmed }],
          session_id: sessionId ?? undefined,
        }
      : {
          api_key: sessionKeys[provider],
          provider,
          model,
          messages: [{ role: "user", content: trimmed }],
          session_id: sessionId ?? undefined,
        };

    // Abort any previous in-flight stream before starting a new one
    streamAbortRef.current?.abort();

    setIsStreaming(true);

    // Add a placeholder assistant message that we'll stream into
    const assistantIdx = updatedMessages.length;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    streamAbortRef.current = aiService.claraChatStream(
      chatRequest,
      // onChunk — append streamed content to the assistant message
      (content) => {
        setIsStreaming(true);
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIdx] = {
            ...updated[assistantIdx],
            content: updated[assistantIdx].content + content,
          };
          return updated;
        });
      },
      (usage) => {
        setMessages((prev) => {
          const updated = [...prev];
          if (usage) {
            updated[assistantIdx] = {
              ...updated[assistantIdx],
              tokens: usage,
            };
          }
          return updated;
        });
        setIsStreaming(false);
      },
      (error) => {
        const { message, isAuthError } = parseErrorMessage(error);
        setMessages((prev) => {
          const updated = [...prev];
          // If nothing was streamed yet, replace the placeholder; otherwise append an error message
          if (!updated[assistantIdx].content) {
            updated[assistantIdx] = {
              role: "assistant",
              content: message,
              isError: true,
            };
          } else {
            updated.push({
              role: "assistant",
              content: message,
              isError: true,
            });
          }
          return updated;
        });
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
        setIsStreaming(false);
      }
    );
  };

  const handleNewSession = async () => {
    if (!measureId) return;
    // Abort any in-flight stream when starting a new session
    streamAbortRef.current?.abort();
    setIsStreaming(false);
    try {
      const newSession = await aiService.createSession(
        measureId,
        measureContext
      );
      setActiveSessionId(newSession.id);
      setSessionId(measureId, newSession.id);
      setMessages([]);
    } catch {
      // If session creation fails, just clear local messages
      setMessages([]);
    }
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
      return;
    }

    const userMessages = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content);

    if (e.key === "ArrowUp" && userMessages.length > 0) {
      // Only intercept ArrowUp when cursor is at the start of the textarea
      const textarea = e.currentTarget;
      if (textarea.selectionStart !== 0 && historyIndex === -1) return;
      e.preventDefault();
      const nextIndex =
        historyIndex === -1
          ? userMessages.length - 1
          : Math.max(0, historyIndex - 1);
      if (historyIndex === -1) setInputDraft(input);
      setHistoryIndex(nextIndex);
      setInput(userMessages[nextIndex]);
    } else if (e.key === "ArrowDown" && historyIndex !== -1) {
      e.preventDefault();
      if (historyIndex === userMessages.length - 1) {
        // Back to the draft
        setHistoryIndex(-1);
        setInput(inputDraft);
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(userMessages[nextIndex]);
      }
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
          {measureId && (
            <IconButton
              data-testid="new-session-button"
              aria-label="new chat session"
              size="small"
              onClick={handleNewSession}
              className="chat-window__new-session-btn"
              title="New session"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}
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
              Your AI‑powered assistant. I’m here to help you with CQL,
              measures, and everything related to measure authoring.
            </p>
          </div>
        )}
        {messages.map((msg, idx) =>
          msg.role === "assistant" && !msg.content && !msg.isError ? null : (
            <div
              key={idx}
              className={`chat-window__message chat-window__message--${
                msg.role
              }${msg.isError ? " chat-window__message--error" : ""}`}
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
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: CodeBlock,
                      pre: ({ children }) => <>{children}</>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "assistant" && msg.content && !msg.isError && (
                <div className="chat-window__message-actions">
                  <IconButton
                    data-testid={`copy-message-${idx}`}
                    aria-label="copy message"
                    size="small"
                    className="chat-window__copy-btn"
                    onClick={(e) => {
                      const messageEl = (e.currentTarget as HTMLElement)
                        .closest(".chat-window__message")
                        ?.querySelector(".chat-window__message-content");
                      const text = messageEl?.textContent ?? msg.content;
                      navigator.clipboard.writeText(text);
                      setCopiedIdx(idx);
                      setTimeout(() => setCopiedIdx(null), 2000);
                    }}
                  >
                    {copiedIdx === idx ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </div>
              )}
            </div>
          )
        )}
        {isStreaming &&
          messages.length > 0 &&
          !messages[messages.length - 1].content && (
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
            aria-label={isStreaming ? "abort request" : "send message"}
            className="chat-window__send-btn"
            onClick={isStreaming ? handleAbort : handleSend}
            disabled={!isStreaming && !input.trim()}
            size="small"
          >
            {isStreaming ? (
              <StopCircleIcon fontSize="small" color="error" />
            ) : (
              <SendIcon fontSize="small" />
            )}
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
                setPreferredModel(newModel);
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
              <ListSubheader sx={{ fontSize: "0.75rem", fontWeight: "800" }}>
                OPENAI
              </ListSubheader>
              {["gpt-5.4", "gpt-5.4mini", "gpt-5.3-codex"].map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: "0.75rem" }}>
                  {m}
                </MenuItem>
              ))}
              <Divider sx={{ margin: "4px 0" }} />
              <ListSubheader sx={{ fontSize: "0.75rem", fontWeight: "800" }}>
                GOOGLE
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
