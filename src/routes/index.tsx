import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Mo20ProfilePage, ProfileUnavailable } from "@/components/mo20-profile";
import { getMo20Profile } from "@/lib/anilist.functions";

const profileQuery = queryOptions({
  queryKey: ["mo20", "anilist-profile"],
  queryFn: () => getMo20Profile(),
  staleTime: 5 * 60 * 1000,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MO20 — Manga · Manhwa · Anime" },
      {
        name: "description",
        content: "MO20’s cinematic personal manga, manhwa and anime archive, live from AniList.",
      },
      { property: "og:title", content: "MO20 — Manga · Manhwa · Anime" },
      {
        property: "og:description",
        content: "A life measured in chapters. Explore MO20’s live media archive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Index,
  pendingComponent: () => (
    <main className="mo20-shell loading">
      <span>MO20</span>
      <i />
    </main>
  ),
  errorComponent: ProfileUnavailable,
});

function Index() {
  const { data } = useSuspenseQuery(profileQuery);
  return <Mo20ProfilePage profile={data} />;
}
