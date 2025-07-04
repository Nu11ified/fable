import { api, HydrateClient } from "@/trpc/server";
import { HomeContent } from "./_components/home-content";

export default async function Home() {
  // Prefetch home page data for better performance
  await api.public.home.getData.prefetch();

  return (
    <HydrateClient>
      <HomeContent />
    </HydrateClient>
  );
}


