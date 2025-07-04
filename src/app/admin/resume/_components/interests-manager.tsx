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

type Interest = {
  id: number;
  name: string;
};

export function InterestsManager() {
  const { data: resumeData, isLoading, error } = api.admin.resume.getAll.useQuery();
  const utils = api.useUtils();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);

  const addInterest = api.admin.resume.interests.add.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setIsAddOpen(false);
    },
  });

  const updateInterest = api.admin.resume.interests.update.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
      setEditingInterest(null);
    },
  });

  const deleteInterest = api.admin.resume.interests.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.resume.invalidate();
    },
  });

  const handleSubmit = (formData: FormData, isEdit = false) => {
    const name = formData.get("name") as string;

    if (isEdit && editingInterest) {
      updateInterest.mutate({
        id: editingInterest.id,
        name,
      });
    } else {
      addInterest.mutate({
        name,
      });
    }
  };

  const InterestForm = ({ interest, onSubmit }: { interest?: Interest; onSubmit: (formData: FormData) => void }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Interest Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={interest?.name}
          placeholder="e.g., Photography, Hiking, Reading"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {interest ? "Update Interest" : "Add Interest"}
      </Button>
    </form>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Interests</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
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
          <h3 className="text-lg font-semibold">Interests</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load interests data. Please try refreshing the page.
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
        <h3 className="text-lg font-semibold">Interests</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Interest
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Interest</DialogTitle>
            </DialogHeader>
            <InterestForm onSubmit={(formData) => handleSubmit(formData, false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Interests</CardTitle>
        </CardHeader>
        <CardContent>
          {(resumeData.interests || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resumeData.interests?.map((interest) => (
                <div key={interest.id} className="flex items-center gap-1">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {interest.name}
                    <div className="flex gap-1 ml-1">
                      <Dialog
                        open={editingInterest?.id === interest.id}
                        onOpenChange={(open) => setEditingInterest(open ? interest : null)}
                      >
                        <DialogTrigger asChild>
                          <button className="text-xs hover:text-blue-600">
                            <Edit className="h-3 w-3" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Interest</DialogTitle>
                          </DialogHeader>
                          <InterestForm
                            interest={interest}
                            onSubmit={(formData) => handleSubmit(formData, true)}
                          />
                        </DialogContent>
                      </Dialog>
                      <button
                        className="text-xs hover:text-red-600"
                        onClick={() => deleteInterest.mutate({ id: interest.id })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No interests added yet. Click &quot;Add Interest&quot; to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 