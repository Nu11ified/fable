import { blogAdminRouter } from "./routers/admin/blog-admin";
import { commentsAdminRouter } from "./routers/admin/comments-admin";
import { githubStorageRouter } from "./routers/admin/github-storage";
import { portfolioAdminRouter } from "./routers/admin/portfolio-admin";
import { resumeAdminRouter } from "./routers/admin/resume-admin";
import { userAdminRouter } from "./routers/admin/user-admin";
import { commentMemberRouter } from "./routers/member/comment";
import { lockedBlogMemberRouter } from "./routers/member/locked-blog";
import { blogPublicRouter } from "./routers/public/blog";
import { portfolioPublicRouter } from "./routers/public/portfolio";
import { resumePublicRouter } from "./routers/public/resume";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: createTRPCRouter({
    blog: blogAdminRouter,
    comments: commentsAdminRouter,
    githubStorage: githubStorageRouter,
    portfolio: portfolioAdminRouter,
    resume: resumeAdminRouter,
    user: userAdminRouter,
  }),
  member: createTRPCRouter({
    comment: commentMemberRouter,
    lockedBlog: lockedBlogMemberRouter,
  }),
  public: createTRPCRouter({
    blog: blogPublicRouter,
    portfolio: portfolioPublicRouter,
    resume: resumePublicRouter,
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
