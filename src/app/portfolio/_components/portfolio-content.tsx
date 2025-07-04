"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Code,
  ExternalLink,
  Github,
  Star,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export function PortfolioContent() {
  const { data: projects, isLoading } = api.public.portfolio.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">No projects found</h2>
            <p className="text-muted-foreground">Projects will appear here once they&apos;re added</p>
          </div>
        </div>
      </div>
    );
  }

  // Separate starred and non-starred projects
  const starredProjects = projects.filter(p => p.isStarred);
  const otherProjects = projects.filter(p => !p.isStarred).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const allProjects = [...starredProjects, ...otherProjects];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Featured Projects (Starred) */}
        {starredProjects.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">Featured Projects</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {starredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border hover:border-primary transition-all duration-300 group h-full">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        {project.imageUrl ? (
                          <img 
                            src={project.imageUrl} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Code className="w-8 h-8 text-white" />
                        )}
                        <div className="absolute top-3 right-3">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {project.url && (
                              <Button variant="ghost" size="sm" asChild className="p-1 h-auto">
                                <Link href={project.url} target="_blank">
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{format(project.createdAt, 'MMM yyyy')}</span>
                        </div>
                        
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {project.technologies.map((tech) => (
                              <Badge 
                                key={tech} 
                                variant="secondary" 
                                className="bg-muted text-muted-foreground hover:bg-accent text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              {starredProjects.length > 0 ? 'Other Projects' : 'All Projects'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (starredProjects.length + index) * 0.1 }}
                >
                  <Card className="bg-card border-border hover:border-primary transition-all duration-300 group h-full">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        {project.imageUrl ? (
                          <img 
                            src={project.imageUrl} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Code className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </h3>
                          {project.url && (
                            <Button variant="ghost" size="sm" asChild className="p-1 h-auto">
                              <Link href={project.url} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{format(project.createdAt, 'MMM yyyy')}</span>
                        </div>
                        
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {project.technologies.slice(0, 3).map((tech) => (
                              <Badge 
                                key={tech} 
                                variant="secondary" 
                                className="bg-muted text-muted-foreground hover:bg-accent text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                +{project.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center pt-16 border-t border-gray-800 mt-16">
        </div>
      </div>
    </div>
  );
} 