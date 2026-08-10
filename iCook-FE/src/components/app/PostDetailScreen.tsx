"use client";

import Link from "next/link";
import {
  HeartIcon,
  HeartFillIcon,
  CommentIcon,
  ShareIcon,
  PostIcon,
} from "@/components/app/icons";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { useComments } from "@/components/app/CommentsProvider";
import CommentsSection from "@/components/app/CommentsSection";
import ContentCreatorCard from "@/components/app/ContentCreatorCard";
import { CATALOG_POSTS } from "@/components/app/postsData";
import { resolveAuthor, withLiveProfile } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { absoluteAppUrl, shareContent } from "@/lib/share";

export default function PostDetailScreen({ postId }: { postId: string }) {
  const me = useCurrentFeedUser();
  const { getPost } = useCreatedContent();
  const { getComments } = useComments();
  const created = getPost(postId);
  const catalog = CATALOG_POSTS[postId];
  const resolvedId = created?.id ?? (catalog ? postId : "1");
  const post = created
    ? {
        title: created.title,
        body: created.body,
        time: "Just now",
        category: created.category || "Tips",
        user: me,
        likes: 0,
      }
    : (catalog ?? CATALOG_POSTS["1"]);
  const author = withLiveProfile(resolveAuthor(post.user.handle, me), me);
  const { isLiked, likeCount, toggleLike } = useLikedPosts();
  const liked = isLiked(resolvedId);
  const likes = likeCount(resolvedId, post.likes);
  const commentCount = getComments("post", resolvedId).length;

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

  return (
    <div className="page">
      <div className="list-stack py-2">
        {/* Hero */}
        <div className="relative flex h-56 w-full items-center justify-center overflow-hidden bg-app">
          <PostIcon className="size-16 text-brand" />
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
          </div>
        </section>

        {/* Creator + comments */}
        <ContentCreatorCard
          author={author}
          me={me}
          heartPressed={liked}
          heartLabel={liked ? `Unlike ${post.title}` : `Like ${post.title}`}
          onHeart={onToggleLike}
          shareLabel={`Share ${post.title}`}
          onShare={onShare}
        >
          <CommentsSection
            targetKind="post"
            targetId={resolvedId}
            targetTitle={post.title}
          />
        </ContentCreatorCard>
      </div>
    </div>
  );
}
