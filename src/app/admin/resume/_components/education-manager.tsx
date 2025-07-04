"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Education = {
  id: number;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date | null;
};

export function EducationManager() {
  const { data: resumeData, isLoading, error } = api.admin.resume.getAll.useQuery();
  const utils = api.useUtils();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  const addEducation = api.admin.resume.education.add.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setIsAddOpen(false);
    },
  });

  const updateEducation = api.admin.resume.education.update.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setEditingEducation(null);
    },
  });

  const deleteEducation = api.admin.resume.education.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
    },
  });

  const handleSubmit = (formData: FormData, isEdit = false) => {
    const school = formData.get("school") as string;
    const degree = formData.get("degree") as string;
    const fieldOfStudy = formData.get("fieldOfStudy") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined;

    if (isEdit && editingEducation) {
      updateEducation.mutate({
        id: editingEducation.id,
        school,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
      });
    } else {
      addEducation.mutate({
        school,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
      });
    }
  };

  const EducationForm = ({ education, onSubmit }: { education?: Education; onSubmit: (formData: FormData) => void }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="school">School</Label>
        <Input
          id="school"
          name="school"
          defaultValue={education?.school}
          required
        />
      </div>
      <div>
        <Label htmlFor="degree">Degree</Label>
        <Input
          id="degree"
          name="degree"
          defaultValue={education?.degree}
          required
        />
      </div>
      <div>
        <Label htmlFor="fieldOfStudy">Field of Study</Label>
        <Input
          id="fieldOfStudy"
          name="fieldOfStudy"
          defaultValue={education?.fieldOfStudy}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={education?.startDate ? format(education.startDate, "yyyy-MM-dd") : ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={education?.endDate ? format(education.endDate, "yyyy-MM-dd") : ""}
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        {education ? "Update Education" : "Add Education"}
      </Button>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Education</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Education</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load education data. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resumeData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Education</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Education</DialogTitle>
            </DialogHeader>
            <EducationForm onSubmit={(formData) => handleSubmit(formData, false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {resumeData.education.map((edu) => (
          <Card key={edu.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{edu.degree}</CardTitle>
                  <p className="text-sm text-muted-foreground">{edu.school}</p>
                  <p className="text-xs text-muted-foreground">{edu.fieldOfStudy}</p>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={editingEducation?.id === edu.id}
                    onOpenChange={(open) => setEditingEducation(open ? edu : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Education</DialogTitle>
                      </DialogHeader>
                      <EducationForm
                        education={edu}
                        onSubmit={(formData) => handleSubmit(formData, true)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEducation.mutate({ id: edu.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                {format(edu.startDate, "MMM yyyy")} - {edu.endDate ? format(edu.endDate, "MMM yyyy") : "Present"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 