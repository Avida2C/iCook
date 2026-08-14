import { CATALOG_POSTS, catalogPostCreatedAt } from "@/components/app/postsData";
import {
  CATALOG_RECIPES,
  catalogRecipeCreatedAt,
} from "@/components/recipes/recipesData";
import { resolveAuthor } from "@/components/app/user/authors";
import { ACTIVITY_FEED } from "@/components/app/user/data";
import type { FeedItem, FeedUser } from "@/components/app/user/types";
import type { CreatedPost, CreatedRecipe } from "@/components/app/CreatedContentProvider";
import { isFollowingPerson } from "@/lib/accountData";
import { plainTextFromHtml } from "@/lib/postRichText";
import { formatActivityAge, isNewActivity } from "@/lib/publishVisibility";

function followedUser(
  following: string[],
  user: FeedUser,
): boolean {
  return isFollowingPerson(following, user);
}

/** Demo + catalog activity from accounts the viewer follows. */
export function activityFromPeopleYouFollow({
  following,
  me,
  createdPosts,
  createdRecipes,
  now,
}: {
  following: string[];
  me: FeedUser;
  createdPosts: CreatedPost[];
  createdRecipes: CreatedRecipe[];
  now: number;
}): FeedItem[] {
  if (following.length === 0) return [];

  const items: FeedItem[] = [];
  const seenRecipes = new Set<string>();
  const seenPosts = new Set<string>();

  for (const item of ACTIVITY_FEED) {
    if (item.kind === "follow") continue;
    if (item.kind === "like" && item.self) continue;
    if (!("user" in item) || !item.user) continue;
    if (!followedUser(following, item.user)) continue;
    items.push(item);
    if (item.kind === "recipe") seenRecipes.add(item.recipeId);
    if (item.kind === "post") seenPosts.add(item.postId);
  }

  for (const post of createdPosts) {
    if (post.isPrivate) continue;
    const user = resolveAuthor(post.author, me);
    if (user.handle === me.handle) continue;
    if (!followedUser(following, user)) continue;
    if (seenPosts.has(post.id)) continue;
    seenPosts.add(post.id);
    items.push({
      id: `follow-created-post-${post.id}`,
      kind: "post",
      user,
      time: formatActivityAge(post.createdAt, now),
      createdAt: post.createdAt,
      postId: post.id,
      title: post.title,
      preview: plainTextFromHtml(post.body).slice(0, 160),
      thumbnailUrl: post.thumbnailUrl,
      unread: isNewActivity(post.createdAt, now),
    });
  }

  for (const recipe of createdRecipes) {
    if (recipe.isPrivate) continue;
    const user = resolveAuthor(recipe.author, me);
    if (user.handle === me.handle) continue;
    if (!followedUser(following, user)) continue;
    if (seenRecipes.has(recipe.id)) continue;
    seenRecipes.add(recipe.id);
    items.push({
      id: `follow-created-recipe-${recipe.id}`,
      kind: "recipe",
      user,
      time: formatActivityAge(recipe.createdAt, now),
      createdAt: recipe.createdAt,
      recipeId: recipe.id,
      recipeName: recipe.name,
      preview: recipe.preview || recipe.description,
      unread: isNewActivity(recipe.createdAt, now),
    });
  }

  const coveredHandles = new Set(
    items.flatMap((item) => ("user" in item && item.user ? [item.user.handle] : [])),
  );

  for (const [postId, post] of Object.entries(CATALOG_POSTS)) {
    if (coveredHandles.has(post.user.handle)) continue;
    if (!followedUser(following, post.user)) continue;
    if (post.user.handle === me.handle) continue;
    if (seenPosts.has(postId)) continue;
    seenPosts.add(postId);
    const createdAt = catalogPostCreatedAt(postId);
    items.push({
      id: `follow-catalog-post-${postId}`,
      kind: "post",
      user: post.user,
      time: formatActivityAge(createdAt, now),
      createdAt,
      postId,
      title: post.title,
      preview: post.body.slice(0, 160),
      thumbnailUrl: post.thumbnailUrl,
      unread: isNewActivity(createdAt, now),
    });
    coveredHandles.add(post.user.handle);
  }

  for (const recipe of CATALOG_RECIPES) {
    const user = resolveAuthor(recipe.author, me);
    if (coveredHandles.has(user.handle)) continue;
    if (user.handle === me.handle) continue;
    if (!followedUser(following, user)) continue;
    if (seenRecipes.has(recipe.id)) continue;
    seenRecipes.add(recipe.id);
    const createdAt = recipe.createdAt ?? catalogRecipeCreatedAt(recipe.id);
    items.push({
      id: `follow-catalog-recipe-${recipe.id}`,
      kind: "recipe",
      user,
      time: formatActivityAge(createdAt, now),
      createdAt,
      recipeId: recipe.id,
      recipeName: recipe.name,
      preview: recipe.description,
      unread: isNewActivity(createdAt, now),
    });
    coveredHandles.add(user.handle);
  }

  return items;
}
