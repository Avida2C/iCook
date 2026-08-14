"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  inboxFromThreads,
  PREVIEW_HANDLE,
  seedThreadFor,
  SEED_THREADS,
  type ChatMessage,
  type InboxConversation,
  type PreviewTurn,
  type SeedThread,
} from "@/components/app/messagesData";

type LiveThread = {
  messages: ChatMessage[];
  unread: boolean;
  previewPlayed: boolean;
};

export type PreviewUi = {
  handle: string;
  youDraft: string;
  autoTyping: boolean;
  themTyping: boolean;
};

type MessagesContextValue = {
  inbox: InboxConversation[];
  unreadCount: number;
  previewUi: PreviewUi | null;
  threadFor: (handle: string) => SeedThread & { messages: ChatMessage[]; previewPlayed: boolean };
  sendFromYou: (
    handle: string,
    text: string,
    opts?: { imageUrl?: string },
  ) => ChatMessage | null;
  sendFromThem: (
    handle: string,
    text: string,
    opts?: { keepRead?: boolean; imageUrl?: string },
  ) => ChatMessage | null;
  markRead: (handle: string) => void;
  markPreviewPlayed: (handle: string) => void;
  setActiveChat: (handle: string | null) => void;
  interruptPreview: (handle: string) => void;
};

const MessagesContext = createContext<MessagesContextValue | null>(null);

