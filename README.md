# AI Fashion Pose Builder

A luxury fashion editorial prompt library and prompt-building studio featuring **81 numbered poses**, Uzbek pose descriptions, distinct pose-specific visual reference plates, character identity lock controls, wardrobe/camera/lighting configurators, LocalStorage persistence, and TXT/JSON export.

---

## Features

- **Dashboard & 81-Pose Completion Overview**: Search by pose number (`1–81`) or English/Uzbek title, filter by category, status (`Newly Authored Drafts`, `Edited`, `Favorites`), switch between `Grid` and `List` views, and jump to any pose via the 81-number index.
- **81 Numbered Pose Cards**:
  - Left: Distinct pose-specific editorial visual reference illustration (`referenceImage`).
  - Right: Pose number (`No. 01`–`No. 81`), English title, Uzbek title, and Uzbek posture description (`titleUz`, `descriptionUz`).
  - Below: Editable English prompt `<textarea>` with instant `Copy Prompt` and reset-to-draft controls.
  - Preserves exact titles for entries **46–54** (`Leaning on Wall`, `Sitting on Bench`, `Sitting with Legs Crossed`, `Looking in Distance`, `Holding a Phone`, `Adjusting Hair`, `Walking Pose`, `Holding Sunglasses`, `Arms Up Pose`).
- **Source Transparency**: Because prior conversation prompt text was not supplied in the build session, all 81 initial prompts are honestly marked as `newly_authored` drafts rather than fabricated historical text. Any user edit switches the pose status to `edited` and persists in `localStorage`.
- **Character Reference & Identity Lock**:
  - Upload and preview a local character reference image (`JPG`, `PNG`, `WEBP`) with replace/remove support.
  - Toggle **Identity Lock** to include facial identity, face shape, eyes, nose, lips, skin tone, hairstyle, and distinctive features in the master prompt.
  - Includes an explicit technical notice: text prompts alone do not guarantee pixel-perfect identity preservation across AI image models—always supply your reference image to the target generator's face-reference / IP-Adapter input.
- **Fashion, Camera, Lighting & Background Studio**:
  - Configure outfit description, clothing style, shoes, accessories, handbag, and jewelry (plus quick editorial presets).
  - Configure camera angle (`eye level`, `low angle`, `high angle`, `overhead`, `side angle`, `front angle`), shot type (`close-up`, `medium`, `three-quarter`, `full body`), lens (`35mm`, `50mm`, `85mm`, `105mm`), distance, composition, and aspect ratio (`2:3`, `3:4`, `4:5`, `9:16`, `1:1`).
  - Configure lighting (`Soft studio`, `Beauty lighting`, `Rembrandt lighting`, `Golden hour`, `Cinematic lighting`, `Natural daylight`) and background (`White studio`, `Luxury interior`, `Urban street`, `Nature`, or `Custom` background field).
- **Prompt Generator & Export**:
  - Live-compiled English prompt with manual editing, `Copy Prompt`, `Regenerate`, and `Reset`.
  - Export selected prompt as `.TXT`, export all 81 poses as `.TXT`, export the complete 81-pose library as `.JSON`, or import a `.JSON` backup.

---

## Running in Google AI Studio

1. Open this project in **Google AI Studio Build**.
2. No paid API keys or external database setup are required—everything runs locally in the browser using `localStorage`.
3. Click **Preview** (or run the dev server on port `3000`) to use the application immediately.
4. To deploy from Google AI Studio, click **Deploy**; the production bundle builds via `npm run build`.

## Running Locally

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```
