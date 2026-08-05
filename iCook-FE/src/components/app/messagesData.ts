export type Conversation = {
  name: string;
  handle: string;
  last: string;
  time: string;
  unread: boolean;
};

export const CONVERSATIONS: Conversation[] = [
  {
    name: "Eleanor Pena",
    handle: "eleanorpena",
    last: "Anytime! Let me know how it turns out—I might have to come over for a taste!",
    time: "NOW",
    unread: true,
  },
  {
    name: "Bessie Cooper",
    handle: "bessiecooper",
    last: "Alright! Talk Soon!",
    time: "Dec 01",
    unread: false,
  },
  {
    name: "Guy Hawkins",
    handle: "guyhawkins",
    last: "Curry Chicken and White rice is the best, Absolutely Love it!",
    time: "Nov 25",
    unread: false,
  },
];

/** Number of distinct users with unread messages. */
export function unreadMessageUsers(
  conversations: Conversation[] = CONVERSATIONS,
): number {
  return conversations.filter((c) => c.unread).length;
}
