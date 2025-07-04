"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoUploader } from "@/components/ui/photo-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, Trash2, RefreshCw, Calendar, HardDrive, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export function PhotoUploaderDemo() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  
  // Test the GitHub user info endpoint
  const { data: userInfo, isLoading: userLoading } = api.admin.githubStorage.getUserInfo.useQuery();
  const { data: repoCheck, isLoading: repoLoading } = api.admin.githubStorage.checkRepository.useQuery();
  const { data: tokenScopes, isLoading: scopesLoading } = api.admin.githubStorage.checkTokenScopes.useQuery();
  const { data: filesList, isLoading: filesLoading, refetch: refetchFiles } = api.admin.githubStorage.listFiles.useQuery();
  
  const deleteFileMutation = api.admin.githubStorage.deleteFile.useMutation({
    onSuccess: () => {
      void refetchFiles();
    },
  });

  const handleUploadComplete = (url: string) => {
    setUploadedUrls(prev => [...prev, url]);
    // Refresh the gallery when a new file is uploaded
    void refetchFiles();
  };

  const removeUploadedUrl = (index: number) => {
    setUploadedUrls(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeleteFile = async (file: { path: string; sha: string; name: string }) => {
    if (confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      try {
        await deleteFileMutation.mutateAsync({
          path: file.path,
          sha: file.sha,
          fileName: file.name,
        });
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                onUploadComplete={handleUploadComplete}
                onUploadStart={() => console.log("Upload started...")}
              />
            </CardContent>
          </Card>

          {uploadedUrls.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Uploads ({uploadedUrls.length})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadedUrls([])}
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedUrls.map((url, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg">
                      <div className="relative group">
                        <div className="relative w-full h-32 rounded-md overflow-hidden">
                          <Image
                            src={url}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeUploadedUrl(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono break-all max-h-16 overflow-y-auto text-gray-900 dark:text-gray-100">
                          {url}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => copyToClipboard(url)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Image Gallery</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchFiles()}
                  disabled={filesLoading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${filesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3 p-4 border rounded-lg">
                      <Skeleton className="w-full h-32 rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filesList?.files && filesList.files.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span>{filesList.files.length} images total</span>
                    <span>•</span>
                    <span>{formatFileSize(filesList.files.reduce((acc, file) => acc + file.size, 0))} total size</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filesList.files.map((file) => (
                      <div key={file.path} className="space-y-3 p-4 border rounded-lg">
                        <div className="relative group">
                          <div className="relative w-full h-32 rounded-md overflow-hidden">
                            <Image
                              src={file.url}
                              alt={file.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteFile(file)}
                              disabled={deleteFileMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium truncate" title={file.name}>
                            {file.name}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            {file.uploadDate && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{file.uploadDate.toLocaleDateString()}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono break-all max-h-16 overflow-y-auto text-gray-900 dark:text-gray-100">
                            {file.url}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => copyToClipboard(file.url)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <ImageIcon className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No images uploaded yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Upload your first image using the Upload tab to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">GitHub User Info</h4>
                  {userLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : userInfo?.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Username:</span>
                        <Badge variant="secondary">{userInfo.userInfo.login}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">User ID:</span>
                        <Badge variant="secondary">{userInfo.userInfo.id}</Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">Failed to load GitHub user info</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Storage Repository</h4>
                  {repoLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : repoCheck ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Repository exists:</span>
                        <Badge variant={repoCheck.exists ? "default" : "destructive"}>
                          {repoCheck.exists ? "Yes" : "No"}
                        </Badge>
                      </div>
                      {repoCheck.exists && repoCheck.repo && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Repository:</span>
                            <Badge variant="secondary">{repoCheck.repo.full_name}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Visibility:</span>
                            <Badge variant={repoCheck.repo.private ? "outline" : "default"}>
                              {repoCheck.repo.private ? "Private" : "Public"}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="mt-2"
                          >
                            <a
                              href={`https://github.com/${repoCheck.repo.full_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View on GitHub
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">Failed to check repository status</p>
                  )}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">How it works</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Images are uploaded to your <code>fable-photo-storage</code> GitHub repository 
                    and served via GitHub&apos;s raw content delivery. The repository is created automatically 
                    on your first upload with public visibility for image hosting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Permissions Debug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Token Scopes</h4>
                  {scopesLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : tokenScopes ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Current scopes:</span>
                        <div className="flex gap-1 flex-wrap">
                          {tokenScopes.scopes.map((scope) => (
                            <Badge key={scope} variant="secondary">{scope}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Can create repositories:</span>
                        <Badge variant={tokenScopes.canCreateRepo ? "default" : "destructive"}>
                          {tokenScopes.canCreateRepo ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Has repo scope:</span>
                        <Badge variant={tokenScopes.hasRepoScope ? "default" : "destructive"}>
                          {tokenScopes.hasRepoScope ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">Failed to check token scopes</p>
                  )}
                </div>

                {tokenScopes && !tokenScopes.canCreateRepo && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">Missing Permissions</h4>
                    <p className="text-sm text-red-700 dark:text-red-200 mb-3">
                      Your GitHub OAuth token doesn&apos;t have the required permissions to create repositories. 
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href="/api/auth/signout" className="mr-2">
                        Sign Out & Re-authorize
                      </Link>
                    </Button>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Troubleshooting</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    If you&apos;re getting permission errors, try signing out and signing back in to re-authorize with updated permissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 