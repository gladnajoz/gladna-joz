import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppData,
  Task,
  FoodIdea,
  CalendarDay,
  ShoppingItem,
  Completion,
  ListKind,
} from "../types";
import { emptyData } from "../types";
import { getAdapter, isCloudActive } from "../lib/storage";
import { seedData } from "../lib/seed";
import { uid } from "../lib/id";
import { toggleCompletion } from "../lib/recurrence";

interface AppContextValue {
  data: AppData;
  loading: boolean;

  // Sync status for the UI badge.
  cloud: boolean; // true when the live adapter is the cloud one
  lastSyncedAt: number | null; // epoch ms of the last successful cloud read/write

  // Tasks
  addTask: (t: Omit<Task, "id" | "createdAt" | "sortOrder"> & { sortOrder?: number }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (taskId: string, date: string) => void;
  reorderLater: (orderedIds: string[]) => void;

  // Food ideas
  addFoodIdea: (name: string, source?: string) => void;
  updateFoodIdea: (id: string, patch: Partial<FoodIdea>) => void;
  deleteFoodIdea: (id: string) => void;

  // Calendar
  setCalendarDay: (date: string, patch: Partial<Omit<CalendarDay, "date">>) => void;

  // Shopping
  addShoppingItem: (
    item: Omit<ShoppingItem, "id" | "sortOrder" | "bought"> & { bought?: boolean },
  ) => void;
  updateShoppingItem: (id: string, patch: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  reorderShopping: (list: ListKind, orderedIds: string[]) => void;

  resetToSeed: () => void;
  clearAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData());
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const loadedRef = useRef(false);
  const skipSaveRef = useRef(false);
  const lastLocalSaveRef = useRef(0);
  // The cloud row's updated_at that our local state currently reflects. The
  // poller compares against this to notice another device's write cheaply.
  const syncedStampRef = useRef<string | null>(null);
  // Latest data, so the debounced save always flushes the freshest snapshot.
  const dataRef = useRef(data);
  dataRef.current = data;
  const saveTimerRef = useRef<number | null>(null);

  // Load once on mount. This must NEVER leave the app stuck on "Loading…":
  // load() is timeout-guarded in the adapter, the cloud save runs in the
  // background (not awaited), and the finally block always clears loading.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const existing = await getAdapter().load();
        if (!alive) return;
        if (existing) {
          setData(existing);
        } else {
          const seeded = seedData();
          setData(seeded);
          void getAdapter().save(seeded); // background — don't block the UI
        }
        // Record the cloud stamp we just loaded so the poller doesn't treat the
        // data we already have as a "remote change" on its first tick.
        try {
          syncedStampRef.current = await getAdapter().remoteStamp();
        } catch {
          syncedStampRef.current = null;
        }
        if (alive) setLastSyncedAt(Date.now());
      } catch (err) {
        console.error("Initial load failed, starting fresh:", err);
        if (alive) setData(seedData());
      } finally {
        if (alive) {
          loadedRef.current = true;
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Persist whenever data changes (after the first load), debounced so a burst
  // of edits collapses into one cloud write and the last-write-wins window with
  // another device stays as small as possible.
  useEffect(() => {
    if (!loadedRef.current) return;
    // Don't write back data we just pulled from the cloud (avoids redundant writes).
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    lastLocalSaveRef.current = Date.now(); // mark: a local edit is pending
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      lastLocalSaveRef.current = Date.now(); // mark: our write is landing now
      Promise.resolve(getAdapter().save(dataRef.current))
        .then(async () => {
          // Adopt the stamp our own write produced so the poller doesn't then
          // re-pull our own change as if it were remote.
          try {
            syncedStampRef.current = await getAdapter().remoteStamp();
          } catch {
            /* keep previous stamp */
          }
          setLastSyncedAt(Date.now());
        })
        .catch((err) => console.error("Save failed:", err));
    }, 700);
  }, [data]);

