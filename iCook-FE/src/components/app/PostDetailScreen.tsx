"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartIcon,
  HeartFillIcon,
  CommentIcon,
  ShareIcon,
  EditIcon,
  TrashIcon,
} from "@/components/app/icons";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { useComments } from "@/components/app/CommentsProvider";
import CommentsSection from "@/components/app/CommentsSection";
import ContentCreatorCard from "@/components/app/ContentCreatorCard";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { CATALOG_POSTS } from "@/components/app/postsData";
import {
  isOwnAuthor,
  resolveAuthor,
  withLiveProfile,
} from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { getCategoryLabel } from "@/components/recipes/SavedRecipesProvider";
import { readFollowing, writeFollowing } from "@/lib/accountData";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import { primaryCategory } from "@/components/recipes/recipesData";

export default function PostDetailScreen({ postId }: { postId: string }) {
  const router = useRouter();
  const me = useCurrentFeedUser();
  const {
    getPost,
    resolveRecipe,
    recipes: createdRecipes,
    deletePost,
  } = useCreatedContent();
  const { getComments } = useComments();
  const created = getPost(postId);
  const catalog = CATALOG_POSTS[postId];
  const resolvedId = created?.id ?? (catalog ? postId : "1");
  const isOwner = Boolean(created);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [followingCreator, setFollowingCreator] = useState(false);
  const post = created
    ? {
        title: created.title,
        body: created.body,
        time: "Just now",
        category: created.category || "Tips",
        user: me,
        likes: 0,
        thumbnailUrl: created.thumbnailUrl,
        linkedRecipeId: created.linkedRecipeId,
      }
    : {
        ...(catalog ?? CATALOG_POSTS["1"]),
        linkedRecipeId: undefined as string | undefined,
      };
  const author = withLiveProfile(resolveAuthor(post.user.handle, me), me);
  const isSelf = author.handle === me.handle;
  const { isLiked, likeCount, toggleLike } = useLikedPosts();
  const liked = isLiked(resolvedId);
  const likes = likeCount(resolvedId, post.likes);
  const commentCount = getComments("post", resolvedId).length;

  useEffect(() => {
    if (isSelf) {
      setFollowingCreator(false);
      return;
    }
    setFollowingCreator(readFollowing().includes(author.name));
  }, [author.name, isSelf]);

  const linkedRecipe = post.linkedRecipeId
    ? resolveRecipe(post.linkedRecipeId)
    : undefined;
  const linkedIsOwn =
    linkedRecipe != null &&
    (createdRecipes.some((r) => r.id === linkedRecipe.id) ||
      isOwnAuthor(linkedRecipe.author, me) ||
      linkedRecipe.author === post.user.handle);

  const thumbnailUrl =
    (linkedIsOwn ? linkedRecipe?.thumbnailUrl : undefined) ||
    post.thumbnailUrl;
  const thumbnailCategory = linkedIsOwn
    ? linkedRecipe
      ? primaryCategory(linkedRecipe)
      : undefined
    : undefined;

  const onShare = () => {
    void shareContent({
      title: post.title,
      text: post.body,
      url: absoluteAppUrl(`/post/${resolvedId}`),
    });
  };

  const onToggleLike = () => {
    toggleLike({ id: resolvedId, title: post.title });
  };

  const onToggleFollowCreator = () => {
    if (isSelf) return;
    setFollowingCreator((prev) => {
      const next = !prev;
      const list = readFollowing();
      writeFollowing(
        next
          ? list.includes(author.name)
            ? list
            : [...list, author.name]
          : list.filter((n) => n !== author.name),
      );
      return next;
    });
  };

  const onDelete = () => {
    if (!created) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deletePost(created.id);
    router.push("/user");
  };

  return (
    <div className="page">
      <div className="list-stack py-2">
        {/* Hero — matches recipe detail; uses linked own-recipe thumb when set */}
        <div className="relative h-56 w-full overflow-hidden">
          <RecipeThumbnail
            className="size-full aspect-auto! h-full"
            iconClassName="h-14 w-16"
            src={thumbnailUrl}
            category={thumbnailCategory}
            alt={post.title}
          />
        </div>

        {/* Title / content */}
        <section className="feed-card flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-brand py-2">
              <h1 className="min-w-0 flex-1 text-xl font-bold text-ink">
                {post.title}
              </h1>
              <button
                type="button"
                aria-label={
                  liked ? `Unlike ${post.title}` : `Like ${post.title}`
                }
                aria-pressed={liked}
                onClick={onToggleLike}
                className="shrink-0 text-brand"
              >
                {liked ? (
                  <HeartFillIcon className="size-7" />
                ) : (
                  <HeartIcon className="size-7" />
                )}
              </button>
              <button
                type="button"
                aria-label={`Share ${post.title}`}
                onClick={onShare}
                className="shrink-0 text-brand"
              >
                <ShareIcon className="size-6" />
              </button>
            </div>
            <p className="mt-2 flex gap-2 text-sm text-ink">
              <span className="font-bold text-ink-secondary">Category</span>
              <span className="italic text-muted">{post.category}</span>
            </p>
            <p className="mt-1 text-xs text-muted">{post.time}</p>
          </div>

          <p className="text-base leading-6 text-ink-secondary">{post.body}</p>

          <div className="flex items-center gap-5 border-t border-line pt-3 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              {liked ? (
                <HeartFillIcon className="size-5 text-brand" />
              ) : (
                <HeartIcon className="size-5 text-brand" />
              )}
              {likes}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CommentIcon className="size-5 text-brand" />
              {commentCount}
            </span>

            {isOwner ? (
              <div className="ms-auto flex items-center gap-1">
                {confirmDelete ? (
                  <>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="inline-flex items-center gap-1 rounded bg-brand px-2.5 py-1.5 text-xs font-bold text-white"
                    >
                      <TrashIcon className="size-3.5" />
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 text-xs font-bold text-muted"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/post/${resolvedId}/edit`}
                      aria-label={`Edit ${post.title}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-xs font-bold text-placeholder transition-colors hover:bg-brand/10 hover:text-brand"
                    >
                      <EditIcon className="size-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={onDelete}
                      aria-label={`Delete ${post.title}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-xs font-bold text-placeholder transition-colors hover:bg-brand/10 hover:text-brand"
                    >
                      <TrashIcon className="size-3.5" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {linkedIsOwn && linkedRecipe ? (
          <section className="feed-card flex flex-col gap-2">
            <h2 className="section-title">Linked Recipe</h2>
            <Link
              href={`/recipe/${linkedRecipe.id}`}
              className="flex items-center gap-3 overflow-hidden rounded border border-line"
            >
              <RecipeThumbnail
                className="size-20 shrink-0"
                iconClassName="h-10 w-11"
                src={linkedRecipe.thumbnailUrl}
                category={primaryCategory(linkedRecipe)}
                alt={linkedRecipe.name}
              />
              <div className="min-w-0 flex-1 py-2 pe-3">
                <p className="truncate text-sm font-bold text-ink">
                  {linkedRecipe.name}
                </p>
                <p className="mt-0.5 text-xs capitalize text-muted">
                  {linkedRecipe.categories
                    .map((c) => getCategoryLabel(c))
                    .join(", ")}
                </p>
              </div>
            </Link>
          </section>
        ) : null}

        {/* Creator + comments — creator heart follows the author, not post like */}
        <ContentCreatorCard
          author={author}
          me={me}
          heartPressed={followingCreator}
          heartLabel={
            isSelf
              ? "This is you"
              : followingCreator
                ? `Unfollow ${author.name}`
                : `Follow ${author.name}`
          }
          onHeart={onToggleFollowCreator}
          shareLabel={`Share ${post.title}`}
          onShare={onShare}
        >
          <CommentsSection
            targetKind="post"
            targetId={resolvedId}
            targetTitle={post.title}
            isContentOwner={isOwner || isSelf}
          />
        </ContentCreatorCard>
      </div>
    </div>
  );
}
