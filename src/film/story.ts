// One story per film: progress is written by that film's GSAP master timeline, read by its render loop and UI.
export type Story = {
  progress: number; // target scroll progress (0–1)
  smooth: number; // eased progress used for rendering
  on: (fn: (p: number) => void) => () => void;
  emit: () => void;
};

export function createStory(): Story {
  const listeners = new Set<(p: number) => void>();
  const s: Story = {
    progress: 0,
    smooth: 0,
    on: (fn) => {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    emit: () => listeners.forEach((fn) => fn(s.smooth)),
  };
  return s;
}

// ease toward the scroll target; identical maths forwards and backwards
export function step(s: Story, dt: number) {
  s.smooth += (s.progress - s.smooth) * (1 - Math.pow(0.0008, Math.min(dt, 0.1)));
  if (Math.abs(s.progress - s.smooth) < 1e-5) s.smooth = s.progress;
  s.emit();
}

export const stories = { making: createStory(), vitrine: createStory() };
