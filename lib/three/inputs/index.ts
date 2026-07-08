import { createKeyboardTracker, KeyboardState } from './keyboard';
import { createMouseTracker, MouseState } from './mouse';
import { createTouchTracker, TouchState } from './touch';

export interface InputState {
  mouse: MouseState;
  touch: TouchState;
  keyboard: KeyboardState;
}

export function createInput() {
  const mouseTracker = createMouseTracker();
  const touchTracker = createTouchTracker();
  const keyboardTracker = createKeyboardTracker();

  const input: InputState = {
    mouse: mouseTracker.mouse,
    touch: touchTracker.touch,
    keyboard: keyboardTracker.keyboard,
  };

  function dispose() {
    mouseTracker.dispose();
    touchTracker.dispose();
    keyboardTracker.dispose();
  }

  return {
    input,
    dispose,
  };
}
