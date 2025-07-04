import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { blogPosts } from "@/server/db/schemas/blog";
import { portfolioProjects } from "@/server/db/schemas/portfolio";
import { skills, personalInfo } from "@/server/db/schemas/resume";
import { 
  homepageConfig, 
  homepageStats, 
  homepageServices, 
  homepageSkills, 
  homepageTimeline 
} from "@/server/db/schemas/homepage";
import { eq } from "drizzle-orm";

export const homePublicRouter = createTRPCRouter({
  getData: publicProcedure.query(async () => {
    // Fetch all home page data in parallel for better performance
    const [
      starredProjects, 
      starredBlogPosts, 
      allSkills, 
      personalInfoData,
      homepageConfigData,
      homepageStatsData,
      homepageServicesData,
      homepageSkillsData,
      homepageTimelineData
    ] = await Promise.all([
      // Get starred portfolio projects
      db.query.portfolioProjects.findMany({
        where: eq(portfolioProjects.isStarred, true),
        orderBy: (portfolioProjects, { desc }) => [desc(portfolioProjects.createdAt)],
      }),
      
      // Get starred blog posts (only non-locked ones for public)
      db.query.blogPosts.findMany({
        where: (blogPosts, { and, eq }) => 
          and(eq(blogPosts.isStarred, true), eq(blogPosts.isLocked, false)),
        with: {
          author: true,
        },
        orderBy: (blogPosts, { desc }) => [desc(blogPosts.createdAt)],
      }),
      
      // Get all skills grouped by category
      db.query.skills.findMany({
        orderBy: (skills, { asc }) => [asc(skills.category), asc(skills.name)],
      }),
      
      // Get personal info
      db.query.personalInfo.findFirst(),
      
      // Get homepage configuration
      db.query.homepageConfig.findFirst(),
      
      // Get homepage stats
      db.query.homepageStats.findMany({
        orderBy: (homepageStats, { asc }) => [asc(homepageStats.order)],
      }),
      
      // Get homepage services
      db.query.homepageServices.findMany({
        orderBy: (homepageServices, { asc }) => [asc(homepageServices.order)],
      }),
      
      // Get homepage skills
      db.query.homepageSkills.findMany({
        orderBy: (homepageSkills, { asc }) => [asc(homepageSkills.order)],
      }),
      
      // Get homepage timeline
      db.query.homepageTimeline.findMany({
        orderBy: (homepageTimeline, { asc }) => [asc(homepageTimeline.order)],
      }),
    ]);

    // Group skills by category for better organization
    const skillsByCategory = allSkills.reduce((acc, skill) => {
      acc[skill.category] ??= [];
      acc[skill.category]!.push(skill);
      return acc;
    }, {} as Record<string, typeof allSkills>);

    // Group homepage skills by category
    const homepageSkillsByCategory = homepageSkillsData.reduce((acc, skill) => {
      acc[skill.category] ??= [];
      acc[skill.category]!.push(skill);
      return acc;
    }, {} as Record<string, typeof homepageSkillsData>);

    return {
      starredProjects,
      starredBlogPosts,
      skillsByCategory,
      personalInfo: personalInfoData,
      homepage: {
        config: homepageConfigData,
        stats: homepageStatsData,
        services: homepageServicesData,
        skills: homepageSkillsByCategory,
        timeline: homepageTimelineData,
      },
    };
  }),
}); 