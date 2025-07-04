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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { Edit, Plus, Trash2, Star, StarOff, ExternalLink, ImageIcon } from "lucide-react";
import { PhotoUploader } from "@/components/ui/photo-uploader";
import Image from 'next/image'

type PortfolioProject = {
  id: number;
  name: string;
  description: string;
  technologies?: string[] | null;
  url?: string | null;
  imageUrl?: string | null;
  isStarred: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
};

export function PortfolioProjectsManager() {
  const { data: projects, isLoading, error } = api.admin.portfolio.getAll.useQuery();
  const { data: filesList } = api.admin.githubStorage.listFiles.useQuery();
  const utils = api.useUtils();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

  const addProject = api.admin.portfolio.add.useMutation({
    onSuccess: async () => {
      await utils.admin.portfolio.invalidate();
      setIsAddOpen(false);
    },
  });

  const updateProject = api.admin.portfolio.update.useMutation({
    onSuccess: async () => {
      await utils.admin.portfolio.invalidate();
      setEditingProject(null);
    },
  });

  const deleteProject = api.admin.portfolio.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.portfolio.invalidate();
    },
  });

  const starProject = api.admin.portfolio.star.useMutation({
    onSuccess: async () => {
      await utils.admin.portfolio.invalidate();
    },
  });

  const unstarProject = api.admin.portfolio.unstar.useMutation({
    onSuccess: async () => {
      await utils.admin.portfolio.invalidate();
    },
  });

  const handleSubmit = (formData: FormData, isEdit = false) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const technologiesInput = formData.get("technologies") as string;
    const technologies = technologiesInput
      ? technologiesInput.split(",").map(tech => tech.trim()).filter(tech => tech.length > 0)
      : undefined;
    const url = (formData.get("url") as string) || undefined;
    const imageUrl = (formData.get("imageUrl") as string) || undefined;

    if (isEdit && editingProject) {
      updateProject.mutate({
        id: editingProject.id,
        name,
        description,
        technologies,
        url,
        imageUrl,
      });
    } else {
      addProject.mutate({
        name,
        description,
        technologies,
        url,
        imageUrl,
      });
    }
  };

  const ProjectForm = ({ 
    project, 
    onSubmit,
    availableImages
  }: { 
    project?: PortfolioProject; 
    onSubmit: (formData: FormData) => void;
    availableImages?: Array<{ name: string; url: string; path: string }>;
  }) => {
    const [selectedImageUrl, setSelectedImageUrl] = useState(project?.imageUrl ?? "");

    return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={project?.name}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={project?.description}
          required
        />
      </div>
      <div>
        <Label htmlFor="technologies">Technologies (comma-separated)</Label>
        <Input
          id="technologies"
          name="technologies"
          defaultValue={project?.technologies?.join(", ") ?? ""}
          placeholder="React, TypeScript, Next.js"
        />
      </div>
      <div>
        <Label htmlFor="url">Project URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={project?.url ?? ""}
          placeholder="https://example.com"
        />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          value={selectedImageUrl}
          onChange={(e) => setSelectedImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        
        {availableImages && availableImages.length > 0 && (
          <div className="mt-3">
            <Label className="text-sm">Or Select from Gallery</Label>
            <Select
              value={selectedImageUrl || "none"}
              onValueChange={(value) => setSelectedImageUrl(value === "none" ? "" : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose from uploaded images" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>No image selected</span>
                  </div>
                </SelectItem>
                {availableImages.map((image) => (
                  <SelectItem key={image.path} value={image.url}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={image.url}
                        alt={image.name}
                        width={24}
                        height={24}
                        className="rounded object-cover"
                      />
                      <span className="truncate max-w-48">{image.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="mt-3">
          <Label className="text-sm">Or Upload New Image</Label>
          <PhotoUploader
            onUploadComplete={(url) => {
              setSelectedImageUrl(url);
            }}
            className="mt-2"
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        {project ? "Update Project" : "Add Project"}
      </Button>
    </form>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Portfolio Projects</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
          <h3 className="text-lg font-semibold">Portfolio Projects</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load portfolio projects. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedProjects = projects ? [...projects].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Portfolio Projects</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm 
              onSubmit={(formData) => handleSubmit(formData, false)}
              availableImages={filesList?.files}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sortedProjects.map((project) => (
          <Card key={project.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  {project.isStarred && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {project.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={project.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (project.isStarred) {
                        unstarProject.mutate({ id: project.id });
                      } else {
                        starProject.mutate({ id: project.id });
                      }
                    }}
                  >
                    {project.isStarred ? (
                      <StarOff className="h-4 w-4" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </Button>
                  <Dialog
                    open={editingProject?.id === project.id}
                    onOpenChange={(open) => {
                      if (!open) setEditingProject(null);
                      else setEditingProject(project);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                      </DialogHeader>
                      <ProjectForm
                        project={project}
                        onSubmit={(formData) => handleSubmit(formData, true)}
                        availableImages={filesList?.files}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProject.mutate({ id: project.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {project.description}
              </p>
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
              {project.imageUrl && (
                <div className="mt-3">
                  <div className="relative w-full max-h-48 aspect-video rounded-md border overflow-hidden">
                    <Image
                      src={project.imageUrl}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {sortedProjects.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                No projects found. Add your first project to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 