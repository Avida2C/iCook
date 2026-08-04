export type MeTab = "activity" | "recipes" | "saved" | "followers" | "following";

export type FeedUser = { name: string; handle: string; initials: string };

export type FeedItem =
  | {
      id: string;
      kind: "follow";
      user: FeedUser;
      time: string;
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
      unread?: boolean;
    }
  | {
      id: string;
      kind: "post";
      user: FeedUser;
      time: string;
      title: string;
      preview: string;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "like";
      user: FeedUser;
      time: string;
      target: string;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "comment";
      user: FeedUser;
      time: string;
      target: string;
      preview: string;
      unread?: boolean;
    };
