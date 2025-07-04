import { ExperienceManager } from "./_components/experience-manager";
import { EducationManager } from "./_components/education-manager";
import { SkillsManager } from "./_components/skills-manager";
import { InterestsManager } from "./_components/interests-manager";
import { PersonalInfoManager } from "./_components/personal-info-manager";

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
        <PersonalInfoManager />
        <ExperienceManager />
        <EducationManager />
        <SkillsManager />
        <InterestsManager />
      </div>
    </div>
  );
}
