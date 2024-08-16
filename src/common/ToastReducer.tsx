type ActionType = "SHOW_TOAST" | "HIDE_TOAST";
interface Payload {
  type: string;
  message: string;
}
export interface ToastState {
  type: "danger" | "success";
  open?: boolean;
  message?: string;
}
export interface Action {
  type: ActionType;
  payload?: Payload;
}

export default function toastReducer(
  state: ToastState,
  action: Action
): ToastState {
  if (action.type === "SHOW_TOAST") {
    return {
      open: true,
      type: action.payload.type,
      message: action.payload.message,
    } as ToastState;
  }
  if (action.type === "HIDE_TOAST") {
    return {
      open: false,
      type: "danger",
      message: "",
    } as ToastState;
  }
  return state;
}
