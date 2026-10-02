import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Mo20ProfilePage } from "@/components/mo20-profile";
import type { Mo20Profile } from "@/lib/anilist.functions";

const profile: Mo20Profile = {
  name: "Test",
  profileUrl: "https://anilist.co/user/Test",
  avatarUrl: "https://example.com/avatar.png",
  anime: { total: 10, completed: 7, daysWatched: 12.34, meanScore: 80.5 },
  manga: { total: 20, completed: 15, chaptersRead: 1234, meanScore: 90 },
  watching: [
    { id: 1, title: "Some Anime", progress: 3, total: 12, url: "https://anilist.co/anime/1" },
  ],
  reading: [
    { id: 2, title: "Some Manga", progress: 40, total: null, url: "https://anilist.co/manga/2" },
  ],
};

afterEach(() => cleanup());

describe("Mo20ProfilePage", () => {
  it("renders the five scenes", () => {
    const { container } = render(<Mo20ProfilePage profile={profile} />);
    expect(container.querySelectorAll("section.scene")).toHaveLength(5);
  });

  it("shows stats derived from the profile", () => {
    render(<Mo20ProfilePage profile={profile} />);
    expect(screen.getByText("12.3 days")).toBeTruthy();
    expect(screen.getByText("1,234")).toBeTruthy();
  });

  it("lists what is currently being watched and read", () => {
    render(<Mo20ProfilePage profile={profile} />);
    expect(screen.getByText("Some Anime")).toBeTruthy();
    expect(screen.getByText("Some Manga")).toBeTruthy();
  });
});
