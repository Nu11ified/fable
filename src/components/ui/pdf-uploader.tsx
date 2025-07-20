"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";
import { Upload, X, FileText, Check, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFUploaderProps {
  onUploadComplete?: (url: string) => void;
  onUploadStart?: () => void;
  maxSizeInMB?: number;
  className?: string;
}

export function PDFUploader({
  onUploadComplete,
  onUploadStart,
  maxSizeInMB = 10,
  className,
}: PDFUploaderProps) {
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
    if (file.type !== "application/pdf") {
      return "File type not allowed. Please use PDF files only.";
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxSizeInMB}MB`;
    }
    return null;
  }, [maxSizeInMB]);

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
          // Remove data URL prefix (data:application/pdf;base64,)
          const base64Data = result.split(",")[1];
          resolve(base64Data ?? "");
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      await uploadFileMutation.mutateAsync({
        fileName: `resume-${file.name}`,
        fileContent: base64,
        path: "resume",
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

  const downloadPDF = () => {
    if (uploadedUrl) {
      const link = document.createElement("a");
      link.href = uploadedUrl;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          <Label>Resume PDF Upload</Label>
          
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
                <span className="text-sm font-medium">Resume uploaded successfully!</span>
              </div>
              
              <div className="relative p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Resume PDF</p>
                      <p className="text-sm text-muted-foreground">Ready for preview and download</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadPDF}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearUpload}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
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
                accept="application/pdf"
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
                    {dragActive ? <Upload className="h-full w-full" /> : <FileText className="h-full w-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {dragActive ? "Drop PDF here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF files up to {maxSizeInMB}MB
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
                Setting up file storage repository on GitHub...
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}