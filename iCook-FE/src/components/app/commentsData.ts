import { COMMUNITY_AUTHORS } from "@/components/app/user/authors";
import type { FeedUser } from "@/components/app/user/types";

export type CommentTargetKind = "recipe" | "post";

/** A comment on a recipe or post (seeded or user-posted). */
export type ContentComment = {
  id: string;
  targetKind: CommentTargetKind;
  targetId: string;
  user: FeedUser;
  text: string;
  /** Optional attached photo (data URL or remote). */
  imageUrl?: string;
  /** Display timestamp, e.g. "10:30AM - 27/11/2024" or "Just now". */
  time: string;
  /** Sort key (ms). Newer first. */
  createdAt: number;
  /** True for catalog seed comments (not deletable by the signed-in user). */
  seeded?: boolean;
  /** True when the content owner has hidden this comment from public view. */
  hidden?: boolean;
};

const amy = COMMUNITY_AUTHORS.chefamy;
const ben = COMMUNITY_AUTHORS.bakerben;
const sue = COMMUNITY_AUTHORS.sweetsue;
const grill = COMMUNITY_AUTHORS.grillguy;
const fish = COMMUNITY_AUTHORS.fishfan;
const sam = COMMUNITY_AUTHORS.snacksam;
const arlene = COMMUNITY_AUTHORS.arlenemccoy;
const jacob = COMMUNITY_AUTHORS.jacobjones;
const theresa = COMMUNITY_AUTHORS.theresawebb;
const courtney: FeedUser = {
  name: "Courtney Henry",
  handle: "courtneyhenry",
  initials: "CH",
};

function recipeComment(
  partial: Omit<ContentComment, "targetKind" | "seeded"> & { seeded?: boolean },
): ContentComment {
  return { ...partial, targetKind: "recipe", seeded: true };
}

function postComment(
  partial: Omit<ContentComment, "targetKind" | "seeded"> & { seeded?: boolean },
): ContentComment {
  return { ...partial, targetKind: "post", seeded: true };
}

/**
 * Seeded recipe comments.
 * Keep Grill's ravioli note in sync with ACTIVITY_FEED.
 */
