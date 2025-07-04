"use client";

import Link from "next/link";
import { api } from "@/trpc/react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  Code, 
  Mail, 
  Github,
  Briefcase,
  Linkedin
} from "lucide-react";
import * as SiIcons from 'react-icons/si';
import type { ElementType } from 'react';
import { format, differenceInYears } from "date-fns";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { MagicCard } from "@/components/magicui/magic-card";
import { Meteors } from "@/components/magicui/meteors";
import { AnimatedList } from "@/components/magicui/animated-list";
import dynamic from "next/dynamic";
import TracingBeam from "@/components/ui/tracing-beam";
import { env } from "@/env";
import DinoGame from '@/components/dino-game';

const InteractiveMap = dynamic(() => import("@/components/ui/interactive-map"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-lg bg-secondary"></div>,
});

// A map to get icons for skills, we can extend this.
const IconMap: Record<string, React.ElementType> = {
  React: Code,
  "Next.js": Code,
  TypeScript: Code,
  Tailwind: Code,
  "Node.js": Code,
  HTML5: Code,
  CSS3: Code,
  JavaScript: Code,
  Default: Code,
};

// Type the imported icons map
const SiIconsMap = SiIcons as Record<string, ElementType>;

// Helper to get skill icon from react-icons/si
const getSkillIcon = (skillName: string) => {
  const key = 'Si' + skillName.replace(/[^a-zA-Z0-9]/g, '');
  return (SiIconsMap[key] ?? IconMap[skillName] ?? IconMap.Default)!;
};

