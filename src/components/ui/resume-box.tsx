"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { FileText, Download, Eye, Sparkles } from "lucide-react";
import { MagicCard } from "@/components/magicui/magic-card";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { motion } from "motion/react";

export function ResumeBox() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Query to get the latest resume PDF from public API
  const { data: resumeData } = api.public.resume.getLatestResume.useQuery();
  
  const latestResume = resumeData?.file;

  const downloadResume = () => {
    if (latestResume?.url) {
      const link = document.createElement("a");
      link.href = latestResume.url;
      link.download = `resume-${latestResume.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
                    <Button variant="outline" size="sm" className="group">
                      <Eye className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                      Preview
                      <Sparkles className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Resume Preview
                      </DialogTitle>
                    </DialogHeader>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 rounded-lg overflow-hidden border bg-background"
                    >
                      <iframe
                        src={`${latestResume.url}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full"
                        title="Resume Preview"
                      />
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