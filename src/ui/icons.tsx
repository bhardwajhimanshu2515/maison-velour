// Line icons in the style of the design (1.6px strokes, round caps). All decorative unless labelled by the caller.
const P = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconCake = () => (
  <svg {...P}><path d="M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" /><path d="M5 15.5c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0" /><path d="M12 12V8" /><path d="M12 5.5c.8-.8.8-1.7 0-2.5-.8.8-.8 1.7 0 2.5Z" /></svg>
);
export const IconClock = () => (
  <svg {...P}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconChat = () => (
  <svg {...P}><path d="M4.5 19.5 6 16a8 8 0 1 1 3 2.6l-4.5.9Z" /><path d="M9 11h6M9 14h4" /></svg>
);
export const IconBox = () => (
  <svg {...P}><path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" /><path d="M3 9h18M9 9V6a3 3 0 0 1 6 0v3" /></svg>
);
export const IconArrow = () => (
  <svg {...P} width={16} height={16}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconHeart = ({ filled }: { filled?: boolean }) => (
  <svg {...P} width={16} height={16} fill={filled ? "currentColor" : "none"}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
);
export const IconGlass = () => (
  <svg {...P}><path d="M7 3h10l-1 7a4 4 0 0 1-8 0L7 3Z" /><path d="M12 14v6M8.5 20h7" /></svg>
);
export const IconPencil = () => (
  <svg {...P}><path d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5Z" /><path d="M12.5 7.5l4 4" /></svg>
);
export const IconClose = () => (
  <svg {...P}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
// Indian food marks: green square + dot for eggless, brown square + dot for egg
export const MarkEggless = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true"><rect x="0.75" y="0.75" width="11.5" height="11.5" rx="2" fill="none" stroke="#2f8a48" strokeWidth="1.5" /><circle cx="6.5" cy="6.5" r="2.6" fill="#2f8a48" /></svg>
);
export const MarkEgg = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true"><rect x="0.75" y="0.75" width="11.5" height="11.5" rx="2" fill="none" stroke="#844d2f" strokeWidth="1.5" /><circle cx="6.5" cy="6.5" r="2.6" fill="#844d2f" /></svg>
);
