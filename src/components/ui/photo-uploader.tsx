"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";
import { Upload, X, Image as ImageIcon, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from 'next/image'

interface PhotoUploaderProps {
  onUploadComplete?: (url: string) => void;
  onUploadStart?: () => void;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  className?: string;
}

export function PhotoUploader({
  onUploadComplete,
  onUploadStart,
  maxSizeInMB = 5,
  allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  className,
}: PhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [repositorySetup, setRepositorySetup] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations and queries
  const { data: repoCheck, refetch: checkRepo } = api.admin.githubStorage.checkRepository.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const createRepoMutation = api.admin.githubStorage.createRepository.useMutation({
    onSuccess: (data) => {
      setRepositorySetup(true);
      void checkRepo();
      // Show success message for either new or existing repo
      if (data.alreadyExisted) {
        console.log("Repository already exists and is ready for uploads");
      } else {
        console.log("Repository created successfully");
      }
    },
    onError: (error) => {
      setError(`Failed to create repository: ${error.message}`);
      setRepositorySetup(false);
    },
  });

  const uploadFileMutation = api.admin.githubStorage.uploadFile.useMutation({
    onSuccess: (data) => {
      setUploadedUrl(data.url);
      setUploading(false);
      onUploadComplete?.(data.url);
    },
    onError: (error) => {
      setError(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });

  // Initialize repository if needed
  const initializeRepository = useCallback(async () => {
    if (repoCheck && !repoCheck.exists) {
      try {
        await createRepoMutation.mutateAsync();
      } catch (error) {
        console.error("Failed to create repository:", error);
      }
    } else if (repoCheck?.exists) {
      setRepositorySetup(true);
    }
  }, [repoCheck, createRepoMutation]);

  // Call initialize when repo check completes
  useState(() => {
    if (repoCheck !== undefined) {
      void initializeRepository();
    }
  });

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type not allowed. Please use: ${allowedTypes.join(", ")}`;
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxSizeInMB}MB`;
    }
    return null;
  }, [allowedTypes, maxSizeInMB]);

  const handleFileUpload = useCallback(async (file: File) => {
    setError("");
    
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    // Ensure repository is set up
    if (!repositorySetup) {
      await initializeRepository();
      if (!repositorySetup) {
        setError("Repository setup failed. Please try again.");
        return;
      }
    }

    setUploading(true);
    onUploadStart?.();

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (data:image/jpeg;base64,)
          const base64Data = result.split(",")[1];
          resolve(base64Data ?? "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await uploadFileMutation.mutateAsync({
        fileName: file.name,
        fileContent: base64,
        path: "images",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  }, [repositorySetup, initializeRepository, onUploadStart, uploadFileMutation, validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      void handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      void handleFileUpload(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setUploadedUrl("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (repoCheck === undefined) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Label>Photo Upload</Label>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadedUrl ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Upload successful!</span>
              </div>
              
              <div className="relative">
                <Image
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="max-w-full h-32 object-cover rounded-md border"
                  width={128}
                  height={128}
                  quality={100}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={clearUpload}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono break-all text-gray-900 dark:text-gray-100">
                {uploadedUrl}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
                uploading && "pointer-events-none opacity-50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {uploading ? (
                <div className="space-y-2">
                  <div className="animate-spin mx-auto h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    {dragActive ? <Upload className="h-full w-full" /> : <ImageIcon className="h-full w-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {dragActive ? "Drop image here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {allowedTypes.join(", ")} up to {maxSizeInMB}MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {createRepoMutation.isPending && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Setting up photo storage repository on GitHub...
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 