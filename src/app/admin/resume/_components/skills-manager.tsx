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

type Skill = {
  id: number;
  name: string;
  category: string;
};

export function SkillsManager() {
  const { data: resumeData, isLoading, error } = api.admin.resume.getAll.useQuery();
  const utils = api.useUtils();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const addSkill = api.admin.resume.skills.add.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setIsAddOpen(false);
    },
  });

  const updateSkill = api.admin.resume.skills.update.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setEditingSkill(null);
    },
  });

  const deleteSkill = api.admin.resume.skills.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
    },
  });

  const handleSubmit = (formData: FormData, isEdit = false) => {
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;

    if (isEdit && editingSkill) {
      updateSkill.mutate({
        id: editingSkill.id,
        name,
        category,
      });
    } else {
      addSkill.mutate({
        name,
        category,
      });
    }
  };

  const SkillForm = ({ skill, onSubmit }: { skill?: Skill; onSubmit: (formData: FormData) => void }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Skill Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={skill?.name}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          defaultValue={skill?.category}
          placeholder="e.g., Programming Language, Framework, Tool"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {skill ? "Update Skill" : "Add Skill"}
      </Button>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Skills</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-6 w-20" />
                  ))}
                </div>
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
          <h3 className="text-lg font-semibold">Skills</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load skills data. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resumeData) {
    return null;
  }

  // Group skills by category
  const groupedSkills = (resumeData.skills || []).reduce((acc, skill) => {
    acc[skill.category] ??= [];
    acc[skill.category]!.push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <SkillForm onSubmit={(formData) => handleSubmit(formData, false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-1">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {skill.name}
                      <div className="flex gap-1 ml-1">
                        <Dialog
                          open={editingSkill?.id === skill.id}
                          onOpenChange={(open) => setEditingSkill(open ? skill : null)}
                        >
                          <DialogTrigger asChild>
                            <button className="text-xs hover:text-blue-600">
                              <Edit className="h-3 w-3" />
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Skill</DialogTitle>
                            </DialogHeader>
                            <SkillForm
                              skill={skill}
                              onSubmit={(formData) => handleSubmit(formData, true)}
                            />
                          </DialogContent>
                        </Dialog>
                        <button
                          className="text-xs hover:text-red-600"
                          onClick={() => deleteSkill.mutate({ id: skill.id })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(groupedSkills).length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No skills added yet. Click &quot;Add Skill&quot; to get started.
          </p>
        )}
      </div>
    </div>
  );
} 