  // Flush a pending debounced save the moment the app is backgrounded or closed,
  // so a quick edit-then-switch-away still reaches the cloud instead of waiting
  // for the debounce (which might never fire if the tab is discarded).
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden" && saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        lastLocalSaveRef.current = Date.now();
        void getAdapter().save(dataRef.current);
      }
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, []);

  // Live sync: while the tab/app is visible, poll the cloud's updated_at and,
  // when another device has written, pull the fresh blob in. Polling (rather
  // than only reacting to visibility changes) is what makes edits actually cross
  // devices — a desktop tab or foregrounded PWA may never fire a visibility
  // event, so it would otherwise never learn about the other device's changes.
  useEffect(() => {
    if (!isCloudActive()) return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      if (document.visibilityState !== "visible" || !loadedRef.current) return;
      try {
        const stamp = await getAdapter().remoteStamp();
        if (cancelled || !stamp || stamp === syncedStampRef.current) return;

        // The cloud changed. If we just wrote locally, this is almost certainly
        // our own write echoing back — adopt the stamp and keep our local state.
        if (Date.now() - lastLocalSaveRef.current < 8000) {
          syncedStampRef.current = stamp;
          setLastSyncedAt(Date.now());
          return;
        }

        // A genuine remote change — pull it in. (Whole-blob last-write-wins: safe
        // here because we only reach this branch when we have no pending edit.)
        const fresh = await getAdapter().load();
        if (cancelled || !fresh) return;
        syncedStampRef.current = stamp;
        skipSaveRef.current = true;
        setData(fresh);
        setLastSyncedAt(Date.now());
      } catch (err) {
        console.error("Sync poll failed:", err);
      }
    };

    const interval = window.setInterval(tick, 6000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    void tick(); // run once immediately

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const update = (fn: (d: AppData) => AppData) => setData((prev) => fn(prev));

    return {
      data,
      loading,
      cloud: isCloudActive(),
      lastSyncedAt,

      addTask: (t) =>
        update((d) => ({
          ...d,
          tasks: [
            ...d.tasks,
            {
              ...t,
              id: uid(),
              createdAt: new Date().toISOString().slice(0, 10),
              sortOrder: t.sortOrder ?? nextSortOrder(d.tasks),
            } as Task,
          ],
        })),

      updateTask: (id, patch) =>
        update((d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        update((d) => ({
          ...d,
          tasks: d.tasks.filter((t) => t.id !== id),
          completions: d.completions.filter((c) => c.taskId !== id),
        })),

      toggleTaskDone: (taskId, date) =>
        update((d) => ({
          ...d,
          completions: toggleCompletion(d.completions, taskId, date),
        })),

      reorderLater: (orderedIds) =>
        update((d) => ({
          ...d,
          tasks: d.tasks.map((t) => {
            const idx = orderedIds.indexOf(t.id);
            return idx === -1 ? t : { ...t, sortOrder: idx };
          }),
        })),

      addFoodIdea: (name, source) =>
        update((d) => ({
          ...d,
          foodIdeas: [
            ...d.foodIdeas,
            {
              id: uid(),
              name,
              made: false,
              posted: false,
              written: false,
              source,
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ],
        })),

      updateFoodIdea: (id, patch) =>
        update((d) => ({
          ...d,
          foodIdeas: d.foodIdeas.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      deleteFoodIdea: (id) =>
        update((d) => ({
          ...d,
          foodIdeas: d.foodIdeas.filter((f) => f.id !== id),
          calendarDays: d.calendarDays.map((c) =>
            c.foodIdeaId === id ? { ...c, foodIdeaId: undefined } : c,
          ),
        })),

      setCalendarDay: (date, patch) =>
        update((d) => {
          const existing = d.calendarDays.find((c) => c.date === date);
          if (existing) {
            return {
              ...d,
              calendarDays: d.calendarDays.map((c) =>
                c.date === date ? { ...c, ...patch } : c,
              ),
            };
          }
          const created: CalendarDay = { date, storyTopics: "", ...patch };
          return { ...d, calendarDays: [...d.calendarDays, created] };
        }),

      addShoppingItem: (item) =>
        update((d) => ({
          ...d,
          shoppingItems: [
            ...d.shoppingItems,
            {
              ...item,
              id: uid(),
              bought: item.bought ?? false,
              sortOrder: nextShoppingOrder(d.shoppingItems, item.list),
            },
          ],
        })),

      updateShoppingItem: (id, patch) =>
        update((d) => ({
          ...d,
          shoppingItems: d.shoppingItems.map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        })),

      deleteShoppingItem: (id) =>
        update((d) => ({
          ...d,
          shoppingItems: d.shoppingItems.filter((s) => s.id !== id),
        })),

      reorderShopping: (list, orderedIds) =>
        update((d) => ({
          ...d,
          shoppingItems: d.shoppingItems.map((s) => {
            if (s.list !== list) return s;
            const idx = orderedIds.indexOf(s.id);
            return idx === -1 ? s : { ...s, sortOrder: idx };
          }),
        })),

      resetToSeed: () => {
        const seeded = seedData();
        setData(seeded);
      },

      clearAll: () => {
        setData(emptyData());
      },
    };
  }, [data, loading, lastSyncedAt]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function nextSortOrder(tasks: Task[]): number {
  const laters = tasks.filter((t) => t.recurrence.type === "later");
  return laters.length ? Math.max(...laters.map((t) => t.sortOrder)) + 1 : 0;
}

function nextShoppingOrder(items: ShoppingItem[], list: ListKind): number {
  const inList = items.filter((s) => s.list === list);
  return inList.length ? Math.max(...inList.map((s) => s.sortOrder)) + 1 : 0;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export type { Completion };
