import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";

// GitHub API response types
interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface GitHubRepo {
  name: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

// Type guards for safe type checking
function isGitHubUser(data: unknown): data is GitHubUser {
  return (
    typeof data === 'object' &&
    data !== null &&
    'login' in data &&
    'public_repos' in data &&
    'followers' in data &&
    'following' in data
  );
}

function isGitHubRepoArray(data: unknown): data is GitHubRepo[] {
  return (
    Array.isArray(data) &&
    data.every((item: unknown) => 
      typeof item === 'object' &&
      item !== null &&
      'stargazers_count' in item &&
      'forks_count' in item &&
      'language' in item
    )
  );
}

export const githubStatsPublicRouter = createTRPCRouter({
  getStats: publicProcedure.query(async () => {
    try {
      const username = env.GITHUB_USER_NAME as string;
      
      if (!username) {
        throw new Error('GitHub username not configured');
      }
      
      // Fetch user data from GitHub API
      const userResponse = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-Website',
        },
      });
      
      if (!userResponse.ok) {
        throw new Error(`GitHub API error: ${userResponse.status}`);
      }
      
      const userData: unknown = await userResponse.json() as unknown;
      
      if (!isGitHubUser(userData)) {
        throw new Error('Invalid GitHub user data received');
      }
      
      // Fetch repositories to get language statistics
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-Website',
        },
      });
      
      if (!reposResponse.ok) {
        throw new Error(`GitHub API error: ${reposResponse.status}`);
      }
      
      const reposData: unknown = await reposResponse.json();
      
      if (!isGitHubRepoArray(reposData)) {
        throw new Error('Invalid GitHub repositories data received');
      }
      
      // Calculate basic stats with properly typed data
      const totalStars = reposData.reduce((sum: number, repo: GitHubRepo) => sum + repo.stargazers_count, 0);
      const totalForks = reposData.reduce((sum: number, repo: GitHubRepo) => sum + repo.forks_count, 0);
      
      // Process languages safely
      const languageCounts = reposData
        .map((repo: GitHubRepo) => repo.language)
        .filter((lang: string | null): lang is string => lang !== null)
        .reduce((acc: Record<string, number>, lang: string) => {
          acc[lang] = (acc[lang] ?? 0) + 1;
          return acc;
        }, {});
      
      // Get the most used languages (top 5)
      const topLanguages = Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .reduce((acc, [lang, count]) => {
          acc[lang] = count;
          return acc;
        }, {} as Record<string, number>);

      return {
        username,
        name: userData.name ?? username,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        location: userData.location,
        blog: userData.blog,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        totalStars,
        totalForks,
        topLanguages,
      };
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      
      // Return fallback data if GitHub API fails
      return {
        username: 'unavailable',
        name: 'GitHub Stats Unavailable',
        avatar_url: null,
        bio: null,
        location: null,
        blog: null,
        public_repos: 0,
        followers: 0,
        following: 0,
        created_at: null,
        updated_at: null,
        totalStars: 0,
        totalForks: 0,
        topLanguages: {},
      };
    }
  }),
}); 