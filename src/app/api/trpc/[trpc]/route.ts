import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
    responseMeta(opts) {
      const { ctx, paths, errors, type } = opts;
      
      // Check if all procedures are public and are query requests
      const allPublic = paths?.every((path) => path.includes('public'));
      const allOk = errors.length === 0;
      const isQuery = type === 'query';
      
      // Check if user is an admin (same logic as adminProcedure)
      const isAdmin = ctx?.session?.user?.email === env.GITHUB_USER_EMAIL;
      
      // Apply heavy caching for public query requests that succeed, but only for non-admin users
      if (allPublic && allOk && isQuery && !isAdmin) {
        // Cache for 1 hour with stale-while-revalidate for 24 hours
        // This prevents constant DB hits from page refreshes for regular users
        const ONE_HOUR_IN_SECONDS = 60 * 60;
        const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
        
        return {
          headers: {
            'Cache-Control': `s-maxage=${ONE_HOUR_IN_SECONDS}, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
          },
        };
      }
      
      // For admins, apply minimal caching (5 seconds) so they see their changes quickly
      if (allPublic && allOk && isQuery && isAdmin) {
        return {
          headers: {
            'Cache-Control': 's-maxage=5, stale-while-revalidate=30',
          },
        };
      }
      
      return {};
    },
  });

export { handler as GET, handler as POST };
