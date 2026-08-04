"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BackIcon,
  HeartIcon,
  CommentIcon,
  ShareIcon,
  SendIcon,
} from "@/components/app/icons";

const POSTS: Record<
  string,
  {
    title: string;
    body: string;
    time: string;
    user: { name: string; handle: string; initials: string };
    likes: number;
    comments: { name: string; initials: string; text: string; time: string }[];
  }
> = {
  "1": {
    title: "My go-to cookie tip",
    body: "Chill your dough for at least 30 minutes — it keeps the cookies thick and chewy every time. Extra points if you brown the butter first. I also scoop onto a cold sheet so they don't spread as much in the oven.",
    time: "2h ago",
    user: { name: "Sweet Sue", handle: "sweetsue", initials: "SS" },
    likes: 28,
    comments: [
      {
        name: "Baker Ben",
        initials: "BB",
        text: "Brown butter changed my baking forever.",
        time: "1h ago",
      },
      {
        name: "Courtney Henry",
        initials: "CH",
        text: "Trying this tonight!",
        time: "45m ago",
      },
    ],
  },
  "2": {
    title: "Kitchen reset",
    body: "Cleared out the spice rack this morning — sharing what stayed, what went, and the three bottles I always refill first: smoked paprika, cumin, and Aleppo pepper. If it smells like cardboard, it's done.",
    time: "Yesterday",
    user: { name: "Chef Amy", handle: "chefamy", initials: "CA" },
    likes: 19,
    comments: [
      {
        name: "Grill Guy",
        initials: "GG",
        text: "Aleppo pepper is underrated.",
        time: "Yesterday",
      },
    ],
  },
  "3": {
    title: "Charcoal vs gas — honest take",
    body: "Gas is convenient. Charcoal wins on flavour. If you only grill on weekends, charcoal is worth the mess. Keep a chimney starter and you'll never fight with lighter fluid again.",
    time: "2d ago",
    user: { name: "Grill Guy", handle: "grillguy", initials: "GG" },
    likes: 34,
    comments: [
      {
        name: "Fish Fan",
        initials: "FF",
        text: "Agreed — especially for fish skin.",
        time: "2d ago",
      },
    ],
  },
  "4": {
    title: "Weeknight pasta formula",
    body: "One pan, one handful of greens, whatever cheese you have. Boil pasta, sear garlic in olive oil, toss greens until wilted, finish with pasta water and cheese. The formula I use when dinner needs to happen in 20 minutes.",
    time: "4d ago",
    user: {
      name: "Courtney Henry",
      handle: "courtneyhenry",
      initials: "CH",
    },
    likes: 56,
    comments: [
      {
        name: "Sweet Sue",
        initials: "SS",
        text: "This is my Tuesday ritual.",
        time: "3d ago",
      },
    ],
  },
};

export default function PostDetailScreen({ postId }: { postId: string }) {
  const router = useRouter();
  const post = POSTS[postId] ?? POSTS["1"];

  return (
    <div className="page">
      <div className="subhead">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-ink" />
        </button>
        <span className="section-title">Post</span>
      </div>

      <article className="feed-card flex flex-col gap-3">
        <div className="flex gap-3">
          <Link href="/user" className="avatar">
            {post.user.initials}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand">
              {post.user.name}
            </p>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">
                {post.user.handle}
              </span>
              <span className="text-muted"> · {post.time}</span>
            </p>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-ink">{post.title}</h1>
          <p className="mt-2 text-base leading-6 text-ink-secondary">
            {post.body}
          </p>
        </div>

        <div className="flex items-center gap-5 border-t border-line pt-3 text-brand">
          <button type="button" aria-label="Like" className="inline-flex items-center gap-1.5 text-sm text-muted">
            <HeartIcon className="size-5 text-brand" />
            {post.likes}
          </button>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <CommentIcon className="size-5 text-brand" />
            {post.comments.length}
          </span>
          <button type="button" aria-label="Share" className="ms-auto">
            <ShareIcon className="size-5" />
          </button>
        </div>
      </article>

      <section className="list-stack px-0 py-2">
        <h2 className="section-title px-3">Comments</h2>
        {post.comments.map((c) => (
          <div key={`${c.name}-${c.time}`} className="feed-card flex gap-3">
            <span className="avatar-sm">{c.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand">{c.name}</p>
              <p className="mt-0.5 text-sm text-ink">{c.text}</p>
              <p className="mt-1 text-xs text-muted">{c.time}</p>
            </div>
          </div>
        ))}
        <form
          className="feed-card flex items-center gap-1.5"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="flex-1 rounded bg-app px-2.5 py-2 text-base font-bold text-ink outline-none placeholder:text-muted"
            placeholder="Write a comment!"
            aria-label="Write a comment"
          />
          <button type="submit" aria-label="Send comment" className="text-brand">
            <SendIcon className="size-6" />
          </button>
        </form>
      </section>
    </div>
  );
}
