# Maison Velour — Patisserie

A scroll-driven bakery website. Two films play forwards as you scroll down and in reverse as you scroll up,
drawn with Three.js / WebGL and driven by GSAP ScrollTrigger + Lenis. The rest of the page follows the
"Homepage — glass lid hero, cake cards" design: collection with filters, size picker, and a "Your box" order drawer.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Deploy

- **Netlify:** import the repo — `netlify.toml` sets build `npm run build`, publish `dist`.
- **Vercel:** import the repo — `vercel.json` sets the same.
- Any static host: run `npm run build` and upload `dist/`.

## Project layout

- `src/narrative/config.ts` — both films' acts and timings, the counter products, the menu, sizes and card colours
- `src/film/` — WebGL film plane, frame loader, scroll story, no-WebGL fallback
- `src/ui/` — overlays on the films (hero copy, captions, product rail), icons
- `src/sections/` — collection, size sheet, box drawer, trust strip, kitchen, footer
- `public/frames/` — full-quality WebP frame sequences of the two films (`d/` making-of, `vd/` counter)
- `public/menu/`, `public/cakes/` — cake photos

## Rebuilding assets (optional)

```bash
scripts/extract_frames.sh making.mp4          # film 1 frames -> public/frames/d/
scripts/extract_frames.sh counter.mp4 v       # film 2 frames + counter cake crops
python3 scripts/design_crops.py page1.jpg page2.jpg page3.jpg public/menu
python3 scripts/recolor_backdrops.py public/menu
```

Placeholders to replace before launch: address, phone numbers, FSSAI licence, policy links.
