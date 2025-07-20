import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { env } from "@/env";

export const resumeRouter = createTRPCRouter({
  getExperience: publicProcedure.query(async () => {
    return await db.query.experience.findMany({
      orderBy: (experience, { desc }) => [desc(experience.startDate)],
    });
  }),

  getEducation: publicProcedure.query(async () => {
    return await db.query.education.findMany({
      orderBy: (education, { desc }) => [desc(education.startDate)],
    });
  }),

  getSkills: publicProcedure.query(async () => {
    return await db.query.skills.findMany({
      orderBy: (skills, { asc }) => [asc(skills.category), asc(skills.name)],
    });
  }),

  getPersonalInfo: publicProcedure.query(async () => {
    return await db.query.personalInfo.findFirst();
  }),

  // Get the latest resume PDF for public access
  getLatestResume: publicProcedure.query(async () => {
    try {
      // For public access, we'll try to fetch from the public GitHub repo
      // This assumes the repo is public and contains resume files
      const username = env.GITHUB_USER_NAME;
      const repoName = "fable-photo-storage";
      
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/resume`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "fable-portfolio-app",
          },
        }
      );

      if (response.status === 200) {
        const files = await response.json() as Array<{
          name: string;
          path: string;
          sha: string;
          size: number;
          download_url: string;
          type: string;
        }>;
        
        // Filter to only PDF files and add metadata
        const resumeFiles = files
          .filter(file => file.type === "file" && /\.pdf$/i.test(file.name))
          .map(file => {
            const timestampMatch = /^(\d+)-/.exec(file.name);
            const timestamp = timestampMatch?.[1] ? parseInt(timestampMatch[1]) : null;
            
            return {
              name: file.name,
              path: file.path,
              sha: file.sha,
              size: file.size,
              url: `https://raw.githubusercontent.com/${username}/${repoName}/main/${file.path}`,
              downloadUrl: file.download_url,
              timestamp,
              uploadDate: timestamp ? new Date(timestamp) : null,
            };
          })
          .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)); // Sort by newest first

        return { success: true, file: resumeFiles[0] || null };
      } else {
        // Resume folder doesn't exist or repo is private
        return { success: true, file: null };
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      return { success: false, file: null };
    }
  }),

  // Get PDF content for preview (proxy through our server to avoid CORS)
  getResumeContent: publicProcedure.query(async () => {
    try {
      const username = env.GITHUB_USER_NAME;
      const repoName = "fable-photo-storage";
      
      const response = await fetch(
        `https://api.github.com/repos/${username}/${repoName}/contents/resume`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "fable-portfolio-app",
          },
        }
      );

      if (response.status === 200) {
        const files = await response.json() as Array<{
          name: string;
          path: string;
          sha: string;
          size: number;
          download_url: string;
          type: string;
        }>;
        
        const resumeFiles = files
          .filter(file => file.type === "file" && /\.pdf$/i.test(file.name))
          .sort((a, b) => {
            const timestampAMatch = /^(\d+)-/.exec(a.name);
            const timestampBMatch = /^(\d+)-/.exec(b.name);
            const timestampA = timestampAMatch?.[1] ? parseInt(timestampAMatch[1]) : 0;
            const timestampB = timestampBMatch?.[1] ? parseInt(timestampBMatch[1]) : 0;
            return timestampB - timestampA;
          });

        if (resumeFiles.length > 0) {
          const latestFile = resumeFiles[0];
          
          if (latestFile && latestFile.download_url) {
            // Fetch the actual PDF content
            const pdfResponse = await fetch(latestFile.download_url);
            if (pdfResponse.ok) {
              const pdfBuffer = await pdfResponse.arrayBuffer();
              const base64Content = Buffer.from(pdfBuffer).toString('base64');
              
              return {
                success: true,
                content: base64Content,
                filename: latestFile.name,
                size: latestFile.size,
              };
            }
          }
        }
      }
      
      return { success: false, content: null };
    } catch (error) {
      console.error("Error fetching resume content:", error);
      return { success: false, content: null };
    }
  }),

  getTimeline: publicProcedure.query(async () => {
    // Get both experience and education and combine them into a timeline
    const [experiences, educations] = await Promise.all([
      db.query.experience.findMany(),
      db.query.education.findMany(),
    ]);

    // Transform and combine into timeline items
    const timelineItems = [
      ...experiences.map(exp => ({
        id: `exp-${exp.id}`,
        type: 'experience' as const,
        title: exp.title,
        organization: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        current: !exp.endDate,
      })),
      ...educations.map(edu => ({
        id: `edu-${edu.id}`,
        type: 'education' as const,
        title: `${edu.degree} in ${edu.fieldOfStudy}`,
        organization: edu.school,
        location: null,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: `${edu.degree} in ${edu.fieldOfStudy}`,
        current: !edu.endDate,
      })),
    ];

    // Sort by start date (most recent first)
    return timelineItems.sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }),
});
