"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { toast } from "sonner";

export function HomepageManager() {
  const { data: config, isLoading } = api.admin.homepage.config.get.useQuery();
  const utils = api.useUtils();

  const updateConfig = api.admin.homepage.config.update.useMutation({
    onSuccess: async () => {
      await utils.admin.homepage.config.invalidate();
      await utils.public.home.invalidate();
      toast.success("Configuration updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update configuration: " + error.message);
    },
  });

  const [configForm, setConfigForm] = useState({
    heroTitle: config?.heroTitle ?? "Crafting Digital Experiences",
    heroSubtitle: config?.heroSubtitle ?? "Through Code & Design",
    heroDescription: config?.heroDescription ?? "Building immersive web experiences that push the boundaries of what's possible",
    heroButtonPrimary: config?.heroButtonPrimary ?? "View Work",
    heroButtonSecondary: config?.heroButtonSecondary ?? "Get in Touch",
    creativeTitle: config?.creativeTitle ?? "CREATIVE DEVELOPER",
    aboutTitle: config?.aboutTitle ?? "About Me",
    aboutSubtitle: config?.aboutSubtitle ?? "ABOUT ME",
    age: config?.age ?? "",
    professionalTitle: config?.professionalTitle ?? "",
    yearsExperience: config?.yearsExperience ?? "",
    workSectionTitle: config?.workSectionTitle ?? "SELECTED WORKS",
    workSectionSubtitle: config?.workSectionSubtitle ?? "Modern E-commerce",
    workProjectMeta: config?.workProjectMeta ?? "INTERACTIVE DEVELOPMENT • 2024",
    contactSectionSubtitle: config?.contactSectionSubtitle ?? "GET IN TOUCH",
    contactTitle: config?.contactTitle ?? "Let's Create Something Together",
    contactDescription: config?.contactDescription ?? "Have a project in mind? Let's bring your ideas to life. I'm currently available for freelance projects and collaborations.",
    discordTitle: config?.discordTitle ?? "",
    discordUsername: config?.discordUsername ?? "",
    discordResponseTime: config?.discordResponseTime ?? "",
    socialLinksTitle: config?.socialLinksTitle ?? "Connect with me",
    backgroundText: config?.backgroundText ?? "Developer • Digital Artist • WebGL • TypeScript • React • Next.js • Node.js",
  });

  // Update form state when config data changes
  useEffect(() => {
    if (config) {
      setConfigForm({
        heroTitle: config.heroTitle ?? "Crafting Digital Experiences",
        heroSubtitle: config.heroSubtitle ?? "Through Code & Design",
        heroDescription: config.heroDescription ?? "Building immersive web experiences that push the boundaries of what's possible",
        heroButtonPrimary: config.heroButtonPrimary ?? "View Work",
        heroButtonSecondary: config.heroButtonSecondary ?? "Get in Touch",
        creativeTitle: config.creativeTitle ?? "CREATIVE DEVELOPER",
        aboutTitle: config.aboutTitle ?? "About Me",
        aboutSubtitle: config.aboutSubtitle ?? "ABOUT ME",
        age: config.age ?? "",
        professionalTitle: config.professionalTitle ?? "",
        yearsExperience: config.yearsExperience ?? "",
        workSectionTitle: config.workSectionTitle ?? "SELECTED WORKS",
        workSectionSubtitle: config.workSectionSubtitle ?? "Modern E-commerce",
        workProjectMeta: config.workProjectMeta ?? "INTERACTIVE DEVELOPMENT • 2024",
        contactSectionSubtitle: config.contactSectionSubtitle ?? "GET IN TOUCH",
        contactTitle: config.contactTitle ?? "Let's Create Something Together",
        contactDescription: config.contactDescription ?? "Have a project in mind? Let's bring your ideas to life. I'm currently available for freelance projects and collaborations.",
        discordTitle: config.discordTitle ?? "",
        discordUsername: config.discordUsername ?? "",
        discordResponseTime: config.discordResponseTime ?? "",
        socialLinksTitle: config.socialLinksTitle ?? "Connect with me",
        backgroundText: config.backgroundText ?? "Developer • Digital Artist • WebGL • TypeScript • React • Next.js • Node.js",
      });
    }
  }, [config]);

  const handleConfigSave = () => {
    updateConfig.mutate(configForm);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Homepage Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hero Section</h3>
            <div>
              <Label htmlFor="creativeTitle">Creative Title</Label>
              <Input
                id="creativeTitle"
                value={configForm.creativeTitle}
                onChange={(e) => setConfigForm(prev => ({ ...prev, creativeTitle: e.target.value }))}
                placeholder="CREATIVE DEVELOPER"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heroTitle">Hero Title</Label>
                <Input
                  id="heroTitle"
                  value={configForm.heroTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="Crafting Digital Experiences"
                />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Input
                  id="heroSubtitle"
                  value={configForm.heroSubtitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  placeholder="Through Code & Design"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="heroDescription">Hero Description</Label>
              <Textarea
                id="heroDescription"
                value={configForm.heroDescription}
                onChange={(e) => setConfigForm(prev => ({ ...prev, heroDescription: e.target.value }))}
                placeholder="Building immersive web experiences that push the boundaries of what's possible"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heroButtonPrimary">Primary Button Text</Label>
                <Input
                  id="heroButtonPrimary"
                  value={configForm.heroButtonPrimary}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroButtonPrimary: e.target.value }))}
                  placeholder="View Work"
                />
              </div>
              <div>
                <Label htmlFor="heroButtonSecondary">Secondary Button Text</Label>
                <Input
                  id="heroButtonSecondary"
                  value={configForm.heroButtonSecondary}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, heroButtonSecondary: e.target.value }))}
                  placeholder="Get in Touch"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aboutTitle">About Title</Label>
                <Input
                  id="aboutTitle"
                  value={configForm.aboutTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, aboutTitle: e.target.value }))}
                  placeholder="About Me"
                />
              </div>
              <div>
                <Label htmlFor="aboutSubtitle">About Subtitle</Label>
                <Input
                  id="aboutSubtitle"
                  value={configForm.aboutSubtitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, aboutSubtitle: e.target.value }))}
                  placeholder="ABOUT ME"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={configForm.age}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="17 Years Old"
                />
              </div>
              <div>
                <Label htmlFor="professionalTitle">Professional Title</Label>
                <Input
                  id="professionalTitle"
                  value={configForm.professionalTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, professionalTitle: e.target.value }))}
                  placeholder="Full Stack Developer"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                value={configForm.yearsExperience}
                onChange={(e) => setConfigForm(prev => ({ ...prev, yearsExperience: e.target.value }))}
                placeholder="1+ Years of work Experience"
              />
            </div>
          </div>

          {/* Work Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Work Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workSectionTitle">Work Section Title</Label>
                <Input
                  id="workSectionTitle"
                  value={configForm.workSectionTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, workSectionTitle: e.target.value }))}
                  placeholder="SELECTED WORKS"
                />
              </div>
              <div>
                <Label htmlFor="workSectionSubtitle">Work Section Subtitle</Label>
                <Input
                  id="workSectionSubtitle"
                  value={configForm.workSectionSubtitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, workSectionSubtitle: e.target.value }))}
                  placeholder="Modern E-commerce"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="workProjectMeta">Project Meta Text</Label>
              <Input
                id="workProjectMeta"
                value={configForm.workProjectMeta}
                onChange={(e) => setConfigForm(prev => ({ ...prev, workProjectMeta: e.target.value }))}
                placeholder="INTERACTIVE DEVELOPMENT • 2024"
              />
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Section</h3>
            <div>
              <Label htmlFor="contactSectionSubtitle">Contact Section Subtitle</Label>
              <Input
                id="contactSectionSubtitle"
                value={configForm.contactSectionSubtitle}
                onChange={(e) => setConfigForm(prev => ({ ...prev, contactSectionSubtitle: e.target.value }))}
                placeholder="GET IN TOUCH"
              />
            </div>
            <div>
              <Label htmlFor="contactTitle">Contact Title</Label>
              <Input
                id="contactTitle"
                value={configForm.contactTitle}
                onChange={(e) => setConfigForm(prev => ({ ...prev, contactTitle: e.target.value }))}
                placeholder="Let's Create Something Together"
              />
            </div>
            <div>
              <Label htmlFor="contactDescription">Contact Description</Label>
              <Textarea
                id="contactDescription"
                value={configForm.contactDescription}
                onChange={(e) => setConfigForm(prev => ({ ...prev, contactDescription: e.target.value }))}
                placeholder="Have a project in mind? Let's bring your ideas to life..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discordTitle">Discord Title</Label>
                <Input
                  id="discordTitle"
                  value={configForm.discordTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, discordTitle: e.target.value }))}
                  placeholder="Discord"
                />
              </div>
              <div>
                <Label htmlFor="discordUsername">Discord Username</Label>
                <Input
                  id="discordUsername"
                  value={configForm.discordUsername}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, discordUsername: e.target.value }))}
                  placeholder="USERNAME"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discordResponseTime">Discord Response Time</Label>
                <Input
                  id="discordResponseTime"
                  value={configForm.discordResponseTime}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, discordResponseTime: e.target.value }))}
                  placeholder="Response time: Within 24 hours"
                />
              </div>
              <div>
                <Label htmlFor="socialLinksTitle">Social Links Title</Label>
                <Input
                  id="socialLinksTitle"
                  value={configForm.socialLinksTitle}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, socialLinksTitle: e.target.value }))}
                  placeholder="Connect with me"
                />
              </div>
            </div>
          </div>

          {/* Background Text */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Background Elements</h3>
            <div>
              <Label htmlFor="backgroundText">Background Text</Label>
              <Textarea
                id="backgroundText"
                value={configForm.backgroundText}
                onChange={(e) => setConfigForm(prev => ({ ...prev, backgroundText: e.target.value }))}
                placeholder="Developer • Digital Artist • WebGL • TypeScript • React • Next.js • Node.js"
                rows={2}
              />
            </div>
          </div>

          <Button 
            onClick={handleConfigSave} 
            disabled={updateConfig.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateConfig.isPending ? "Saving..." : "Save Configuration"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 