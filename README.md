# Modus Operandi: Aerial Assault & Underground Siege

A science communication project animating the two-stage infection strategy of *Heterobasidion annosum* - one of the most economically damaging fungal pathogens of conifers in the northern hemisphere.

> Based on: Asiegbu, F.O., Adomas, A. & Stenlid, J.A.N. (2005). "Conifer root and butt rot caused by *Heterobasidion annosum* (Fr.) Bref. s.l." *Molecular Plant Pathology*, 6(4), 395–409. https://doi.org/10.1111/j.1364-3703.2005.00295.x

---

## Files

| File | Description |
|------|-------------|
| `fungal_invasion_animation.html` | Standalone HTML5 canvas animation — open in any browser, no install needed |
| `render_frames.js` | Node.js script to render 600 PNG frames for MP4 encoding |
| `infection_stages_widget.html` | Interactive click-to-learn widget: click trees, spores, or fungi to reveal verified facts about Primary and Secondary infection |

---

## How to reproduce the MP4

### Requirements
- Node.js ≥ 16
- npm package: `canvas` (v2.x)
- FFmpeg with libx264 support

### Steps

```bash
# 1. Install the canvas package
npm install canvas

# 2. Render 600 PNG frames to /tmp/anim_frames/
node render_frames.js

# 3. Encode frames to MP4
ffmpeg -y -framerate 30 -i /tmp/anim_frames/f%05d.png \
  -c:v libx264 -preset slow -crf 18 \
  -pix_fmt yuv420p -movflags +faststart \
  fungal_invasion.mp4
```

Output: a 20-second, 30fps H.264 MP4 (~3 MB).

---

## Watch the animation

▶️ [YouTube — Modus Operandi: Aerial Assault & Underground Siege](#) *(https://www.youtube.com/watch?v=W-Cg4ziAWfU)*

---

## Science background

**Primary infection** — initiated by airborne basidiospores landing on freshly cut stumps or wounded bark/roots. Spores travel long distances on wind currents in summer but cannot infect healthy, uninjured roots.

**Secondary infection** — once established in a stump, mycelium spreads through the root system and colonises neighbouring healthy trees via root contacts and root grafts underground — no new spores required.

---

## Credits

Conceived and created by **Hafiz Umair Masood Awan**  
Science communication · Forest pathology · HTML5 canvas animation
Watch the animation: https://www.youtube.com/watch?v=W-Cg4ziAWfU