export function HomeContent() {
  const { data: homeData, isLoading } = api.public.home.getData.useQuery();
  const { data: blogPosts } = api.public.blog.getAll.useQuery();
  const { data: portfolioProjects } = api.public.portfolio.getAll.useQuery();
  const { data: timelineItems, isLoading: timelineLoading } = api.public.resume.getTimeline.useQuery();
  const { data: githubStats, isLoading: statsLoading } = api.public.githubStats.getStats.useQuery();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-foreground">No content available</h2>
          <p className="text-muted-foreground">Please check back later</p>
        </div>
      </div>
    );
  }

  const { personalInfo, homepage, skillsByCategory } = homeData;
  const config = homepage.config;
  const starredProjects = portfolioProjects?.filter(p => p.isStarred).slice(0, 2) ?? [];
  const starredBlogPosts = blogPosts?.filter(p => p.isStarred).slice(0, 3) ?? [];

  const getGithubProfilePicture = (githubUrl: string | null | undefined) => {
    if (!githubUrl) return null;
    const username = githubUrl.split('/').pop();
    return `https://github.com/${username}.png`;
  };

  const profileImageUrl = getGithubProfilePicture(personalInfo?.github);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MagicCard className="bg-card border-border overflow-hidden relative h-full">
              <Meteors number={30} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-4 mb-6">
                  {profileImageUrl ? (
                    <img 
                      src={profileImageUrl} 
                      alt={personalInfo?.name ?? 'Profile'} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      {personalInfo?.name?.split(' ').map(n => n[0]).join('') ?? 'CH'}
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-1">
                      <SparklesText>Hey, I&apos;m {personalInfo?.name?.split(' ')[0] ?? 'Developer'} 👋</SparklesText>
                    </h1>
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Available for work
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {personalInfo?.summary ?? "I'm a creative software developer with experience in building modern web applications. I specialize in UI design and crafting engaging user experiences with great attention to detail."}
                </p>

                <div className="mb-6">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category} className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">{category}</h3>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {skills.map((skill) => {
                          const Icon = getSkillIcon(skill.name);
                          return (
                            <div key={skill.id} className="flex flex-col items-center p-3 bg-secondary rounded-lg hover:bg-accent transition-colors">
                              {Icon && <Icon className="w-6 h-6 mb-2 text-muted-foreground" />}
                              <span className="text-xs text-muted-foreground">{skill.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  {personalInfo?.github && (
                    <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {personalInfo?.email && (
                    <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                  {personalInfo?.linkedin && (
                    <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </CardContent>
            </MagicCard>
          </div>

          <div className="space-y-6">
            <MagicCard className="bg-card border-border overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{personalInfo?.city ?? 'Chicago'}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(currentTime, 'hh:mm a')} CDT
                      </span>
                    </div>
                    {personalInfo?.city && (
                        <InteractiveMap city={personalInfo.city} apiKey={env.NEXT_PUBLIC_GEOCODE_MAPS_CO_API_KEY as string} />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Based in {personalInfo?.city ?? 'Chicago'}, {personalInfo?.country ?? 'US'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Open to new opportunities</span>
                    </div>
                  </div>
                </CardContent>
            </MagicCard>
            <MagicCard className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Today</div>
                  <div className="text-3xl font-bold mb-1">{format(currentTime, 'd')}</div>
                  <div className="text-sm text-muted-foreground">{format(currentTime, 'MMMM yyyy')}</div>
                </div>
              </CardContent>
            </MagicCard>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MagicCard>
            <Card className="bg-card border-border h-full">
              <CardContent className="p-6">
                <div className="bg-black rounded-lg p-4 font-mono text-sm h-full shadow-lg">
                  <div className="flex items-center gap-2 mb-4 px-2 py-1 bg-gray-800 rounded-t-md">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-green-400 mb-2">$ whoami</div>
                  <div className="text-white">{config?.aboutTitle ?? "About Me"}</div>
                  <div className="text-blue-400">{config?.aboutSubtitle ?? "Software Architect and Developer"}</div>
                </div>
              </CardContent>
            </Card>
          </MagicCard>

          <MagicCard className="md:col-span-2">
            <Card className="bg-card border-border h-full">
              <CardContent className="p-6 flex items-center justify-center text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 ring-2 ring-green-500/50 animate-pulse">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{config?.workSectionTitle ?? "Open to work"}</div>
                    <div className="text-foreground font-medium">{config?.workSectionSubtitle ?? "Software Architect, Software Engineer, etc."}</div>
                  </div>
                  <div className="w-full max-w-md mx-auto mt-6">
                    <DinoGame />
                  </div>
              </CardContent>
            </Card>
          </MagicCard>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Starred projects</h2>
            <Link href="/portfolio" className="text-primary hover:underline">
              View all →
            </Link>
          </div>
          
          <AnimatedList>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {starredProjects.map((project) => (
                <MagicCard key={project.id} className="h-full">
                  <Card className="bg-card border-border hover:border-primary transition-colors group h-full">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-secondary rounded-lg mb-4 overflow-hidden">
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Code className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies?.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </MagicCard>
              ))}
            </div>
          </AnimatedList>
        </div>

        {/* Recent Posts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Starred Blogs</h2>
            <Link href="/blog" className="text-primary hover:underline">
              View all →
            </Link>
          </div>
          
          <AnimatedList>
            <div className="space-y-4">
              {starredBlogPosts.map((post) => (
                <MagicCard key={post.id}>
                  <Link href={`/blog/${post.id}`} className="block">
                    <Card className="bg-card border-border hover:border-primary transition-colors group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              A blog post.
                            </p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {post.author.image ? (
                                  <img src={post.author.image} alt={post.author.name ?? ''} className="w-6 h-6 rounded-full" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-secondary"></div>
                                )}
                                <span>{post.author.name}</span>
                              </div>
                              <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </MagicCard>
              ))}
            </div>
          </AnimatedList>
        </div>
        {/* Timeline */}
        {!timelineLoading && timelineItems && timelineItems.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">My Journey</h2>
            <div className="relative pl-4 pr-4">
              {/* Center axis line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted-foreground"></div>
              <ul className="space-y-16">
                {timelineItems.map((item, idx) => {
                  const start = new Date(item.startDate);
                  const end = item.endDate ? new Date(item.endDate) : new Date();
                  const years = differenceInYears(end, start);
                  const alignLeft = idx % 2 === 0;
                  return (
                    <li key={item.id} className="relative flex items-center">
                      {/* Connector dot */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-card rounded-full border-2 border-muted-foreground"></div>
                      {alignLeft ? (
                        <>
                          <div className="w-full md:w-1/2 px-4 md:pr-8 text-right">
                            <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-2">
                              <div className="flex items-baseline justify-end gap-2 mb-2">
                                <span className="text-2xl font-bold text-primary">{format(start, 'yyyy')}</span>
                                {years > 0 && <span className="text-sm text-muted-foreground">{years} yr{years > 1 ? 's' : ''}</span>}
                              </div>
                              <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mb-1">{format(start, 'MMM yyyy')} - {item.endDate ? format(end, 'MMM yyyy') : 'Present'}</p>
                              <p className="text-sm text-muted-foreground">{item.organization}{item.location ? ` • ${item.location}` : ''}</p>
                              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <div className="hidden md:block md:w-1/2"></div>
                        </>
                      ) : (
                        <>
                          <div className="hidden md:block md:w-1/2"></div>
                          <div className="w-full md:w-1/2 px-4 md:pl-8 text-left">
                            <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-2">
                              <div className="flex items-baseline justify-start gap-2 mb-2">
                                <span className="text-2xl font-bold text-secondary">{format(start, 'yyyy')}</span>
                                {years > 0 && <span className="text-sm text-muted-foreground">{years} yr{years > 1 ? 's' : ''}</span>}
                              </div>
                              <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mb-1">{format(start, 'MMM yyyy')} - {item.endDate ? format(end, 'MMM yyyy') : 'Present'}</p>
                              <p className="text-sm text-muted-foreground">{item.organization}{item.location ? ` • ${item.location}` : ''}</p>
                              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* GitHub Stats */}
        {!statsLoading && githubStats && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-6">GitHub Stats</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Public Repos</div>
                <div className="text-2xl font-bold">{githubStats.public_repos}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Followers</div>
                <div className="text-2xl font-bold">{githubStats.followers}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Following</div>
                <div className="text-2xl font-bold">{githubStats.following}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Stars</div>
                <div className="text-2xl font-bold">{githubStats.totalStars}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Forks</div>
                <div className="text-2xl font-bold">{githubStats.totalForks}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Commits</div>
                <div className="text-2xl font-bold">{githubStats.commitCount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Pull Requests</div>
                <div className="text-2xl font-bold">{githubStats.pullRequestCount}</div>
              </div>
            </div>
            {Object.keys(githubStats.topLanguages).length > 0 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-muted-foreground mb-2">Top Languages</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(githubStats.topLanguages).map(([lang, count]) => (
                    <Badge key={lang} variant="secondary">{`${lang} (${count})`}</Badge>
                  ))}
                </div>
              </div>
            )}
            {githubStats.commitGraph && githubStats.commitGraph.length > 0 && (
              <div className="mt-6">
                <div className="text-sm text-muted-foreground text-center mb-2">
                  Commit Activity (Last {githubStats.commitGraph.length} weeks)
                </div>
                <div className="flex items-end justify-center gap-1">
                  {(() => {
                    const max = Math.max(...githubStats.commitGraph.map((d) => d.total));
                    return githubStats.commitGraph.map((week, idx) => (
                      <div
                        key={idx}
                        className="bg-primary rounded-sm"
                        style={{ width: '4px', height: `${(week.total / max) * 50 + 2}px` }}
                        title={`${new Date(week.week * 1000).toLocaleDateString()}: ${week.total}`}
                      />
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
} 