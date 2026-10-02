import { ExternalLink, Headphones, MapPin, Play, Volume2 } from "lucide-react";
import type { CurrentTitle, Mo20Profile } from "@/lib/anilist.functions";

const scenes = [
  ["01", "Identity", "identity"],
  ["02", "Archive", "archive"],
  ["03", "Current", "current"],
  ["04", "Reading", "reading-mode"],
  ["05", "Signature", "signature"],
] as const;

const gifs = {
  identity: "https://i.ibb.co/k20z7LVD/01-identity.gif",
  archive: "https://i.ibb.co/PszN2M3z/02-archive.gif",
  current: "https://i.ibb.co/twRyKKWP/03-current-state.gif",
  reading: "https://i.ibb.co/vvrWpVfc/04-reading-mode.gif",
  signature: "https://i.ibb.co/JFtfqNm1/05-signature.gif",
} as const;

function Scene({
  id,
  number,
  label,
  src,
  children,
  className = "",
}: {
  id: string;
  number: string;
  label: string;
  src: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scene ${className}`} aria-labelledby={`${id}-label`}>
      <div className="scene-kicker" id={`${id}-label`}>
        <span>{number}</span>
        {label}
      </div>
      <div className="scene-frame">
        <img className="scene-gif" src={src} alt="" aria-hidden="true" />
        <div className="scene-overlay">{children}</div>
      </div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function CurrentList({ title, entries }: { title: string; entries: CurrentTitle[] }) {
  return (
    <div className="current-list">
      <div className="current-heading">
        <span>{title}</span>
        <strong>{entries.length.toString().padStart(2, "0")}</strong>
      </div>
      <div className="current-titles">
        {entries.slice(0, 3).map((entry) => (
          <a key={entry.id} href={entry.url} target="_blank" rel="noreferrer">
            <span>{entry.title}</span>
            <small>
              {entry.progress}
              {entry.total ? ` / ${entry.total}` : ""}
            </small>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Mo20ProfilePage({ profile }: { profile: Mo20Profile }) {
  return (
    <main className="mo20-shell">
      <header className="site-header">
        <a className="wordmark" href="#identity" aria-label="MO20 home">
          MO<span>20</span>
        </a>
        <span className="header-line" />
        <a className="anilist-link" href={profile.profileUrl} target="_blank" rel="noreferrer">
          AniList <ExternalLink size={12} />
        </a>
      </header>

      <nav className="scene-nav" aria-label="Scene navigation">
        {scenes.map(([number, label, id]) => (
          <a key={id} href={`#${id}`}>
            <span>{number}</span>
            <b>{label}</b>
          </a>
        ))}
      </nav>

      <div className="scene-stack">
        <Scene
          id="identity"
          number="01"
          label="Identity"
          src={gifs.identity}
          className="identity-scene"
        >
          <div className="identity-live">
            <img src={profile.avatarUrl} alt={`${profile.name} AniList avatar`} />
            <div>
              <span>ANILIST // 6593775</span>
              <small>
                <MapPin size={11} /> Tunisia
              </small>
            </div>
          </div>
        </Scene>

        <Scene
          id="archive"
          number="02"
          label="Archive"
          src={gifs.archive}
          className="archive-scene"
        >
          <div className="archive-live">
            <div className="archive-column">
              <Stat
                label="Anime completed"
                value={profile.anime.completed.toLocaleString()}
                note={`${profile.anime.total} total entries`}
              />
              <Stat label="Time watched" value={`${profile.anime.daysWatched.toFixed(1)} days`} />
              <Stat label="Mean score" value={profile.anime.meanScore.toFixed(1)} />
            </div>
            <div className="archive-column">
              <Stat
                label="Manga completed"
                value={profile.manga.completed.toLocaleString()}
                note={`${profile.manga.total} total entries`}
              />
              <Stat label="Chapters read" value={profile.manga.chaptersRead.toLocaleString()} />
              <Stat label="Mean score" value={profile.manga.meanScore.toFixed(1)} />
            </div>
          </div>
        </Scene>

        <Scene
          id="current"
          number="03"
          label="Current state"
          src={gifs.current}
          className="current-scene"
        >
          <div className="current-live">
            <CurrentList title="Watching" entries={profile.watching} />
            <CurrentList title="Reading" entries={profile.reading} />
          </div>
        </Scene>

        <Scene
          id="reading-mode"
          number="04"
          label="Reading mode"
          src={gifs.reading}
          className="reading-scene"
        >
          <ol className="reading-sequence">
            <li>
              <i>01</i>
              <span>find something interesting</span>
            </li>
            <li>
              <i>02</i>
              <span>one chapter</span>
            </li>
            <li>
              <i>03</i>
              <span>87 chapters later</span>
            </li>
            <li>
              <i>04</i>
              <span>4 AM</span>
            </li>
          </ol>
          <div className="reading-pulse">
            <span>session state</span>
            <strong>DEEP READING</strong>
            <small>{profile.reading.length} stories open</small>
          </div>
        </Scene>

        <Scene
          id="signature"
          number="05"
          label="Signature / now playing"
          src={gifs.signature}
          className="signature-scene"
        >
          <a
            className="now-playing"
            href="https://open.spotify.com/search/late%20night%20reading"
            target="_blank"
            rel="noreferrer"
            aria-label="Find a late night reading mix on Spotify"
          >
            <span className="play-mark">
              <Play size={13} fill="currentColor" />
            </span>
            <span className="track-copy">
              <small>NOW PLAYING // AMBIENCE</small>
              <strong>Late night, between panels</strong>
            </span>
            <span className="equalizer" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <Volume2 className="volume" size={15} />
          </a>
        </Scene>
      </div>

      <footer>
        <Headphones size={14} />
        <span>MO20 — MANGA · MANHWA · ANIME</span>
        <span>Live archive via AniList</span>
      </footer>
    </main>
  );
}

export function ProfileUnavailable() {
  return (
    <main className="mo20-shell unavailable">
      <div>
        <span>MO20 // SIGNAL LOST</span>
        <h1>The archive is between worlds.</h1>
        <p>AniList could not be reached. Try the transmission again shortly.</p>
        <a href="/">Reconnect</a>
      </div>
    </main>
  );
}
