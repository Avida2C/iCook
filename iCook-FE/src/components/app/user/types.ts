export type MeTab = "activity" | "recipes" | "saved" | "followers" | "following";

export type FeedUser = {
  name: string;
  handle: string;
  initials: string;
  /** Optional profile image (data URL or remote). */
  avatarUrl?: string;
  /** Short bio shown on recipe/post detail. */
  about?: string;
};

export type FeedItem =
  | {
      id: string;
      kind: "follow";
      user: FeedUser;
      time: string;
      createdAt?: number;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "recipe";
      user: FeedUser;
      time: string;
      recipeId: string;
      recipeName: string;
      preview: string;
      createdAt?: number;
      unread?: boolean;
    }
    | {
      id: string;
      kind: "post";
      user: FeedUser;
      time: string;
      postId: string;
      title: string;
      preview: string;
      thumbnailUrl?: string;
      createdAt?: number;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "like";
      self: true;
      time: string;
      target: string;
      targetKind: "recipe" | "post";
      postId?: string;
      recipeId?: string;
      createdAt?: number;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "like";
      self?: false;
      user: FeedUser;
      time: string;
      target: string;
      targetKind?: "recipe" | "post";
      postId?: string;
      recipeId?: string;
      createdAt?: number;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "comment";
      user: FeedUser;
      time: string;
      target: string;
      recipeId?: string;
      postId?: string;
      preview: string;
      createdAt?: number;
      unread?: boolean;
    };
