import toastReducer, { Action } from "./ToastReducer";

describe("Toast Reducer tests", () => {
  it("should handle show toast", () => {
    const action = {
      type: "SHOW_TOAST",
      payload: { message: "something went wrong", type: "danger" },
    } as Action;
    expect(toastReducer(undefined, action)).toEqual({
      open: true,
      type: action.payload.type,
      message: action.payload.message,
    });
  });

  it("should handle hide toast", () => {
    const action = {
      type: "HIDE_TOAST",
      payload: { message: "", type: "danger" },
    } as Action;
    expect(toastReducer(undefined, action)).toEqual({
      open: false,
      type: action.payload.type,
      message: action.payload.message,
    });
  });
});
