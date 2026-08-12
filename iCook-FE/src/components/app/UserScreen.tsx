"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MY_RECIPES,
  MyRecipesPanel,
  SavedRecipesPanel,
} from "@/components/app/UserCollectionScreens";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { useSavedRecipes } from "@/components/recipes/SavedRecipesProvider";
import ActivityFeed from "@/components/app/user/ActivityFeed";
import ActivityFilterPanel from "@/components/app/user/ActivityFilterPanel";
import PeoplePanel from "@/components/app/user/PeoplePanel";
import UserProfileHeader from "@/components/app/user/UserProfileHeader";
import UserTabBar from "@/components/app/user/UserTabBar";
import { FilterIcon, SearchIcon } from "@/components/app/icons";
import { PANEL_TITLE } from "@/components/app/user/data";
import { filterActivityItems } from "@/components/app/user/activityFilters";
import { useActivityFilters } from "@/components/app/user/ActivityFiltersProvider";
import type { MeTab } from "@/components/app/user/types";
import {
  isProfileSeedEnabled,
  readFollowers,
  readFollowing,
  writeFollowing,
} from "@/lib/accountData";

export default function UserScreen() {
  const [tab, setTab] = useState<MeTab>("activity");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activityQuery, setActivityQuery] = useState("");
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [seededRecipes, setSeededRecipes] = useState(true);
  const { savedRecipes } = useSavedRecipes();
  const { activityItems } = useLikedPosts();
  const { recipes: createdRecipes } = useCreatedContent();
  const { prefs } = useActivityFilters();

  useEffect(() => {
    setFollowers(readFollowers());
    setFollowing(readFollowing());
    setSeededRecipes(isProfileSeedEnabled());
  }, []);

  const followingSet = useMemo(() => new Set(following), [following]);
  const visibleActivity = useMemo(
    () => filterActivityItems(activityItems, prefs),
    [activityItems, prefs],
  );

  const tabCounts: Record<MeTab, number> = {
    activity: visibleActivity.filter((item) => item.unread).length,
    recipes:
      createdRecipes.length + (seededRecipes ? MY_RECIPES.length : 0),
    saved: savedRecipes.length,
    followers: followers.length,
    following: following.length,
  };

  const toggleFollow = (name: string) => {
    setFollowing((prev) => {
      const next = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];
      writeFollowing(next);
      return next;
    });
  };

  const onSelectTab = (next: MeTab) => {
    setTab(next);
    if (next !== "activity") {
      setFiltersOpen(false);
      setActivityQuery("");
    }
  };

  return (
    <div className="page-fill">
      <div className="surface-block shrink-0">
        <UserProfileHeader />
        <UserTabBar tab={tab} counts={tabCounts} onSelect={onSelectTab} />
      </div>

      <div className="feed-stack touch-pan-y">
        <div className="flex items-center justify-between px-3">
          <h2 className="section-title">{PANEL_TITLE[tab]}</h2>
          {tab === "activity" ? (
            <button
              type="button"
              aria-label={filtersOpen ? "Close activity filters" : "Filter activity"}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                filtersOpen ? "text-brand" : "text-ink-secondary"
              }`}
            >
              <FilterIcon className="size-4" />
              {filtersOpen ? "Close" : "Filter"}
            </button>
          ) : null}
        </div>

        {tab === "activity" ? (
          <div className="px-3">
            <div className="search-field">
              <SearchIcon className="size-5 shrink-0 text-brand" />
              <input
                id="activity-search"
                name="activity-search"
                value={activityQuery}
                onChange={(e) => setActivityQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:italic placeholder:text-muted"
                placeholder="Search activity"
                aria-label="Search activity"
              />
            </div>
          </div>
        ) : null}

        {tab === "activity" && filtersOpen ? (
          <ActivityFilterPanel onClose={() => setFiltersOpen(false)} />
        ) : null}

        {tab === "activity" ? (
          <ActivityFeed searchQuery={activityQuery} />
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
