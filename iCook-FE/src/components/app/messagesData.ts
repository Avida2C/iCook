import { COMMUNITY_AUTHORS, resolveAuthor } from "@/components/app/user/authors";
import type { FeedUser } from "@/components/app/user/types";

export type ChatMessage = {
  id: string;
  from: "you" | "them";
  text: string;
  createdAt: number;
  imageUrl?: string;
};

export type PreviewTurn = {
  from: "you" | "them";
  text: string;
};

export type ConversationPreview = {
  turns: PreviewTurn[];
};

export type SeedThread = {
  handle: string;
  unread: boolean;
  online: boolean;
  /** Featured demo: auto-types a follow-up, then they reply. */
  preview?: ConversationPreview;
  messages: ChatMessage[];
  replies: string[];
};

export type InboxConversation = {
  user: FeedUser;
  handle: string;
  last: string;
  lastFrom: "you" | "them";
  lastAt: number;
  time: string;
  unread: boolean;
  online: boolean;
};

/** Most-active thread — plays the typing/reply preview. */
export const PREVIEW_HANDLE = "chefamy";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HISTORY_PAGE_SIZE = 5;
export const HISTORY_LOAD_MS = 750;

/** Frozen seed clock so relative dummy times stay consistent for a session. */
const SEED_NOW = Date.now();

export function messagePath(handle: string) {
  return `/messages/${encodeURIComponent(handle)}`;
}

