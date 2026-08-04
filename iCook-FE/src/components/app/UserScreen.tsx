"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MY_RECIPES,
  MyRecipesPanel,
  SavedRecipesPanel,
} from "@/components/app/UserCollectionScreens";
import { useSavedRecipes } from "@/components/recipes/SavedRecipesProvider";
import ActivityFeed from "@/components/app/user/ActivityFeed";
import PeoplePanel from "@/components/app/user/PeoplePanel";
import UserProfileHeader from "@/components/app/user/UserProfileHeader";
import UserTabBar from "@/components/app/user/UserTabBar";
import {
  ACTIVITY_FEED,
  INITIAL_FOLLOWERS,
  INITIAL_FOLLOWING,
  PANEL_TITLE,
} from "@/components/app/user/data";
import type { MeTab } from "@/components/app/user/types";

export default function UserScreen() {
  const [tab, setTab] = useState<MeTab>("activity");
  const [followers] = useState(INITIAL_FOLLOWERS);
  const [following, setFollowing] = useState(INITIAL_FOLLOWING);
  const { savedRecipes } = useSavedRecipes();

  const followingSet = useMemo(() => new Set(following), [following]);

  const tabCounts: Record<MeTab, number> = {
    activity: ACTIVITY_FEED.filter((item) => item.unread).length,
    recipes: MY_RECIPES.length,
    saved: savedRecipes.length,
    followers: followers.length,
    following: following.length,
  };

  const toggleFollow = (name: string) => {
    setFollowing((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    );
  };

  return (
    <div className="page-fill">
      <div className="surface-block shrink-0">
        <UserProfileHeader />
        <UserTabBar tab={tab} counts={tabCounts} onSelect={setTab} />
      </div>

      <div className="feed-stack">
        <div className="flex items-center justify-between px-3">
          <h2 className="section-title">{PANEL_TITLE[tab]}</h2>
          {tab === "activity" ? (
            <Link
              href="/notifications"
              className="text-xs font-bold text-ink-secondary"
            >
              All notifications
            </Link>
          ) : null}
        </div>

        {tab === "activity" ? (
          <ActivityFeed />
        ) : tab === "recipes" ? (
          <MyRecipesPanel />
        ) : tab === "saved" ? (
          <SavedRecipesPanel />
        ) : tab === "followers" ? (
          <PeoplePanel
            key="followers"
            names={followers}
            followingSet={followingSet}
            onToggleFollow={toggleFollow}
          />
        ) : (
          <PeoplePanel
            key="following"
            names={following}
            followingSet={followingSet}
            onToggleFollow={toggleFollow}
          />
        )}
      </div>
    </div>
  );
}
