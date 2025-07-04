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
import { api } from "@/trpc/react";
import { Edit, Plus, Trash2, User } from "lucide-react";

type PersonalInfo = {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  city?: string | null;
  country?: string | null;
  citizenship?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  summary?: string | null;
};

export function PersonalInfoManager() {
  const { data: resumeData, isLoading, error } = api.admin.resume.getAll.useQuery();
  const utils = api.useUtils();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState<PersonalInfo | null>(null);

  const addPersonalInfo = api.admin.resume.personalInfo.add.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setIsAddOpen(false);
    },
  });

  const updatePersonalInfo = api.admin.resume.personalInfo.update.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setEditingPersonalInfo(null);
    },
  });

  const deletePersonalInfo = api.admin.resume.personalInfo.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
    },
  });

  const handleSubmit = (formData: FormData, isEdit = false) => {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const citizenship = formData.get("citizenship") as string;
    const website = formData.get("website") as string;
    const linkedin = formData.get("linkedin") as string;
    const github = formData.get("github") as string;
    const summary = formData.get("summary") as string;

    const data = {
      name,
      email,
      phoneNumber: phoneNumber ?? undefined,
      city: city ?? undefined,
      country: country ?? undefined,
      citizenship: citizenship ?? undefined,
      website: website ?? undefined,
      linkedin: linkedin ?? undefined,
      github: github ?? undefined,
      summary: summary ?? undefined,
    };

    if (isEdit && editingPersonalInfo) {
      updatePersonalInfo.mutate({
        id: editingPersonalInfo.id,
        ...data,
      });
    } else {
      addPersonalInfo.mutate(data);
    }
  };

  const PersonalInfoForm = ({ personalInfo, onSubmit }: { personalInfo?: PersonalInfo; onSubmit: (formData: FormData) => void }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={personalInfo?.name}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={personalInfo?.email}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            defaultValue={personalInfo?.phoneNumber ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="citizenship">Citizenship</Label>
          <Input
            id="citizenship"
            name="citizenship"
            defaultValue={personalInfo?.citizenship ?? ""}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={personalInfo?.city ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            defaultValue={personalInfo?.country ?? ""}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          type="url"
          defaultValue={personalInfo?.website ?? ""}
          placeholder="https://example.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            defaultValue={personalInfo?.linkedin ?? ""}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div>
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            name="github"
            type="url"
            defaultValue={personalInfo?.github ?? ""}
            placeholder="https://github.com/username"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          defaultValue={personalInfo?.summary ?? ""}
          placeholder="Brief professional summary or objective..."
        />
      </div>
      <Button type="submit" className="w-full">
        {personalInfo ? "Update Personal Info" : "Add Personal Info"}
      </Button>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <Skeleton className="h-9 w-40" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load personal information. Please try refreshing the page.
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
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Personal Info
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Personal Information</DialogTitle>
            </DialogHeader>
            <PersonalInfoForm onSubmit={(formData) => handleSubmit(formData, false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {(resumeData.personalInfo || []).map((info) => (
          <Card key={info.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-base">{info.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{info.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={editingPersonalInfo?.id === info.id}
                    onOpenChange={(open) => setEditingPersonalInfo(open ? info : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Personal Information</DialogTitle>
                      </DialogHeader>
                      <PersonalInfoForm
                        personalInfo={info}
                        onSubmit={(formData) => handleSubmit(formData, true)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePersonalInfo.mutate({ id: info.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {info.phoneNumber && (
                  <div>
                    <span className="font-medium">Phone:</span> {info.phoneNumber}
                  </div>
                )}
                {(info.city ?? info.country) && (
                  <div>
                    <span className="font-medium">Location:</span> {[info.city, info.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {info.citizenship && (
                  <div>
                    <span className="font-medium">Citizenship:</span> {info.citizenship}
                  </div>
                )}
                {info.website && (
                  <div>
                    <span className="font-medium">Website:</span>{" "}
                    <a href={info.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {info.website}
                    </a>
                  </div>
                )}
                {info.linkedin && (
                  <div>
                    <span className="font-medium">LinkedIn:</span>{" "}
                    <a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Profile
                    </a>
                  </div>
                )}
                {info.github && (
                  <div>
                    <span className="font-medium">GitHub:</span>{" "}
                    <a href={info.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Profile
                    </a>
                  </div>
                )}
              </div>
              {info.summary && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Summary:</span> {info.summary}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {(resumeData.personalInfo ?? []).length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No personal information added yet. Click &quot;Add Personal Info&quot; to get started.
          </p>
        )}
      </div>
    </div>
  );
} 