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
import { getAdapter } from "../lib/storage";
import { seedData } from "../lib/seed";
import { uid } from "../lib/id";
import { toggleCompletion } from "../lib/recurrence";

interface AppContextValue {
  data: AppData;
  loading: boolean;

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
  const loadedRef = useRef(false);
  const skipSaveRef = useRef(false);

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

  // Persist whenever data changes (after the first load).
  useEffect(() => {
    if (!loadedRef.current) return;
    // Don't write back data we just pulled from the cloud (avoids redundant writes).
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    try {
      void getAdapter().save(data);
    } catch (err) {
      console.error("Save failed:", err);
    }
  }, [data]);

  // Re-pull from the cloud whenever the app regains focus, so changes made on
  // another device show up here (e.g. add a recipe on the laptop → open the
  // phone → it appears).
  useEffect(() => {
    const refetch = async () => {
      if (document.visibilityState !== "visible" || !loadedRef.current) return;
      try {
        const fresh = await getAdapter().load();
        if (fresh) {
          skipSaveRef.current = true;
          setData(fresh);
        }
      } catch (err) {
        console.error("Re-sync failed:", err);
      }
    };
    document.addEventListener("visibilitychange", refetch);
    window.addEventListener("focus", refetch);
    return () => {
      document.removeEventListener("visibilitychange", refetch);
      window.removeEventListener("focus", refetch);
    };
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const update = (fn: (d: AppData) => AppData) => setData((prev) => fn(prev));

    return {
      data,
      loading,

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
  }, [data, loading]);

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