export function formatMessageClock(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function isRecentMessage(createdAt: number, now = Date.now()) {
  return now - createdAt <= DAY_MS;
}

export function formatChatTime(createdAt: number, now = Date.now()) {
  const d = new Date(createdAt);
  const clock = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  if (createdAt >= startToday.getTime()) return clock;
  const startYesterday = startToday.getTime() - DAY_MS;
  if (createdAt >= startYesterday) return `Yesterday ${clock}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${clock}`;
}

export function formatDayLabel(createdAt: number, now = Date.now()) {
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  if (createdAt >= startToday.getTime()) return "Today";
  if (createdAt >= startToday.getTime() - DAY_MS) return "Yesterday";
  return new Date(createdAt).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function messageDayKey(createdAt: number) {
  const d = new Date(createdAt);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function inboxTimeLabel(createdAt: number, now = Date.now()) {
  const age = Math.max(0, now - createdAt);
  if (age < 60_000) return "NOW";
  if (age < 60 * 60 * 1000) return `${Math.max(1, Math.floor(age / 60_000))}m`;
  if (age < DAY_MS) return `${Math.max(1, Math.floor(age / 3_600_000))}h`;
  if (age < 2 * DAY_MS) return "Yesterday";
  return new Date(createdAt).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function hoursAgo(hours: number, minutes = 0) {
  return SEED_NOW - (hours * 60 + minutes) * 60_000;
}

function daysAgo(days: number, hour: number, minute = 0) {
  const d = new Date(SEED_NOW);
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

function msg(
  id: string,
  from: "you" | "them",
  text: string,
  createdAt: number,
  imageUrl?: string,
): ChatMessage {
  return { id, from, text, createdAt, imageUrl };
}

export function messagePreviewText(message: ChatMessage | undefined): string {
  if (!message) return "";
  const text = message.text.trim();
  if (text) return text;
  if (message.imageUrl) return "Photo";
  return "";
}

export const SEED_THREADS: SeedThread[] = [
  {
    handle: "chefamy",
    unread: true,
    online: true,
    preview: {
      turns: [
        {
          from: "you",
          text: "Dressing looks glossy, not split. Packing it now — wish me luck at the potluck.",
        },
        {
          from: "them",
          text: "You've got this. Keep it cold until you serve, then toss once more. I want the recap tomorrow.",
        },
        {
          from: "you",
          text: "Should I add the herbs now or right before I walk in?",
        },
        {
          from: "them",
          text: "Right before. They go sad in the fridge. Pack them in a little bag and throw them on in the parking lot like a chef.",
        },
        {
          from: "you",
          text: "Parking-lot parsley. That's the energy. What if it looks dry after sitting?",
        },
        {
          from: "them",
          text: "Spoon of olive oil and a squeeze of lemon. Don't drown it. Taste it cold — that's how people will eat it.",
        },
        {
          from: "you",
          text: "Okay I'm leaving in ten. If this slaps I'm naming it after you.",
        },
        {
          from: "them",
          text: "Please do. Send a plate shot when you serve it. And don't skip the pinch of sugar. Trust me.",
        },
      ],
    },
    messages: [
      msg("amy-a1", "you", "Cleared the spice rack this morning. What actually earns a spot?", daysAgo(8, 9, 12)),
      msg("amy-a2", "them", "Paprika, cumin, chili flake, oregano. If you haven't used it in 6 months, it's dust.", daysAgo(8, 9, 18)),
      msg("amy-a3", "you", "The cinnamon was from 2019 😭", daysAgo(8, 9, 21)),
      msg("amy-a4", "them", "That's a candle, not a spice. Bin it.", daysAgo(8, 9, 24)),
      msg("amy-a5", "you", "Okay but the smoked paprika stays. That's non-negotiable.", daysAgo(8, 10, 2)),
      msg("amy-a6", "them", "Correct. That's the whole personality of a weeknight pan.", daysAgo(8, 10, 6)),
      msg("amy-b1", "them", "Sheet-pan chicken tonight if you're stuck. Lemon, garlic, whatever veg is sad in the drawer.", daysAgo(6, 17, 4)),
      msg("amy-b2", "you", "Broccoli is very sad. Time?", daysAgo(6, 17, 11)),
      msg("amy-b3", "them", "425, 22 minutes. Broccoli on the same pan — it wants the char.", daysAgo(6, 17, 14)),
      msg("amy-b4", "you", "Kids ate the broccoli. I'm filing this under miracles.", daysAgo(6, 19, 40)),
      msg("amy-b5", "them", "Salt + high heat. That's the whole TED talk.", daysAgo(6, 19, 44)),
      msg("amy-c1", "you", "Need a vinegar that isn't balsamic. Salad's getting predictable.", daysAgo(4, 12, 8)),
      msg("amy-c2", "them", "Red wine. Pinch of sugar. You'll think you tried.", daysAgo(4, 12, 15)),
      msg("amy-c3", "you", "Tried it on leftover roast veg. Yeah okay.", daysAgo(4, 18, 3)),
      msg("amy-c4", "them", "See. Don't tell people about the sugar.", daysAgo(4, 18, 9)),
      msg("amy-d1", "you", "Potluck Saturday. Cold thing I can make Friday night?", daysAgo(2, 11, 20)),
      msg("amy-d2", "them", "Pasta salad. Dress it the next day so it doesn't go mushy overnight.", daysAgo(2, 11, 28)),
      msg("amy-d3", "you", "Your version with celery and olives?", daysAgo(2, 11, 32)),
      msg("amy-d4", "them", "That's the one. Toast the pine nuts. People lose their minds over crunch.", daysAgo(2, 11, 36)),
      msg("amy-d5", "you", "Shopping: pasta, olives, celery, parsley, red onion?", daysAgo(2, 16, 5)),
      msg("amy-d6", "them", "And a lemon. Always a lemon.", daysAgo(2, 16, 8)),
      msg("amy-e1", "you", "Bought the lemon. Pasta's cooked and cooling in the fridge.", daysAgo(1, 20, 14)),
      msg("amy-e2", "them", "Good. Don't dress it tonight. I will know.", daysAgo(1, 20, 18)),
      msg("amy-e3", "you", "I was this close.", daysAgo(1, 20, 21)),
      msg("amy-e4", "them", "I know you were.", daysAgo(1, 20, 23)),
      msg("amy-1", "you", "Hey Amy — making your pasta salad for a potluck tomorrow. Any last-minute tricks?", hoursAgo(3, 18)),
      msg("amy-2", "them", "Chill the pasta completely before dressing it. Warm pasta drinks the oil and goes mushy.", hoursAgo(3, 16)),
      msg("amy-3", "you", "Got it. I only have red wine vinegar — that ok?", hoursAgo(3, 14)),
      msg("amy-4", "them", "Perfect. Add a pinch of sugar so it isn't sharp. And salt the water like the sea.", hoursAgo(3, 12)),
      msg("amy-5", "you", "Doing the celery and olives too? 🥗", hoursAgo(3, 10), "/icons/recipes/pasta.png"),
      msg("amy-6", "them", "Yes. The crunch is the whole point. Toast the pine nuts if you have them.", hoursAgo(3, 8)),
      msg("amy-7", "you", "Thank you!!", hoursAgo(3, 6)),
      msg("amy-8", "them", "Anytime. Text me if the dressing splits — I'll talk you through it.", hoursAgo(2, 58)),
    ],
    replies: [
      "Taste it cold, not room temp — that's how people will eat it.",
      "If it looks dry after sitting, a spoon of olive oil and a squeeze of lemon fixes it.",
      "Don't skip the pinch of sugar. Trust me on that one.",
      "Save a handful of herbs for the top so it still looks fresh when you walk in.",
      "That photo looks right — glossy, not greasy. 🔥",
      "Send me a plate shot when you serve it 😍",
    ],
  },
  {
    handle: "bakerben",
    unread: true,
    online: true,
    preview: {
      turns: [
        {
          from: "you",
          text: "Okay I warmed the syrup this time. The kids are treating breakfast like a restaurant 🥞",
        },
        {
          from: "them",
          text: "That's the move. Wipe the pan, keep it medium, and the next stack will look even better. Save me a plate.",
        },
        {
          from: "you",
          text: "First one still looks like a crime scene. The rest are fluffy though.",
        },
        {
          from: "them",
          text: "The first one is a sacrifice. Always. Butter plus a drop of oil so the crust goes gold without burning.",
        },
        {
          from: "you",
          text: "Folded the berries in at the pan like you said. No purple batter. I feel powerful.",
        },
        {
          from: "them",
          text: "That's the whole game. Leftover batter keeps overnight — stir once, don't overmix, and tomorrow's even easier.",
        },
        {
          from: "you",
          text: "There's leftover. I'm hiding it behind the milk so nobody drinks it.",
        },
        {
          from: "them",
          text: "Smart. Warm the syrup again tomorrow. Cold syrup on hot pancakes is still a crime.",
        },
      ],
    },
    messages: [
      msg("ben-a1", "you", "Muffins came out like hockey pucks. What did I do.", daysAgo(5, 8, 40)),
      msg("ben-a2", "them", "You mixed until you were angry. Stop when the flour disappears.", daysAgo(5, 8, 46)),
      msg("ben-a3", "you", "There were still streaks. I panicked.", daysAgo(5, 8, 50)),
      msg("ben-a4", "them", "Streaks bake out. Tough muffins don't.", daysAgo(5, 8, 53)),
      msg("ben-a5", "you", "Also the blueberries sank. All of them. Bottom blueberry layer.", daysAgo(5, 9, 10)),
      msg("ben-a6", "them", "Toss them in a spoon of flour first. And don't thaw frozen ones.", daysAgo(5, 9, 14)),
      msg("ben-b1", "them", "Pancake Saturday. Rest the batter 10 minutes or they won't puff.", daysAgo(3, 7, 5)),
      msg("ben-b2", "you", "I never rest it. That's the problem isn't it.", daysAgo(3, 7, 12)),
      msg("ben-b3", "them", "That's the problem. Also your pan is too hot. First one's always a sacrifice.", daysAgo(3, 7, 16)),
      msg("ben-b4", "you", "Lemon zest in the batter or on top?", daysAgo(3, 7, 22)),
      msg("ben-b5", "them", "In. Fold berries at the pan so they don't turn the whole bowl purple.", daysAgo(3, 7, 25)),
      msg("ben-1", "them", "Those blueberry pancakes from yesterday — did you rest the batter?", hoursAgo(2, 12)),
      msg("ben-2", "you", "Ten minutes. They puffed like crazy. I still scorched the first one.", hoursAgo(2, 8)),
      msg("ben-3", "them", "Everyone does. Medium heat, wipe the pan between rounds, and wait for the bubbles to set before you flip.", hoursAgo(2, 6)),
      msg("ben-4", "you", "Lemon zest was the move. Kids thought they were from a diner. 🥞", hoursAgo(1, 50), "/icons/recipes/breakfast.png"),
      msg("ben-5", "them", "That's the goal. Next time fold the berries in at the pan so they don't streak the batter purple.", hoursAgo(1, 48)),
    ],
    replies: [
      "If the pan smokes, it's too hot. Give it a minute.",
      "A tiny knob of butter plus a drop of oil keeps the crust golden without burning.",
      "Leftover batter keeps overnight. Stir once — don't overmix.",
      "Warm the syrup. Cold syrup on hot pancakes is a crime.",
      "Those look diner-level. Stack's got height 👏",
    ],
  },
  {
    handle: "sweetsue",
    unread: false,
    online: false,
    messages: [
      msg("sue-a1", "them", "If your brownies are cakey you used too much flour. Weigh it.", daysAgo(4, 15, 2)),
      msg("sue-a2", "you", "I used the cup. I shook it. I packed it. I committed crimes.", daysAgo(4, 15, 10)),
      msg("sue-a3", "them", "Pull them when the center still wobbles. They finish on the counter.", daysAgo(4, 15, 14)),
      msg("sue-a4", "you", "Shiny top or I don't want them.", daysAgo(4, 15, 20)),
      msg("sue-a5", "them", "Whisk the sugar into hot melted chocolate. That's the skin.", daysAgo(4, 15, 24)),
      msg("sue-1", "you", "Chilled the cookie dough like you said. They stayed thick. Witchcraft.", daysAgo(1, 19, 4)),
      msg("sue-2", "them", "Not witchcraft — cold fat. If they still spread, your butter was too soft going in.", daysAgo(1, 19, 8)),
      msg("sue-3", "you", "I scooped them straight from the fridge. Edges crisp, middles chewy.", daysAgo(1, 19, 16)),
      msg("sue-4", "them", "That's the one. Freeze a tray of scoops and you can bake two at 11pm without thinking.", daysAgo(1, 19, 21)),
      msg("sue-5", "you", "Froze a dozen. Future-me is going to be so smug.", daysAgo(1, 19, 28)),
      msg("sue-6", "them", "Flake salt on top while they're hot. You'll never go back.", daysAgo(1, 19, 32)),
    ],
    replies: [
      "Brown the butter next time if you want a toffee note.",
      "Flake salt on top while they're hot. You'll never go back.",
      "If the dough feels greasy, it needs longer in the fridge. 30 minutes is a minimum.",
    ],
  },
  {
    handle: "grillguy",
    unread: false,
    online: false,
    messages: [
      msg("grill-a1", "you", "Gas grill. Don't start.", daysAgo(7, 18, 2)),
      msg("grill-a2", "them", "I will start. Charcoal over gas. I will die on this hill.", daysAgo(7, 18, 6)),
      msg("grill-a3", "you", "It's raining. I'm not lighting a chimney in this.", daysAgo(7, 18, 11)),
      msg("grill-a4", "them", "Fine. Cast iron in the oven. Hard sear at the end. Pretend.", daysAgo(7, 18, 15)),
      msg("grill-a5", "you", "Probe thermometer arrived. I feel like a scientist.", daysAgo(5, 12, 40)),
      msg("grill-a6", "them", "Guessing is how you dry out a good piece of meat. Welcome.", daysAgo(5, 12, 44)),
      msg("grill-1", "them", "Tried your ricotta ravioli energy on my pork roast. Filling was perfect, crust even better.", daysAgo(3, 19, 8)),
      msg("grill-2", "you", "Wait — you put rosemary on the roast or in the filling?", daysAgo(3, 19, 14)),
      msg("grill-3", "them", "Both. Garlic, rosemary, salt crust. Low until probe hit 145, then a hard sear.", daysAgo(3, 19, 18)),
      msg("grill-4", "you", "Rest it?", daysAgo(3, 19, 22)),
      msg("grill-5", "them", "Fifteen minutes. If you slice early you're just making a sad puddle.", daysAgo(3, 19, 25)),
      msg("grill-6", "you", "The puddle was… educational.", daysAgo(3, 20, 1)),
      msg("grill-7", "them", "If the crust isn't dark enough, you're being polite. Don't be polite.", daysAgo(3, 20, 6)),
    ],
    replies: [
      "Charcoal over gas. I will die on this hill.",
      "Probe thermometer. Guessing is how you dry out a good piece of meat.",
      "If the crust isn't dark enough, you're being polite. Don't be polite.",
    ],
  },
  {
    handle: "pastapaula",
    unread: false,
    online: false,
    messages: [
      msg("paula-a1", "them", "Ravioli filling: ricotta, lemon zest, salt. That's it. Stop adding spinach water.", daysAgo(9, 13, 10)),
      msg("paula-a2", "you", "The spinach made it look healthy.", daysAgo(9, 13, 16)),
      msg("paula-a3", "them", "It made it look wet. Squeeze it like it owes you money.", daysAgo(9, 13, 20)),
      msg("paula-a4", "you", "Noted. Brown butter on top?", daysAgo(9, 13, 28)),
      msg("paula-a5", "them", "Sage in the butter until it smells like a restaurant.", daysAgo(9, 13, 32)),
      msg("paula-1", "you", "Hosting six on Saturday. Lasagna or a huge pan of baked ziti?", daysAgo(4, 10, 5)),
      msg("paula-2", "them", "Lasagna if you want applause. Ziti if you want to actually talk to your guests.", daysAgo(4, 10, 11)),
      msg("paula-3", "you", "Lasagna it is. Meat sauce — beef and sausage?", daysAgo(4, 10, 16)),
      msg("paula-4", "them", "Yes. Splash of red wine, no-boil sheets, ricotta with egg and parsley. Finish with more cheese than you think.", daysAgo(4, 10, 20)),
      msg("paula-5", "you", "Bake time?", daysAgo(4, 10, 24)),
      msg("paula-6", "them", "45 at 375 covered, then 12 uncovered. Rest before you cut or it slumps.", daysAgo(4, 10, 28)),
      msg("paula-7", "you", "Made the sauce last night. Kitchen still smells like a trattoria.", daysAgo(3, 9, 2)),
      msg("paula-8", "them", "That's how you know you did it. Salt the ricotta before it goes in.", daysAgo(3, 9, 8)),
    ],
    replies: [
      "Salt the ricotta. Bland filling is the silent killer of lasagna.",
      "Make the sauce the night before. It tastes like you tried harder.",
      "If the corners dry out, tent foil over just those spots.",
    ],
  },
  {
    handle: "fishfan",
    unread: false,
    online: false,
    messages: [
      msg("fish-a1", "them", "If it smells too fishy before it hits the oven, it was already too old. Walk away.", daysAgo(11, 16, 4)),
      msg("fish-a2", "you", "The guy at the counter said it was 'very fresh.'", daysAgo(11, 16, 10)),
      msg("fish-a3", "them", "They always say that. Eyes clear, flesh springy, or no deal.", daysAgo(11, 16, 14)),
      msg("fish-1", "them", "Sheet-pan salmon and broccolini tonight if you're stuck.", daysAgo(5, 17, 2)),
      msg("fish-2", "you", "I always overcook the fish. Clock or feel?", daysAgo(5, 17, 8)),
      msg("fish-3", "them", "Feel. 12 minutes at 425 for a medium fillet, then it should flake but still look a little translucent in the center.", daysAgo(5, 17, 12)),
      msg("fish-4", "you", "Lemon at the end?", daysAgo(5, 17, 18)),
      msg("fish-5", "them", "Always. And don't crowd the pan or you steam everything.", daysAgo(5, 17, 22)),
      msg("fish-6", "you", "Pat it dry this time. It actually browned 😮", daysAgo(5, 19, 40)),
      msg("fish-7", "them", "Wet salmon never browns. You're converted.", daysAgo(5, 19, 45)),
      msg("fish-8", "you", "Leftover salmon on toast with chili crisp. Don't yell at me.", hoursAgo(6, 20)),
      msg("fish-9", "them", "That's not leftover. That's lunch. I'd eat that.", hoursAgo(6, 12)),
    ],
    replies: [
      "Pat the fish dry. Wet salmon never browns.",
      "If it smells too fishy before it hits the oven, it was already too old.",
      "A swipe of mustard under the crumbs keeps a crust from sliding off.",
    ],
  },
  {
    handle: "snacksam",
    unread: false,
    online: false,
    messages: [
      msg("sam-a1", "them", "Movie snacks that aren't chips: roasted chickpeas, chili-lime. Or cinnamon sugar pita if it's a cozy film.", daysAgo(10, 19, 4)),
      msg("sam-a2", "you", "Pita. How sweet?", daysAgo(10, 19, 10)),
      msg("sam-a3", "them", "More cinnamon than sugar. Brush with butter. 8 minutes at 375.", daysAgo(10, 19, 14)),
      msg("sam-1", "you", "Movie night. Need something crunchy that isn't chips.", daysAgo(7, 18, 2)),
      msg("sam-2", "them", "Roasted chickpeas, chili-lime. Or cinnamon sugar pita chips if it's a cozy film.", daysAgo(7, 18, 8)),
      msg("sam-3", "you", "Chickpeas. How long till they actually crunch?", daysAgo(7, 18, 14)),
      msg("sam-4", "them", "Longer than you want — about 35 minutes, shake twice. They crisp more as they cool.", daysAgo(7, 18, 18)),
      msg("sam-5", "you", "Salted them before the oven. Leather.", daysAgo(7, 20, 1)),
      msg("sam-6", "them", "Don't salt until they come out. 5 minutes back in a hot oven if they soften overnight.", daysAgo(7, 20, 6)),
      msg("sam-7", "you", "Popcorn with nutritional yeast tonight. You said trust.", hoursAgo(14, 5)),
      msg("sam-8", "them", "Trust. If it tastes like a health food, you didn't use enough.", hoursAgo(13, 50)),
    ],
    replies: [
      "Don't salt until they come out or they stay leathery.",
      "If they soften overnight, 5 minutes back in a hot oven fixes it.",
      "Popcorn with nutritional yeast is the other move. Trust.",
    ],
  },
];

const THREAD_BY_HANDLE = Object.fromEntries(
  SEED_THREADS.map((thread) => [thread.handle, thread]),
) as Record<string, SeedThread>;

export function seedThreadFor(handle: string): SeedThread {
  const key = handle.trim().replace(/^@+/, "").toLowerCase();
  const existing = THREAD_BY_HANDLE[key];
  if (existing) return existing;
  return {
    handle: key,
    unread: false,
    online: false,
    messages: [],
    replies: [
      "Ha — yes. Try that and tell me how it tastes.",
      "I do that too. Little more salt than you think.",
      "Send a photo when it's plated?",
      "Noted. I'll steal that for next time.",
    ],
  };
}

function toInboxRow(
  handle: string,
  live: { messages: ChatMessage[]; unread: boolean } | undefined,
  online: boolean,
): InboxConversation {
  const seed = seedThreadFor(handle);
  const messages = live?.messages ?? seed.messages;
  const last = messages[messages.length - 1];
  const lastAt = last?.createdAt ?? 0;
  return {
    user: resolveAuthor(handle),
    handle,
    last: messagePreviewText(last),
    lastFrom: last?.from ?? "them",
    lastAt,
    time: last ? inboxTimeLabel(lastAt) : "",
    unread: live?.unread ?? seed.unread,
    online,
  };
}

export function inboxFromThreads(
  threads: Record<string, { messages: ChatMessage[]; unread: boolean }>,
): InboxConversation[] {
  const seeded = SEED_THREADS.map((seed) =>
    toInboxRow(seed.handle, threads[seed.handle], seed.online),
  );
  const extra = Object.keys(threads)
    .filter((handle) => !THREAD_BY_HANDLE[handle])
    .filter((handle) => (threads[handle]?.messages.length ?? 0) > 0)
    .map((handle) => toInboxRow(handle, threads[handle], false));
  return [...seeded, ...extra].sort((a, b) => b.lastAt - a.lastAt);
}

export function messageFriends(): { user: FeedUser; online: boolean }[] {
  return SEED_THREADS.map((thread) => ({
    user: COMMUNITY_AUTHORS[thread.handle] ?? resolveAuthor(thread.handle),
    online: thread.online,
  }));
}

/** Number of distinct users with unread messages. */
export function unreadMessageUsers(
  conversations: { unread: boolean }[] = SEED_THREADS,
): number {
  return conversations.filter((c) => c.unread).length;
}

const PHOTO_REPLIES = [
  "That looks done. Color is right 🔥",
  "Okay I need that plated next 😍",
  "Send a close-up of the texture?",
  "Looks great. Don't touch it until it rests.",
];

export function pickAutoReply(
  handle: string,
  userText: string,
  messages: ChatMessage[],
  opts?: { hasImage?: boolean },
): string {
  const thread = seedThreadFor(handle);
  const used = new Set(
    messages.filter((m) => m.from === "them").map((m) => m.text),
  );
  if (opts?.hasImage) {
    const photoUnused = PHOTO_REPLIES.filter((reply) => !used.has(reply));
    const photoPool = photoUnused.length > 0 ? photoUnused : PHOTO_REPLIES;
    if (!userText.trim()) {
      return photoPool[messages.length % photoPool.length];
    }
  }
  const unused = thread.replies.filter((reply) => !used.has(reply));
  const pool = unused.length > 0 ? unused : thread.replies;
  const words = userText
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3);
  const keyed = pool.find((reply) => {
    const lower = reply.toLowerCase();
    return words.some((word) => lower.includes(word));
  });
  if (keyed) return keyed;
  if (opts?.hasImage) {
    const photoUnused = PHOTO_REPLIES.filter((reply) => !used.has(reply));
    const photoPool = photoUnused.length > 0 ? photoUnused : PHOTO_REPLIES;
    return photoPool[0];
  }
  const youCount = messages.filter((m) => m.from === "you").length;
  return pool[youCount % pool.length];
}
