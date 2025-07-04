import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

const REPO_NAME = "fable-photo-storage";

// GitHub API Types
interface GitHubUser {
  login: string;
  id: number;
  [key: string]: unknown;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  [key: string]: unknown;
}

interface GitHubFileUploadResponse {
  content: {
    name: string;
    path: string;
    sha: string;
    [key: string]: unknown;
  };
  commit: {
    sha: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GitHubErrorResponse {
  message: string;
  errors?: Array<{
    resource: string;
    code: string;
    field: string;
    message: string;
  }>;
  documentation_url: string;
  status: string;
}

export const githubStorageRouter = createTRPCRouter({
  // Check if the fable-photo-storage repository exists
  checkRepository: adminProcedure.query(async ({ }) => {
    try {
      // Get the user's GitHub access token
      const accessTokenResult = await auth.api.getAccessToken({
        body: {
          providerId: "github",
        },
        headers: await headers(),
      });

      if (!accessTokenResult.accessToken) {
        throw new Error("No GitHub access token found. Please re-authenticate with GitHub.");
      }

      // First get the GitHub username
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessTokenResult.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "fable-portfolio-app",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get GitHub user info");
      }

      const githubUser = await userResponse.json() as GitHubUser;
      const username = githubUser.login;

      const response = await fetch(`https://api.github.com/repos/${username}/${REPO_NAME}`, {
        headers: {
          Authorization: `Bearer ${accessTokenResult.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "fable-portfolio-app",
        },
      });

      if (response.status === 200) {
        const repo = await response.json() as GitHubRepository;
        return { exists: true, repo };
      } else if (response.status === 404) {
        return { exists: false };
      } else {
        const error = await response.text();
        throw new Error(`GitHub API error: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error("Error checking repository:", error);
      throw new Error(`Failed to check repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Create the fable-photo-storage repository
  createRepository: adminProcedure.mutation(async ({ }) => {
    try {
      // Get the user's GitHub access token
      const accessTokenResult = await auth.api.getAccessToken({
        body: {
          providerId: "github",
        },
        headers: await headers(),
      });

      if (!accessTokenResult.accessToken) {
        throw new Error("No GitHub access token found. Please re-authenticate with GitHub.");
      }

      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessTokenResult.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "fable-portfolio-app",
        },
        body: JSON.stringify({
          name: REPO_NAME,
          description: "Photo storage for Fable portfolio and blog",
          private: false, // Make it public so images can be accessed
          auto_init: true, // Initialize with README
        }),
      });

      if (response.status === 201) {
        const repo = await response.json() as GitHubRepository;
        return { success: true, repo };
      } else if (response.status === 422) {
        // Check if it's because the repository already exists
        const error = await response.json() as GitHubErrorResponse;
        if (error.errors?.[0]?.message?.includes("already exists")) {
          // Repository already exists, let's get its info
          const userResponse = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${accessTokenResult.accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "fable-portfolio-app",
            },
          });
          
          if (userResponse.ok) {
            const githubUser = await userResponse.json() as GitHubUser;
            const repoResponse = await fetch(`https://api.github.com/repos/${githubUser.login}/${REPO_NAME}`, {
              headers: {
                Authorization: `Bearer ${accessTokenResult.accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "fable-portfolio-app",
              },
            });
            
            if (repoResponse.ok) {
              const repo = await repoResponse.json() as GitHubRepository;
              return { success: true, repo, alreadyExisted: true };
            }
          }
        }
        
        throw new Error(`GitHub API error: ${response.status} - ${JSON.stringify(error)}`);
      } else {
        const error = await response.text();
        throw new Error(`GitHub API error: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error("Error creating repository:", error);
      throw new Error(`Failed to create repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Upload a file to the repository
  uploadFile: adminProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileContent: z.string(), // Base64 encoded file content
        path: z.string().optional().default("images"), // Folder path within repo
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Get the user's GitHub access token
        const accessTokenResult = await auth.api.getAccessToken({
          body: {
            providerId: "github",
          },
          headers: await headers(),
        });

        if (!accessTokenResult.accessToken) {
          throw new Error("No GitHub access token found. Please re-authenticate with GitHub.");
        }

        // Create a unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${input.fileName}`;
        const filePath = input.path ? `${input.path}/${uniqueFileName}` : uniqueFileName;

        // First get the GitHub username
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessTokenResult.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "fable-portfolio-app",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to get GitHub user info");
        }

        const githubUser = await userResponse.json() as GitHubUser;
        const username = githubUser.login;

        const response = await fetch(
          `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${filePath}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessTokenResult.accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "User-Agent": "fable-portfolio-app",
            },
            body: JSON.stringify({
              message: `Upload ${uniqueFileName}`,
              content: input.fileContent,
            }),
          },
        );

        if (response.status === 201) {
          const result = await response.json() as GitHubFileUploadResponse;
          // Return the raw URL for direct access to the image
          const imageUrl = `https://raw.githubusercontent.com/${username}/${REPO_NAME}/main/${filePath}`;
          
          return {
            success: true,
            url: imageUrl,
            fileName: uniqueFileName,
            path: filePath,
            githubResponse: result,
          };
        } else {
          const error = await response.text();
          throw new Error(`GitHub API error: ${response.status} - ${error}`);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get GitHub user info (for debugging/verification)
  getUserInfo: adminProcedure.query(async ({ }) => {
    try {
      // Get the user's GitHub access token
      const accessTokenResult = await auth.api.getAccessToken({
        body: {
          providerId: "github",
        },
        headers: await headers(),
      });

      if (!accessTokenResult.accessToken) {
        throw new Error("No GitHub access token found. Please re-authenticate with GitHub.");
      }

      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessTokenResult.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "fable-portfolio-app",
        },
      });

      if (response.status === 200) {
        const userInfo = await response.json() as GitHubUser;
        return { success: true, userInfo };
      } else {
        const error = await response.text();
        throw new Error(`GitHub API error: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error("Error getting user info:", error);
      throw new Error(`Failed to get user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // List all files in the repository
  listFiles: adminProcedure.query(async ({ }) => {
    try {
      const accessTokenResult = await auth.api.getAccessToken({
        body: {
          providerId: "github",
        },
        headers: await headers(),
      });

      if (!accessTokenResult.accessToken) {
        throw new Error("No GitHub access token found. Please re-authenticate with GitHub.");
      }

      // Get the GitHub username
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessTokenResult.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "fable-portfolio-app",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get GitHub user info");
      }

      const githubUser = await userResponse.json() as GitHubUser;
      const username = githubUser.login;

      // List contents of the images folder
      const response = await fetch(
        `https://api.github.com/repos/${username}/${REPO_NAME}/contents/images`,
        {
          headers: {
            Authorization: `Bearer ${accessTokenResult.accessToken}`,
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
        
        // Filter to only image files and add metadata
        const imageFiles = files
          .filter(file => file.type === "file" && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
          .map(file => {
            const timestampMatch = /^(\d+)-/.exec(file.name);
            const timestamp = timestampMatch?.[1] ? parseInt(timestampMatch[1]) : null;
            
            return {
              name: file.name,
              path: file.path,
              sha: file.sha,
              size: file.size,
              url: `https://raw.githubusercontent.com/${username}/${REPO_NAME}/main/${file.path}`,
              downloadUrl: file.download_url,
              timestamp,
              uploadDate: timestamp ? new Date(timestamp) : null,
            };
          })
          .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0)); // Sort by newest first

        return { success: true, files: imageFiles };
      } else if (response.status === 404) {
        // Images folder doesn't exist yet
        return { success: true, files: [] };
      } else {
        const error = await response.text();
        throw new Error(`GitHub API error: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error("Error listing files:", error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Delete a file from the repository
  deleteFile: adminProcedure
    .input(
      z.object({
        path: z.string(),
        sha: z.string(),
        fileName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const accessTokenResult = await auth.api.getAccessToken({
          body: {
            providerId: "github",
          },
          headers: await headers(),
        });

        if (!accessTokenResult.accessToken) {
          throw new Error("No GitHub access token found. Please re-authenticate with GitHub.");
        }

        // Get the GitHub username
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessTokenResult.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "fable-portfolio-app",
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to get GitHub user info");
        }

        const githubUser = await userResponse.json() as GitHubUser;
        const username = githubUser.login;

        const response = await fetch(
          `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${input.path}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessTokenResult.accessToken}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "User-Agent": "fable-portfolio-app",
            },
            body: JSON.stringify({
              message: `Delete ${input.fileName}`,
              sha: input.sha,
            }),
          },
        );

        if (response.status === 200) {
          return { success: true };
        } else {
          const error = await response.text();
          throw new Error(`GitHub API error: ${response.status} - ${error}`);
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Debug: Check token scopes
  checkTokenScopes: adminProcedure.query(async ({ }) => {
    try {
      const accessTokenResult = await auth.api.getAccessToken({
        body: {
          providerId: "github",
        },
        headers: await headers(),
      });

      if (!accessTokenResult.accessToken) {
        throw new Error("No GitHub access token found. Please re-authenticate with GitHub.");
      }

      // Check what scopes the token has
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessTokenResult.accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "fable-portfolio-app",
        },
      });

      const scopes = response.headers.get("x-oauth-scopes")?.split(", ") ?? [];
      const acceptedScopes = response.headers.get("x-accepted-oauth-scopes")?.split(", ") ?? [];

      return {
        scopes,
        acceptedScopes,
        hasRepoScope: scopes.includes("repo"),
        canCreateRepo: scopes.includes("repo") || scopes.includes("public_repo"),
      };
    } catch (error) {
      console.error("Error checking token scopes:", error);
      throw new Error(`Failed to check token scopes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),
}); 