function emptyLive(seed: SeedThread): LiveThread {
  return {
    messages: seed.messages,
    unread: seed.unread,
    previewPlayed: false,
  };
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    if (signal.aborted) {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    } else {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function isAbort(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

function activeHandleFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/messages\/([^/?#]+)/);
  if (!match?.[1]) return null;
  const raw = decodeURIComponent(match[1]).toLowerCase();
  return raw === "1" ? PREVIEW_HANDLE : raw;
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<Record<string, LiveThread>>(() =>
    Object.fromEntries(
      SEED_THREADS.map((seed) => [seed.handle, emptyLive(seed)]),
    ),
  );
  const [previewUi, setPreviewUi] = useState<PreviewUi | null>(null);

  const patch = useCallback((handle: string, updater: (prev: LiveThread) => LiveThread) => {
    const key = handle.trim().replace(/^@+/, "").toLowerCase();
    setThreads((prev) => {
      const current = prev[key] ?? emptyLive(seedThreadFor(key));
      return { ...prev, [key]: updater(current) };
    });
  }, []);

  const inbox = useMemo(() => inboxFromThreads(threads), [threads]);
  const unreadCount = useMemo(
    () => inbox.filter((c) => c.unread).length,
    [inbox],
  );

  const threadFor = useCallback(
    (handle: string) => {
      const key = handle.trim().replace(/^@+/, "").toLowerCase();
      const seed = seedThreadFor(key);
      const live = threads[key] ?? emptyLive(seed);
      return { ...seed, ...live };
    },
    [threads],
  );

  const sendFromYou = useCallback(
    (handle: string, text: string, opts?: { imageUrl?: string }) => {
      const trimmed = text.trim();
      const imageUrl = opts?.imageUrl?.trim() || undefined;
      if (!trimmed && !imageUrl) return null;
      const now = Date.now();
      const message: ChatMessage = {
        id: nextId("you"),
        from: "you",
        text: trimmed,
        createdAt: now,
        imageUrl,
      };
      patch(handle, (prev) => ({
        ...prev,
        messages: [...prev.messages, message],
        unread: false,
      }));
      return message;
    },
    [patch],
  );

  const sendFromThem = useCallback(
    (handle: string, text: string, opts?: { keepRead?: boolean; imageUrl?: string }) => {
      const trimmed = text.trim();
      const imageUrl = opts?.imageUrl?.trim() || undefined;
      if (!trimmed && !imageUrl) return null;
      const now = Date.now();
      const message: ChatMessage = {
        id: nextId("them"),
        from: "them",
        text: trimmed,
        createdAt: now,
        imageUrl,
      };
      patch(handle, (prev) => ({
        ...prev,
        messages: [...prev.messages, message],
        unread: opts?.keepRead ? false : true,
      }));
      return message;
    },
    [patch],
  );

  const markRead = useCallback(
    (handle: string) => {
      patch(handle, (prev) =>
        prev.unread ? { ...prev, unread: false } : prev,
      );
    },
    [patch],
  );

  const markPreviewPlayed = useCallback(
    (handle: string) => {
      patch(handle, (prev) =>
        prev.previewPlayed ? prev : { ...prev, previewPlayed: true },
      );
    },
    [patch],
  );

  const sendYouRef = useRef(sendFromYou);
  const sendThemRef = useRef(sendFromThem);
  const markPlayedRef = useRef(markPreviewPlayed);
  sendYouRef.current = sendFromYou;
  sendThemRef.current = sendFromThem;
  markPlayedRef.current = markPreviewPlayed;

  const activeChatRef = useRef<string | null>(null);
  const youTypingRef = useRef<string | null>(null);
  const finishPairRef = useRef(new Set<string>());
  const turnIndexRef = useRef<Record<string, number>>({});
  const runningRef = useRef<Record<string, boolean>>({});
  const controllersRef = useRef<Record<string, AbortController>>({});
  const playedRef = useRef(new Set<string>());

  const clearPreviewUi = useCallback((handle: string) => {
    setPreviewUi((prev) => (prev?.handle === handle ? null : prev));
  }, []);

  const runPreview = useCallback(async (handle: string) => {
    if (playedRef.current.has(handle)) return;
    const existing = controllersRef.current[handle];
    if (existing && !existing.signal.aborted && runningRef.current[handle]) {
      return;
    }
    const seed = seedThreadFor(handle);
    const turns = seed.preview?.turns;
    if (!turns?.length) return;

    runningRef.current[handle] = true;
    const controller = new AbortController();
    controllersRef.current[handle] = controller;
    const signal = controller.signal;

    try {
      let i = turnIndexRef.current[handle] ?? 0;
      if (i === 0 && activeChatRef.current === handle) {
        await sleep(900, signal);
      }

      while (i < turns.length) {
        if (signal.aborted) return;
        const viewing = activeChatRef.current === handle;
        const finishPair = finishPairRef.current.has(handle);
        if (!viewing && !finishPair) return;

        const turn: PreviewTurn = turns[i];
        if (turn.from === "you") {
          youTypingRef.current = handle;
          if (activeChatRef.current === handle) {
            setPreviewUi({
              handle,
              youDraft: "",
              autoTyping: true,
              themTyping: false,
            });
            await sleep(320, signal);
            for (let n = 1; n <= turn.text.length; n++) {
              if (activeChatRef.current !== handle && finishPairRef.current.has(handle)) {
                break;
              }
              setPreviewUi({
                handle,
                youDraft: turn.text.slice(0, n),
                autoTyping: true,
                themTyping: false,
              });
              const ch = turn.text[n - 1];
              const pause =
                ch === " " ? 40 : ch === "," || ch === "—" || ch === "." ? 90 : 22;
              await sleep(pause + Math.random() * 28, signal);
            }
            if (activeChatRef.current === handle) {
              await sleep(380, signal);
            }
            setPreviewUi({
              handle,
              youDraft: "",
              autoTyping: false,
              themTyping: false,
            });
          } else {
            await sleep(450, signal);
          }
          sendYouRef.current(handle, turn.text);
          youTypingRef.current = null;
        } else {
          const onPage = activeChatRef.current === handle;
          if (onPage) {
            setPreviewUi({
              handle,
              youDraft: "",
              autoTyping: false,
              themTyping: true,
            });
          }
          await sleep(
            1000 + Math.min(turn.text.length * 16, 1600),
            signal,
          );
          const stillOnPage = activeChatRef.current === handle;
          setPreviewUi((prev) =>
            prev?.handle === handle
              ? { ...prev, themTyping: false, autoTyping: false, youDraft: "" }
              : prev,
          );
          sendThemRef.current(handle, turn.text, {
            keepRead: stillOnPage,
          });
          i += 1;
          turnIndexRef.current[handle] = i;
          if (finishPairRef.current.has(handle) && !stillOnPage) {
            finishPairRef.current.delete(handle);
            clearPreviewUi(handle);
            return;
          }
          continue;
        }
        i += 1;
        turnIndexRef.current[handle] = i;
      }
      playedRef.current.add(handle);
      markPlayedRef.current(handle);
      clearPreviewUi(handle);
    } catch (err) {
      if (!isAbort(err)) throw err;
      youTypingRef.current =
        youTypingRef.current === handle ? null : youTypingRef.current;
      if (!finishPairRef.current.has(handle)) {
        clearPreviewUi(handle);
      }
    } finally {
      runningRef.current[handle] = false;
    }
  }, [clearPreviewUi]);

  const setActiveChat = useCallback(
    (handle: string | null) => {
      const key = handle
        ? handle.trim().replace(/^@+/, "").toLowerCase()
        : null;
      const prev = activeChatRef.current;

      const nextIsThemReply = (h: string) => {
        const turns = seedThreadFor(h).preview?.turns;
        if (!turns) return false;
        const i = turnIndexRef.current[h] ?? 0;
        return turns[i]?.from === "them";
      };

      if (prev && prev !== key) {
        if (
          youTypingRef.current === prev ||
          nextIsThemReply(prev) ||
          finishPairRef.current.has(prev)
        ) {
          finishPairRef.current.add(prev);
        }
      }

      activeChatRef.current = key;

      if (prev && prev !== key && !finishPairRef.current.has(prev)) {
        controllersRef.current[prev]?.abort();
        delete controllersRef.current[prev];
        clearPreviewUi(prev);
      }

      if (key) {
        finishPairRef.current.delete(key);
        if (!playedRef.current.has(key) && seedThreadFor(key).preview) {
          void runPreview(key);
        }
      } else if (
        prev &&
        finishPairRef.current.has(prev) &&
        !runningRef.current[prev] &&
        !playedRef.current.has(prev)
      ) {
        void runPreview(prev);
      }
    },
    [clearPreviewUi, runPreview],
  );

  const interruptPreview = useCallback(
    (handle: string) => {
      const key = handle.trim().replace(/^@+/, "").toLowerCase();
      finishPairRef.current.delete(key);
      youTypingRef.current = youTypingRef.current === key ? null : youTypingRef.current;
      playedRef.current.add(key);
      controllersRef.current[key]?.abort();
      delete controllersRef.current[key];
      markPlayedRef.current(key);
      clearPreviewUi(key);
    },
    [clearPreviewUi],
  );

  const pathname = usePathname();
  useEffect(() => {
    setActiveChat(activeHandleFromPath(pathname));
  }, [pathname, setActiveChat]);

  const value = useMemo(
    () => ({
      inbox,
      unreadCount,
      previewUi,
      threadFor,
      sendFromYou,
      sendFromThem,
      markRead,
      markPreviewPlayed,
      setActiveChat,
      interruptPreview,
    }),
    [
      inbox,
      unreadCount,
      previewUi,
      threadFor,
      sendFromYou,
      sendFromThem,
      markRead,
      markPreviewPlayed,
      setActiveChat,
      interruptPreview,
    ],
  );

  return (
    <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error("useMessages must be used within MessagesProvider");
  }
  return ctx;
}
