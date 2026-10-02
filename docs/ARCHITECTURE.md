# Architecture

AniBio has three layers. Keep them separate.

```text
Layer A — Visual profile        five animated GIF scenes + AniList About
Layer B — Dynamic infrastructure AniList data + endpoint + GIF renderer + cache
Layer C — Reusable framework     username in, cinematic profile out (roadmap)
```

## Data flow

```text
AniList username / ID
      ↓
AniList GraphQL (https://graphql.anilist.co)
      ↓
Normalized profile data
      ↓
Scene / template system
      ↓
Visual renderer
      ↓
Animated profile  →  web page or AniList About
```

## AniList API notes

- Use `User.statistics`. `User.stats` is deprecated.
- `daysWatched = minutesWatched / 1440`.
- "Completed" is the `COMPLETED` entry in the `statuses` distribution. `count` is the total number of entries, not completed ones.
- Manga chapters come from `chaptersRead`.
- Currently watching/reading is `MediaListCollection` with `status: CURRENT`. Lists are grouped by status and custom lists, so flatten them and deduplicate by media ID where needed.

## Profile shape in the code today

Defined in `src/lib/anilist.functions.ts`:

```ts
type Mo20Profile = {
  name: string;
  profileUrl: string;
  avatarUrl: string;
  anime: { total: number; completed: number; daysWatched: number; meanScore: number };
  manga: { total: number; completed: number; chaptersRead: number; meanScore: number };
  watching: CurrentTitle[];
  reading: CurrentTitle[];
};
```

The principle for future work: **scenes consume this normalized data and never query AniList themselves.**

## Scene system (planned direction)

A scene is a background plus data bindings:

```json
{
  "scene": "archive",
  "background": "https://example.com/archive.gif",
  "elements": [{ "key": "animeCount", "source": "anime.count", "x": 0.72, "y": 0.41 }]
}
```

Later this can also carry typography, colors and responsive rules. This schema is a proposal, not implemented yet.

## Design rules

- Dark, cinematic base: black and navy, subtle cyan or violet, restrained glow.
- Editorial typography, disciplined spacing, subtle motion, responsive layouts.
- Real data, personal tone.
- Avoid: dashboards, card grids, heavy neon, excessive glassmorphism, decorative Unicode for important text (plain `MO20` is safer than fancy glyph variants).

## AniList About is Markdown

It supports images, GIFs and links. It does not run JavaScript, React or a native audio player. Keep two layers apart:

1. **Universal About content** — Markdown, images, GIFs, links.
2. **Optional browser enhancement** — a userscript or extension, only for people who install it.
