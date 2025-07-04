"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type Experience = {
  id: number;
  title: string;
  company: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  description: string;
};

export function ExperienceManager() {
  const { data: resumeData, isLoading, error } = api.admin.resume.getAll.useQuery();
  const utils = api.useUtils();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const addExperience = api.admin.resume.experience.add.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setIsAddOpen(false);
    },
  });

  const updateExperience = api.admin.resume.experience.update.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setEditingExperience(null);
    },
  });

  const deleteExperience = api.admin.resume.experience.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
    },
  });

  const handleSubmit = (formData: FormData, isEdit = false) => {
    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    const location = formData.get("location") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined;
    const description = formData.get("description") as string;

    if (isEdit && editingExperience) {
      updateExperience.mutate({
        id: editingExperience.id,
        title,
        company,
        location: location || undefined,
        startDate,
        endDate,
        description,
      });
    } else {
      addExperience.mutate({
        title,
        company,
        location: location || undefined,
        startDate,
        endDate,
        description,
      });
    }
  };

  const ExperienceForm = ({ experience, onSubmit }: { experience?: Experience; onSubmit: (formData: FormData) => void }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={experience?.title}
          required
        />
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          defaultValue={experience?.company}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={experience?.location ?? ""}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={experience?.startDate ? format(experience.startDate, "yyyy-MM-dd") : ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={experience?.endDate ? format(experience.endDate, "yyyy-MM-dd") : ""}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={experience?.description}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {experience ? "Update Experience" : "Add Experience"}
      </Button>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Experience</h3>
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
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
          <h3 className="text-lg font-semibold">Experience</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load experience data. Please try refreshing the page.
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
        <h3 className="text-lg font-semibold">Experience</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Experience</DialogTitle>
            </DialogHeader>
            <ExperienceForm onSubmit={(formData) => handleSubmit(formData, false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {resumeData.experience.map((exp) => (
          <Card key={exp.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{exp.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  {exp.location && (
                    <p className="text-xs text-muted-foreground">{exp.location}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={editingExperience?.id === exp.id}
                    onOpenChange={(open) => setEditingExperience(open ? exp : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Experience</DialogTitle>
                      </DialogHeader>
                      <ExperienceForm
                        experience={exp}
                        onSubmit={(formData) => handleSubmit(formData, true)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteExperience.mutate({ id: exp.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">
                  {format(exp.startDate, "MMM yyyy")} - {exp.endDate ? format(exp.endDate, "MMM yyyy") : "Present"}
                </Badge>
                <p className="text-sm">{exp.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 