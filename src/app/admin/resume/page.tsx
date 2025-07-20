'use client'

import { ExperienceManager } from "./_components/experience-manager";
import { EducationManager } from "./_components/education-manager";
import { SkillsManager } from "./_components/skills-manager";
import { InterestsManager } from "./_components/interests-manager";
import { PersonalInfoManager } from "./_components/personal-info-manager";
import { PDFUploader } from "@/components/ui/pdf-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResumePage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resume Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all aspects of your resume content
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Resume PDF Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your resume in PDF format. It will be displayed on the main page for visitors to view and download.
            </p>
            <PDFUploader
              onUploadComplete={(url) => {
                console.log("Resume uploaded successfully:", url);
              }}
              onUploadStart={() => {
                console.log("Resume upload started...");
              }}
              maxSizeInMB={10}
            />
          </CardContent>
        </Card>
        
        <PersonalInfoManager />
        <ExperienceManager />
        <EducationManager />
        <SkillsManager />
        <InterestsManager />
      </div>
    </div>
  );
}
