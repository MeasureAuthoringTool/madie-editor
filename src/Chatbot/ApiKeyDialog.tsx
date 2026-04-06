import React, { useState, useRef, useCallback } from "react";
import { TextField, Checkbox, FormControlLabel, Button } from "@mui/material";
import "./ApiKeyDialog.scss";

interface ApiKeyDialogProps {
  model: string;
  onSave: (apiKey: string, persist: boolean) => void;
  onCancel: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  model,
  onSave,
  onCancel,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [persistKey, setPersistKey] = useState(false);
  const [dialogPos, setDialogPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        (e.target as HTMLElement).closest(
          "input, button, label, .MuiTextField-root, .MuiCheckbox-root"
        )
      )
        return;
      e.preventDefault();
      if (!dialogRef.current) return;
      const currentX = dialogPos?.x ?? 0;
      const currentY = dialogPos?.y ?? 0;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: currentX,
        origY: currentY,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        setDialogPos({
          x: dragRef.current.origX + dx,
          y: dragRef.current.origY + dy,
        });
      };
      const handleMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [dialogPos]
  );

  const handleSave = () => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) return;
    onSave(trimmedKey, persistKey);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div
      ref={dialogRef}
      className="apikey-dialog"
      data-testid="apikey-dialog"
      style={
        dialogPos
          ? {
              position: "absolute",
              left: `calc(50% + ${dialogPos.x}px)`,
              top: `calc(50% + ${dialogPos.y}px)`,
              transform: "translate(-50%, -50%)",
              zIndex: 20,
            }
          : undefined
      }
    >
      <div
        role="toolbar"
        className="apikey-dialog__header"
        onMouseDown={handleDragMouseDown}
        style={{ cursor: "grab" }}
      >
        <span>API Key for {model}</span>
      </div>
      <TextField
        data-testid="apikey-input"
        type="password"
        size="small"
        fullWidth
        placeholder="Enter/Paste your API key here"
        value={apiKeyInput}
        onChange={(e) => setApiKeyInput(e.target.value)}
        sx={{
          mt: 1,
          "& .MuiInputBase-input": {
            fontSize: "0.82rem",
            color: "inherit",
          },
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            data-testid="persist-checkbox"
            size="small"
            checked={persistKey}
            onChange={(e) => setPersistKey(e.target.checked)}
          />
        }
        label="Persist for future"
        sx={{ mt: 0.5, "& .MuiTypography-root": { fontSize: "0.78rem" } }}
      />
      <div className="apikey-dialog__actions">
        <Button
          data-testid="apikey-cancel-btn"
          size="small"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          data-testid="apikey-save-btn"
          size="small"
          variant="contained"
          disabled={!apiKeyInput.trim()}
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
