"use client";

import Link from "next/link";
import {
  HeartIcon,
  HeartFillIcon,
  CommentIcon,
  ShareIcon,
} from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import { useComments } from "@/components/app/CommentsProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { CATALOG_POSTS } from "@/components/app/postsData";
import {
  CATALOG_RECIPES,
  useSavedRecipes,
} from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";
import { withLiveProfile } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import type { FeedUser } from "@/components/app/user/types";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import { userProfilePath } from "@/lib/userProfile";

function Avatar({ user }: { user: FeedUser }) {
  const me = useCurrentFeedUser();
  const author = withLiveProfile(user, me);
  return (
    <Link
      href={userProfilePath(author.handle, me.handle)}
      aria-label={author.name}
    >
      <UserAvatar
        initials={author.initials}
        handle={author.handle}
        src={author.avatarUrl}
        me={author.handle === me.handle}
      />
    </Link>
  );
}

function Handle({ handle, time }: { handle: string; time: string }) {
  const me = useCurrentFeedUser();
  const author = withLiveProfile(
    { name: handle, handle, initials: handle.slice(0, 2).toUpperCase() },
    me,
  );
  return (
    <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-3.5">
      <span className="text-brand-soft">@</span>
      <Link
        href={userProfilePath(author.handle, me.handle)}
        className="truncate text-placeholder"
      >
        {author.handle}
      </Link>
      <span className="text-muted"> · {time}</span>
    </p>
  );
}

function AuthorLabel({ user }: { user: FeedUser }) {
  const me = useCurrentFeedUser();
  const author = withLiveProfile(user, me);
  return <UserNameLink name={author.name} handle={author.handle} />;
}

function UnreadDot() {
  return (
    <span
      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
      aria-label="New activity"
    />
  );
}

function FeedActions({
  liked,
  likes,
  comments,
  likeLabel,
  unlikeLabel,
  shareLabel,
  onLike,
  onShare,
}: {
  liked: boolean;
  likes: number;
  comments: number;
  likeLabel: string;
  unlikeLabel: string;
  shareLabel: string;
  onLike: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted">
      <button
        type="button"
        aria-label={liked ? unlikeLabel : likeLabel}
        aria-pressed={liked}
        onClick={onLike}
        className="inline-flex items-center gap-1"
      >
        {liked ? (
          <HeartFillIcon className="size-3.5 text-brand" />
        ) : (
          <HeartIcon className="size-3.5 text-brand" />
        )}
        {likes}
      </button>
      <span className="inline-flex items-center gap-1">
        <CommentIcon className="size-3.5 text-brand" />
        {comments}
      </span>
      <button
        type="button"
        aria-label={shareLabel}
        onClick={onShare}
        className="ms-auto inline-flex items-center text-brand"
      >
        <ShareIcon className="size-3.5" />
      </button>
    </div>
  );
}

export function RecipeFeedCard({
  user,
  time,
  recipeId,
  recipeName,
  preview,
  likes: baseLikes,
  comments: baseComments,
  unread = false,
}: {
  user: FeedUser;
  time: string;
  recipeId: string;
  recipeName: string;
  preview: string;
  likes?: number;
  comments?: number;
  unread?: boolean;
}) {
  const { publicRecipes, resolveRecipe } = useCreatedContent();
  const { getComments } = useComments();
  const recipe =
    resolveRecipe(recipeId) ??
    publicRecipes.find((r) => r.id === recipeId) ??
    CATALOG_RECIPES.find((r) => r.id === recipeId) ??
    CATALOG_RECIPES[0];
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);
  const likes = (baseLikes ?? recipe.bookmarkCount) + (saved ? 1 : 0);
  const comments = baseComments ?? getComments("recipe", recipeId).length;

  const onShare = () => {
    void shareContent({
      title: recipeName,
      text: preview,
      url: absoluteAppUrl(`/recipe/${recipeId}`),
    });
  };

  return (
    <article className="feed-card flex flex-col gap-2">
      <div className="flex gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <AuthorLabel user={user} /> shared a recipe
            </p>
            {unread ? <UnreadDot /> : null}
          </div>
          <Handle handle={user.handle} time={time} />
        </div>
      </div>

      <Link
        href={`/recipe/${recipeId}`}
        className="block overflow-hidden rounded border border-line"
      >
        <RecipeThumbnail
          className="aspect-square w-full"
          iconClassName="h-12 w-14"
          src={recipe.thumbnailUrl}
          category={primaryCategory(recipe)}
          alt={recipe.name}
        />
        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-bold text-ink">{recipeName}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted">
            {preview}
          </p>
        </div>
      </Link>

      <FeedActions
        liked={saved}
        likes={likes}
        comments={comments}
        likeLabel={`Save ${recipeName}`}
        unlikeLabel={`Unsave ${recipeName}`}
        shareLabel={`Share ${recipeName}`}
        onLike={() => toggleSave(recipe)}
        onShare={onShare}
      />
    </article>
  );
}

export function PostFeedCard({
  user,
  time,
  postId,
  title,
  preview,
  thumbnailUrl: thumbnailOverride,
  likes: baseLikes,
  comments: baseComments,
  unread = false,
}: {
  user: FeedUser;
  time: string;
  postId: string;
  title: string;
  preview: string;
  thumbnailUrl?: string;
  likes?: number;
  comments?: number;
  unread?: boolean;
}) {
  const { isLiked, likeCount, toggleLike } = useLikedPosts();
  const { getComments } = useComments();
  const { getPost, resolveRecipe } = useCreatedContent();
  const createdPost = getPost(postId);
  const linkedRecipe = createdPost?.linkedRecipeId
    ? resolveRecipe(createdPost.linkedRecipeId)
    : undefined;
  const thumbnailUrl =
    linkedRecipe?.thumbnailUrl ??
    thumbnailOverride ??
    createdPost?.thumbnailUrl ??
    CATALOG_POSTS[postId]?.thumbnailUrl;
  const liked = isLiked(postId);
  const likes = likeCount(
    postId,
    baseLikes ?? CATALOG_POSTS[postId]?.likes ?? 0,
  );
  const comments = baseComments ?? getComments("post", postId).length;

  const onShare = () => {
    void shareContent({
      title,
      text: preview,
      url: absoluteAppUrl(`/post/${postId}`),
    });
  };

  return (
    <article className="feed-card flex flex-col gap-2">
      <div className="flex gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <AuthorLabel user={user} /> shared a post
            </p>
            {unread ? <UnreadDot /> : null}
          </div>
          <Handle handle={user.handle} time={time} />
        </div>
      </div>

      <Link
        href={`/post/${postId}`}
        className="block overflow-hidden rounded border border-line"
      >
        <RecipeThumbnail
          className="aspect-square w-full"
          iconClassName="h-12 w-14"
          src={thumbnailUrl}
          category={linkedRecipe ? primaryCategory(linkedRecipe) : undefined}
          alt={title}
        />
        <div className="px-3 py-2.5">
          <p className="text-sm font-bold text-ink">{title}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-4 text-ink-secondary">
            {preview}
          </p>
        </div>
      </Link>

      <FeedActions
        liked={liked}
        likes={likes}
        comments={comments}
        likeLabel={`Like ${title}`}
        unlikeLabel={`Unlike ${title}`}
        shareLabel={`Share ${title}`}
        onLike={() => toggleLike({ id: postId, title })}
        onShare={onShare}
      />
    </article>
  );
}
