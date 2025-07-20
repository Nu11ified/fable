"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { FileText, Download, Eye, Sparkles, AlertCircle } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { motion } from "motion/react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ResumeBox() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");
  
  // Query to get the latest resume PDF from public API
  const { data: resumeData, isLoading, error } = api.public.resume.getLatestResume.useQuery();
  
  // Query to get the PDF content for preview
  const { data: pdfContent, isLoading: pdfLoading } = api.public.resume.getResumeContent.useQuery(
    undefined,
    {
      enabled: isPreviewOpen, // Only fetch when preview is opened
    }
  );
  
  const latestResume = resumeData?.file;

  const downloadResume = () => {
    if (latestResume?.url) {
      const link = document.createElement("a");
      link.href = latestResume.url;
      link.download = `resume-${latestResume.name}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreviewOpen = () => {
    setPdfError("");
    setIsPreviewOpen(true);
  };

  const handlePdfError = () => {
    setPdfError("Unable to load PDF preview. Please try downloading the file instead.");
  };

  // Create data URL for PDF preview
  const getPdfDataUrl = () => {
    if (pdfContent?.success && pdfContent.content) {
      return `data:application/pdf;base64,${pdfContent.content}`;
    }
    return null;
  };

  if (!latestResume) {
    return null; // Don't show the box if no resume is uploaded
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <MagicCard className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:border-primary/40 transition-all duration-300">
        <Card className="bg-transparent border-none shadow-none">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg"
              >
                <FileText className="w-8 h-8 text-white" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  className="absolute w-16 h-16 border-2 border-primary rounded-full"
                />
              </motion.div>
              
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  <SparklesText>My Resume</SparklesText>
                </h3>
                <p className="text-sm text-muted-foreground">
                  View my latest professional resume
                </p>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="group"
                      onClick={handlePreviewOpen}
                    >
                      <Eye className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                      Preview
                      <Sparkles className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl h-[95vh] grid grid-rows-[auto_1fr] gap-0 p-0">
                    <DialogHeader className="p-6 pb-4">
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Resume Preview
                      </DialogTitle>
                    </DialogHeader>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 rounded-b-lg overflow-hidden border-t bg-background min-h-0"
                    >
                      {pdfLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : pdfError ? (
                        <div className="flex flex-col items-center justify-center h-full p-6">
                          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                          <Alert className="max-w-md">
                            <AlertDescription>{pdfError}</AlertDescription>
                          </Alert>
                          <Button 
                            onClick={downloadResume}
                            className="mt-4"
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Instead
                          </Button>
                        </div>
                      ) : pdfContent?.success && getPdfDataUrl() ? (
                        <iframe
                          src={getPdfDataUrl()!}
                          className="w-full h-full border-0"
                          title="Resume Preview"
                          onError={handlePdfError}
                          onLoad={() => setPdfError("")}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6">
                          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                          <Alert className="max-w-md">
                            <AlertDescription>
                              Unable to load PDF preview. The file may not be available or accessible.
                            </AlertDescription>
                          </Alert>
                          <Button 
                            onClick={downloadResume}
                            className="mt-4"
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Instead
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={downloadResume}
                  size="sm" 
                  className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Download className="w-3 h-3 mr-1 group-hover:animate-bounce" />
                  Download
                </Button>
              </div>
              
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-xs text-muted-foreground"
              >
                Click to view or download
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </MagicCard>
    </motion.div>
  );
}