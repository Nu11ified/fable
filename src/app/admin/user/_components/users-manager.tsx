"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { UserX, UserCheck, Users, Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";


export function UsersManager() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = api.admin.user.getAll.useQuery({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const utils = api.useUtils();

  const banUser = api.admin.user.ban.useMutation({
    onSuccess: async () => {
      await utils.admin.user.invalidate();
    },
  });

  const unbanUser = api.admin.user.unban.useMutation({
    onSuccess: async () => {
      await utils.admin.user.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Users</h3>
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
          <h3 className="text-lg font-semibold">Users</h3>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Failed to load users. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedUsers = users ? [...users].sort((a, b) => {
    if (a.isAdmin && !b.isAdmin) return -1;
    if (!a.isAdmin && b.isAdmin) return 1;
    if (a.isBanned && !b.isBanned) return 1;
    if (!a.isBanned && b.isBanned) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Users</h3>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {pagination?.totalCount ?? 0} total
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {sortedUsers.map((user) => (
          <Card key={user.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.image && (
                      <Image 
                        src={user.image} 
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                        width={32}
                        height={32}
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {user.isAdmin && (
                          <Badge variant="default" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.isBanned && (
                          <Badge variant="destructive" className="text-xs">
                            Banned
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!user.isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          {user.isBanned ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {user.isBanned ? "Unban User" : "Ban User"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {user.isBanned 
                              ? `Are you sure you want to unban ${user.name}? They will be able to comment and interact with the site again.`
                              : `Are you sure you want to ban ${user.name}? They will not be able to comment or interact with the site.`
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (user.isBanned) {
                                unbanUser.mutate({ id: user.id });
                              } else {
                                banUser.mutate({ id: user.id });
                              }
                            }}
                          >
                            {user.isBanned ? "Unban" : "Ban"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
                {user.updatedAt && (
                  <>
                    <span className="mx-2">•</span>
                    Last updated: {new Date(user.updatedAt).toLocaleDateString()}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sortedUsers.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                {search ? "No users found matching your search." : "No users found."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
              {pagination.totalCount} results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 