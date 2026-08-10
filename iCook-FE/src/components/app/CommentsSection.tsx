"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrashIcon } from "@/components/app/icons";
import CommentComposer from "@/components/app/CommentComposer";
import { useComments } from "@/components/app/CommentsProvider";
import type { CommentTargetKind } from "@/components/app/commentsData";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { withLiveProfile } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { userProfilePath } from "@/lib/userProfile";

const COMMENTS_PREVIEW = 10;

type CommentsSectionProps = {
  targetKind: CommentTargetKind;
  targetId: string;
  targetTitle: string;
};

export default function CommentsSection({
  targetKind,
  targetId,
  targetTitle,
}: CommentsSectionProps) {
  const me = useCurrentFeedUser();
  const { getComments, addComment, deleteComment } = useComments();
  const comments = getComments(targetKind, targetId);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [targetKind, targetId]);

  const visible = showAll ? comments : comments.slice(0, COMMENTS_PREVIEW);
  const hasMore = comments.length > COMMENTS_PREVIEW;

  const onSubmit = (input: { text: string; imageUrl?: string }) => {
    const posted = addComment({
      targetKind,
      targetId,
      targetTitle,
      text: input.text,
      imageUrl: input.imageUrl,
    });
    if (posted) {
      setShowAll(true);
      return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col gap-2.5 pt-3">
      <h3 className="section-title">
        Comments
        {comments.length > 0 ? (
          <span className="ms-1.5 font-normal text-muted">
            ({comments.length})
          </span>
        ) : null}
      </h3>

      {visible.length === 0 ? (
        <p className="rounded bg-app px-2.5 py-3 text-sm text-muted">
          No comments yet — be the first to share what you think.
        </p>
      ) : (
        visible.map((c) => {
          const commenter = withLiveProfile(c.user, me);
          const mine = commenter.handle === me.handle && !c.seeded;
          return (
            <div key={c.id} className="flex gap-3 rounded bg-app p-2.5">
              <Link
                href={userProfilePath(commenter.handle, me.handle)}
                aria-label={commenter.name}
                className="shrink-0"
              >
                <UserAvatar
                  initials={commenter.initials}
                  handle={commenter.handle}
                  src={commenter.avatarUrl}
                  size="sm"
                  me={commenter.handle === me.handle}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <UserNameLink
                    name={commenter.name}
                    handle={commenter.handle}
                    className="min-w-0 flex-1 text-sm font-bold text-brand"
                  />
                  {mine ? (
                    <button
                      type="button"
                      aria-label="Delete comment"
                      onClick={() => deleteComment(c.id)}
                      className="shrink-0 text-muted hover:text-brand"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  ) : null}
                </div>
                {c.text ? (
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">
                    {c.text}
                  </p>
                ) : null}
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="mt-2 max-h-52 w-full rounded border border-line object-cover"
                  />
                ) : null}
                <p className="mt-1 text-xs text-muted">{c.time}</p>
              </div>
            </div>
          );
        })
      )}

      {hasMore && !showAll ? (
        <button
          type="button"
          className="btn-primary w-full text-base"
          onClick={() => setShowAll(true)}
        >
          Show More
        </button>
      ) : null}
      {hasMore && showAll ? (
        <button
          type="button"
          className="w-full rounded border border-line py-2 text-sm font-bold text-brand hover:bg-app"
          onClick={() => setShowAll(false)}
        >
          Show Less
        </button>
      ) : null}

      <CommentComposer
        targetKey={`${targetKind}:${targetId}`}
        onSubmit={onSubmit}
      />
    </div>
  );
}