export const SEED_RECIPE_COMMENTS: ContentComment[] = [
  recipeComment({
    id: "rc-1-1",
    targetId: "1",
    user: arlene,
    text: "Simple recipe, turned out yummy! 😋",
    time: "10:30AM - 27/11/2024",
    createdAt: Date.parse("2024-11-27T10:30:00"),
  }),
  recipeComment({
    id: "rc-1-2",
    targetId: "1",
    user: grill,
    text: "Tried this last night — the filling was perfect! 🔥",
    time: "8:15PM - 26/11/2024",
    createdAt: Date.parse("2024-11-26T20:15:00"),
  }),
  recipeComment({
    id: "rc-1-3",
    targetId: "1",
    user: amy,
    text: "I swapped spinach for kale and it still worked great.",
    time: "2:40PM - 25/11/2024",
    createdAt: Date.parse("2024-11-25T14:40:00"),
  }),
  recipeComment({
    id: "rc-1-4",
    targetId: "1",
    user: ben,
    text: "Dough tip: rest a full 45 minutes if your kitchen is cool.",
    time: "11:05AM - 24/11/2024",
    createdAt: Date.parse("2024-11-24T11:05:00"),
  }),
  recipeComment({
    id: "rc-2-1",
    targetId: "2",
    user: sue,
    text: "Runny yolk + crispy edge is the dream. Nailed it.",
    time: "9:12AM - 20/11/2024",
    createdAt: Date.parse("2024-11-20T09:12:00"),
  }),
  recipeComment({
    id: "rc-2-2",
    targetId: "2",
    user: jacob,
    text: "Added chili flakes — instant upgrade.",
    time: "7:50AM - 19/11/2024",
    createdAt: Date.parse("2024-11-19T07:50:00"),
  }),
  recipeComment({
    id: "rc-3-1",
    targetId: "3",
    user: fish,
    text: "Fluffy and not too sweet. Kids demolished these.",
    time: "10:00AM - 22/11/2024",
    createdAt: Date.parse("2024-11-22T10:00:00"),
  }),
  recipeComment({
    id: "rc-3-2",
    targetId: "3",
    user: amy,
    text: "Lemon zest in the batter is chef's kiss.",
    time: "8:30AM - 21/11/2024",
    createdAt: Date.parse("2024-11-21T08:30:00"),
  }),
  recipeComment({
    id: "rc-3-3",
    targetId: "3",
    user: theresa,
    text: "Made a double batch for brunch — zero leftovers.",
    time: "1:20PM - 20/11/2024",
    createdAt: Date.parse("2024-11-20T13:20:00"),
  }),
  recipeComment({
    id: "rc-4-1",
    targetId: "4",
    user: sam,
    text: "Perfect picnic food. Held up well in the fridge overnight.",
    time: "4:05PM - 18/11/2024",
    createdAt: Date.parse("2024-11-18T16:05:00"),
  }),
  recipeComment({
    id: "rc-4-2",
    targetId: "4",
    user: grill,
    text: "I threw in leftover grilled chicken — solid lunch.",
    time: "12:45PM - 17/11/2024",
    createdAt: Date.parse("2024-11-17T12:45:00"),
  }),
  recipeComment({
    id: "rc-5-1",
    targetId: "5",
    user: ben,
    text: "Crust was golden, meat stayed juicy. Bookmarked.",
    time: "6:30PM - 16/11/2024",
    createdAt: Date.parse("2024-11-16T18:30:00"),
  }),
  recipeComment({
    id: "rc-5-2",
    targetId: "5",
    user: amy,
    text: "Rosemary + garlic forever. Serving with mash next time.",
    time: "7:10PM - 15/11/2024",
    createdAt: Date.parse("2024-11-15T19:10:00"),
  }),
  recipeComment({
    id: "rc-6-1",
    targetId: "6",
    user: arlene,
    text: "Chewy centres, crispy edges — exactly what I wanted. 🍪",
    time: "3:55PM - 23/11/2024",
    createdAt: Date.parse("2024-11-23T15:55:00"),
  }),
  recipeComment({
    id: "rc-6-2",
    targetId: "6",
    user: fish,
    text: "Brown butter version was next-level.",
    time: "9:20PM - 22/11/2024",
    createdAt: Date.parse("2024-11-22T21:20:00"),
  }),
  recipeComment({
    id: "rc-6-3",
    targetId: "6",
    user: jacob,
    text: "Froze half the dough balls for emergency cookies. Genius.",
    time: "5:00PM - 21/11/2024",
    createdAt: Date.parse("2024-11-21T17:00:00"),
  }),
  recipeComment({
    id: "rc-7-1",
    targetId: "7",
    user: sue,
    text: "Almost as good as the ricotta one — love the simpler filling.",
    time: "1:15PM - 14/11/2024",
    createdAt: Date.parse("2024-11-14T13:15:00"),
  }),
  recipeComment({
    id: "rc-8-1",
    targetId: "8",
    user: sam,
    text: "Weeknight breakfast hero. Five minutes, max.",
    time: "8:05AM - 13/11/2024",
    createdAt: Date.parse("2024-11-13T08:05:00"),
  }),
  recipeComment({
    id: "rc-9-1",
    targetId: "9",
    user: theresa,
    text: "Movie night sorted. Extra salt next round.",
    time: "9:40PM - 12/11/2024",
    createdAt: Date.parse("2024-11-12T21:40:00"),
  }),
  recipeComment({
    id: "rc-10-1",
    targetId: "10",
    user: grill,
    text: "Sibling recipe to my pork roast — both slap.",
    time: "6:00PM - 11/11/2024",
    createdAt: Date.parse("2024-11-11T18:00:00"),
  }),
  recipeComment({
    id: "rc-11-1",
    targetId: "11",
    user: amy,
    text: "Crispy potatoes, tender salmon. Date-night approved.",
    time: "7:45PM - 10/11/2024",
    createdAt: Date.parse("2024-11-10T19:45:00"),
  }),
  recipeComment({
    id: "rc-11-2",
    targetId: "11",
    user: ben,
    text: "Dill + lemon is undefeated.",
    time: "8:20PM - 09/11/2024",
    createdAt: Date.parse("2024-11-09T20:20:00"),
  }),
  recipeComment({
    id: "rc-12-1",
    targetId: "12",
    user: fish,
    text: "Hearty and simple. Butter on the jacket is mandatory.",
    time: "7:00PM - 08/11/2024",
    createdAt: Date.parse("2024-11-08T19:00:00"),
  }),
  recipeComment({
    id: "rc-13-1",
    targetId: "13",
    user: sue,
    text: "No-bake vibes with real cheesecake energy. Obsessed.",
    time: "4:30PM - 07/11/2024",
    createdAt: Date.parse("2024-11-07T16:30:00"),
  }),
  recipeComment({
    id: "rc-13-2",
    targetId: "13",
    user: arlene,
    text: "Used frozen raspberries — still gorgeous.",
    time: "2:10PM - 06/11/2024",
    createdAt: Date.parse("2024-11-06T14:10:00"),
  }),
];

