export interface KeyboardState {
  shift: boolean;
  space: boolean;
}

export function createKeyboardTracker() {
  const keyboard: KeyboardState = {
    shift: false,
    space: false,
  };

  // Keyboard listener hooks will be appended here later

  function dispose() {}

  return { keyboard, dispose };
}
