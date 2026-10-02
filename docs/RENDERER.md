# Dynamic GIF renderer

The renderer draws live AniList numbers **into** the original GIF frames, so the data looks like part of the artwork rather than an HTML block under it. It is deployed on Vercel as MO20's "Dynamic GIF v7".

## Endpoints

```text
/api/gif?scene=identity
/api/gif?scene=archive
/api/gif?scene=current
/api/gif?scene=reading
/api/gif?scene=signature
```

## Pipeline

1. Receive the scene name.
2. Fetch AniList data.
3. Fetch the original GIF for that scene.
4. Decode every frame into a **full RGBA page** (sharp). This respects frame offsets, transparency and disposal.
5. Tile the dynamic SVG overlay once per full page.
6. Re-encode the complete frames as a new GIF (gifwrap), keeping frame timing and looping.
7. Serve it with a CDN cache.

If rendering fails, the original GIF is the safe fallback.

## Why full-frame decoding matters

GIF frames are not always complete images. They can be partial rectangles with offsets, transparency and disposal methods. Drawing text straight onto raw frames caused ghosting, flashing, accumulated frames and broken backgrounds in earlier attempts. v7 fixes this by reconstructing full frames before drawing.

## Deployment facts (v7)

- Runtime dependencies: `sharp` 0.34.3, `gifwrap` 0.10.1
- Vercel function: `api/gif.js`, `maxDuration` 60 s, 1024 MB memory
- Caching: 1 hour CDN cache, `stale-if-error` 24 hours
- Refresh model: periodically refreshed cached data (not WebSocket or push real-time)

## Status in this repository

The renderer's `api/gif.js` is not part of this repo yet. It runs from the live Vercel deployment. Adding its source here is the first item on the roadmap.