/** Seeded post comments (mirrors former PostDetailScreen mock threads). */
const POST_NOW = Date.parse("2024-11-28T12:00:00");

export const SEED_POST_COMMENTS: ContentComment[] = [
  postComment({
    id: "pc-1-1",
    targetId: "1",
    user: ben,
    text: "Brown butter changed my baking forever. 🍪",
    time: "1h ago",
    createdAt: POST_NOW - 60 * 60 * 1000,
  }),
  postComment({
    id: "pc-1-2",
    targetId: "1",
    user: courtney,
    text: "Trying this tonight!",
    time: "45m ago",
    createdAt: POST_NOW - 45 * 60 * 1000,
  }),
  postComment({
    id: "pc-1-3",
    targetId: "1",
    user: amy,
    text: "Cold sheet tip is underrated — thank you!",
    time: "30m ago",
    createdAt: POST_NOW - 30 * 60 * 1000,
  }),
  postComment({
    id: "pc-2-1",
    targetId: "2",
    user: grill,
    text: "Aleppo pepper is underrated. 🔥",
    time: "Yesterday",
    createdAt: POST_NOW - 24 * 60 * 60 * 1000,
  }),
  postComment({
    id: "pc-2-2",
    targetId: "2",
    user: sue,
    text: "Smoked paprika forever. Cleared my rack the same way.",
    time: "Yesterday",
    createdAt: POST_NOW - 26 * 60 * 60 * 1000,
  }),
  postComment({
    id: "pc-3-1",
    targetId: "3",
    user: fish,
    text: "Agreed — especially for fish skin.",
    time: "2d ago",
    createdAt: POST_NOW - 2 * 24 * 60 * 60 * 1000,
  }),
  postComment({
    id: "pc-3-2",
    targetId: "3",
    user: amy,
    text: "Chimney starter converted me too.",
    time: "2d ago",
    createdAt: POST_NOW - Math.round(2.5 * 24 * 60 * 60 * 1000),
  }),
  postComment({
    id: "pc-4-1",
    targetId: "4",
    user: sue,
    text: "This is my Tuesday ritual. 🍝",
    time: "3d ago",
    createdAt: POST_NOW - 3 * 24 * 60 * 60 * 1000,
  }),
  postComment({
    id: "pc-4-2",
    targetId: "4",
    user: grill,
    text: "Add chili flakes and it's dinner in 15.",
    time: "3d ago",
    createdAt: POST_NOW - Math.round(3.2 * 24 * 60 * 60 * 1000),
  }),
];

export const SEED_COMMENTS: ContentComment[] = [
  ...SEED_RECIPE_COMMENTS,
  ...SEED_POST_COMMENTS,
];

export function seedCommentsFor(
  targetKind: CommentTargetKind,
  targetId: string,
): ContentComment[] {
  return SEED_COMMENTS.filter(
    (c) => c.targetKind === targetKind && c.targetId === targetId,
  ).sort((a, b) => b.createdAt - a.createdAt);
}

/** Format a local timestamp like the seed comments. */
export function formatCommentTime(date: Date = new Date()): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${h12}:${minutes}${ampm} - ${day}/${month}/${year}`;
}
