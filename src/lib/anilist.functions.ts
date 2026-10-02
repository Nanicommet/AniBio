import { createServerFn } from "@tanstack/react-start";

export type CurrentTitle = {
  id: number;
  title: string;
  progress: number;
  total: number | null;
  url: string;
};

export type Mo20Profile = {
  name: string;
  profileUrl: string;
  avatarUrl: string;
  anime: { total: number; completed: number; daysWatched: number; meanScore: number };
  manga: { total: number; completed: number; chaptersRead: number; meanScore: number };
  watching: CurrentTitle[];
  reading: CurrentTitle[];
};

type AniListEntry = {
  id: number;
  progress: number;
  media: {
    title: { userPreferred: string };
    episodes?: number | null;
    chapters?: number | null;
    siteUrl: string;
  };
};

type AniListStatus = { status: string; count: number };

type AniListResponse = {
  data?: {
    User: {
      name: string;
      siteUrl: string;
      avatar: { large: string };
      statistics: {
        anime: {
          count: number;
          minutesWatched: number;
          meanScore: number;
          statuses: AniListStatus[];
        };
        manga: {
          count: number;
          chaptersRead: number;
          meanScore: number;
          statuses: AniListStatus[];
        };
      };
    };
    watching: { lists: Array<{ entries: AniListEntry[] }> } | null;
    reading: { lists: Array<{ entries: AniListEntry[] }> } | null;
  };
  errors?: Array<{ message: string }>;
};

const query = `query Mo20Profile($id: Int!) {
  User(id: $id) {
    name siteUrl avatar { large }
    statistics {
      anime { count minutesWatched meanScore statuses { status count } }
      manga { count chaptersRead meanScore statuses { status count } }
    }
  }
  watching: MediaListCollection(userId: $id, type: ANIME, status: CURRENT, sort: UPDATED_TIME_DESC) {
    lists { entries { id progress media { title { userPreferred } episodes siteUrl } } }
  }
  reading: MediaListCollection(userId: $id, type: MANGA, status: CURRENT, sort: UPDATED_TIME_DESC) {
    lists { entries { id progress media { title { userPreferred } chapters siteUrl } } }
  }
}`;

function completed(statuses: AniListStatus[]) {
  return statuses.find((item) => item.status === "COMPLETED")?.count ?? 0;
}

function toCurrent(entry: AniListEntry, type: "anime" | "manga"): CurrentTitle {
  return {
    id: entry.id,
    title: entry.media.title.userPreferred,
    progress: entry.progress,
    total: type === "anime" ? (entry.media.episodes ?? null) : (entry.media.chapters ?? null),
    url: entry.media.siteUrl,
  };
}

function flatten(c: { lists: Array<{ entries: AniListEntry[] }> } | null) {
  return (c?.lists ?? []).flatMap((l) => l.entries ?? []);
}

let cache: { at: number; value: Mo20Profile } | null = null;

export const getMo20Profile = createServerFn({ method: "GET" }).handler(
  async (): Promise<Mo20Profile> => {
    if (cache && Date.now() - cache.at < 300_000) return cache.value;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    let response: Response;
    try {
      response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query, variables: { id: 6593775 } }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error("AniList fetch failed", err);
      throw new Error("AniList could not be reached.");
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      console.error("AniList status", response.status, await response.text().catch(() => ""));
      throw new Error("AniList is temporarily unavailable.");
    }
    const payload = (await response.json()) as AniListResponse;
    if (!payload.data || payload.errors?.length) {
      throw new Error(payload.errors?.[0]?.message ?? "AniList returned no profile data.");
    }

    const { User, watching, reading } = payload.data;
    const value: Mo20Profile = {
      name: User.name,
      profileUrl: User.siteUrl,
      avatarUrl: User.avatar.large,
      anime: {
        total: User.statistics.anime.count,
        completed: completed(User.statistics.anime.statuses),
        daysWatched: User.statistics.anime.minutesWatched / 1440,
        meanScore: User.statistics.anime.meanScore,
      },
      manga: {
        total: User.statistics.manga.count,
        completed: completed(User.statistics.manga.statuses),
        chaptersRead: User.statistics.manga.chaptersRead,
        meanScore: User.statistics.manga.meanScore,
      },
      watching: flatten(watching).map((entry) => toCurrent(entry, "anime")),
      reading: flatten(reading).map((entry) => toCurrent(entry, "manga")),
    };
    cache = { at: Date.now(), value };
    return value;
  },
);
