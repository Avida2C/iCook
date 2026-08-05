"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CURRENT_USER } from "./data";
import { feedUserFromAuth } from "./authors";
import type { FeedUser } from "./types";

/** Live account details for the signed-in user (falls back to demo seed). */
export function useCurrentFeedUser(): FeedUser {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return CURRENT_USER;
    return feedUserFromAuth(user);
  }, [user]);
}
