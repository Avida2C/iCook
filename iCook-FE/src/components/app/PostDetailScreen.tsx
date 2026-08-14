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
import FeaturedRecipeBannerCta from "@/components/app/FeaturedRecipeBannerCta";
import { recipeFeaturedDescription } from "@/components/app/FeaturedRecipeDisplay";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { CATALOG_POSTS, catalogPostCreatedAt } from "@/components/app/postsData";
import {
  isOwnAuthor,
  resolveAuthor,
  withLiveProfile,
} from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import {
  CATALOG_RECIPES,
  getCategoryLabel,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import {
  formatRecipeCreatedDate,
  primaryCategory,
} from "@/components/recipes/recipesData";

function pickRandomRecipe(recipes: CatalogRecipe[]) {
  if (recipes.length === 0) return null;
  return recipes[Math.floor(Math.random() * recipes.length)] ?? null;
}

export default function PostDetailScreen({ postId }: { postId: string }) {
  const router = useRouter();
  const me = useCurrentFeedUser();
  const {
    getPost,
    resolveRecipe,
    recipes: createdRecipes,
    deletePost,
  } = useCreatedContent();
  const created = getPost(postId);
  const catalog = CATALOG_POSTS[postId];
  const resolvedId = created?.id ?? postId;
  const isOwner = Boolean(created);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [commentsFeatured, setCommentsFeatured] =
    useState<CatalogRecipe | null>(null);

  const linkedExcludeId = created?.linkedRecipeId;
  const featuredPool = [
    ...createdRecipes.filter((r) => r.id !== linkedExcludeId),
    ...CATALOG_RECIPES.filter(
      (r) =>
        r.id !== linkedExcludeId &&
        !createdRecipes.some((c) => c.id === r.id),
    ),
  ];
  const featuredPoolKey = featuredPool.map((r) => r.id).join(",");

  useEffect(() => {
    setCommentsFeatured(pickRandomRecipe(featuredPool));
    // Intentionally keyed by pool identity so the CTA stays stable while viewing.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- featuredPoolKey
  }, [postId, featuredPoolKey]);

  const { isLiked, likeCount, toggleLike } = useLikedPosts();
  const { getComments } = useComments();

  if (!created && !catalog) {
    return (
      <div className="page">
        <div className="feed-card flex flex-col items-center gap-3 py-12">
          <p className="text-center text-base text-muted">
            This post could not be found.
          </p>
          <Link href="/discover" className="btn-primary text-sm">
            Browse posts
          </Link>
        </div>
      </div>
    );
  }

  const post = created
    ? {
        title: created.title,
        body: created.body,
        category: created.category || "Tips",
        user: me,
        thumbnailUrl: created.thumbnailUrl,
        linkedRecipeId: created.linkedRecipeId,
      }
    : {
        ...catalog,
        linkedRecipeId: undefined as string | undefined,
      };
  const author = withLiveProfile(resolveAuthor(post.user.handle, me), me);
  const isSelf = author.handle === me.handle;
  const liked = isLiked(resolvedId);
  const likes = likeCount(resolvedId, created ? 0 : catalog.likes);
  const commentCount = getComments("post", resolvedId).length;
  const createdAt = created?.createdAt ?? catalogPostCreatedAt(resolvedId);

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
        {/* Hero */}
        <div className="relative h-56 w-full overflow-hidden">
          <RecipeThumbnail
            className="size-full aspect-auto! h-full"
            iconClassName="h-14 w-16"
            src={thumbnailUrl}
            category={thumbnailCategory}
            alt={post.title}
          />
        </div>

        {/* Title / meta */}
        <section className="feed-card flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-brand py-2">
              <h1 className="min-w-0 flex-1 text-base font-bold text-ink">
                {post.title}
              </h1>
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <p className="flex gap-2 text-sm text-ink">
                <span className="font-bold text-ink-secondary">Category</span>
                <span className="italic text-muted">{post.category}</span>
              </p>
              <p className="flex gap-2 text-sm text-ink">
                <span className="font-bold text-ink-secondary">Created date</span>
                <span className="italic text-muted">
                  {formatRecipeCreatedDate(createdAt)}
                </span>
              </p>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-ink-secondary">
              {post.body}
            </p>
            {linkedIsOwn && linkedRecipe ? (
              <div className="mt-3 flex flex-col gap-2">
                <h2 className="section-title text-lg">Linked Recipe</h2>
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
              </div>
            ) : null}
          </div>

          {isOwner ? (
            <div className="flex items-center pt-1 text-sm text-muted">
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
            </div>
          ) : null}

          <div className="flex items-start justify-between border-t border-line pt-4 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={
                  liked ? `Unlike ${post.title}` : `Like ${post.title}`
                }
                aria-pressed={liked}
                onClick={onToggleLike}
                className="inline-flex items-center gap-0.5 text-xs text-muted"
              >
                {liked ? (
                  <HeartFillIcon className="size-5 text-brand" />
                ) : (
                  <HeartIcon className="size-5 text-brand" />
                )}
                {likes}
              </button>
              <a
                href="#post-comments"
                className="inline-flex items-center gap-0.5 text-xs text-muted"
              >
                <CommentIcon className="size-5 text-brand" />
                {commentCount}
              </a>
            </div>
            <button
              type="button"
              aria-label={`Share ${post.title}`}
              onClick={onShare}
              className="shrink-0 text-brand"
            >
              <ShareIcon className="size-5" />
            </button>
          </div>
        </section>

        {/* Creator + comments */}
        <div id="post-comments">
          <ContentCreatorCard
            author={author}
            me={me}
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

        {commentsFeatured ? (
          <FeaturedRecipeBannerCta
            recipe={commentsFeatured}
            description={recipeFeaturedDescription(commentsFeatured)}
          />
        ) : null}
      </div>
    </div>
  );
}
