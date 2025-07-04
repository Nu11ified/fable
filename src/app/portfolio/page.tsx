import { api, HydrateClient } from "@/trpc/server";
import { PortfolioContent } from "./_components/portfolio-content";

export default async function PortfolioPage() {
  // Prefetch portfolio data for better performance
  await api.public.portfolio.getAll.prefetch();

  return (
    <HydrateClient>
      <PortfolioContent />
    </HydrateClient>
  );
} 