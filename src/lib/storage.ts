// Pluggable storage layer.
//
// Everything the app persists goes through a StorageAdapter. Which backend is
// live is decided in getAdapter():
//   - If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set  -> cloud sync.
//   - Otherwise                                              -> per-device localStorage.
// No page/component code changes when switching — just the env vars.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppData } from "../types";
import { CURRENT_DATA_VERSION, emptyData } from "../types";

export interface StorageAdapter {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
  // Cheap "has the cloud changed?" probe — returns the row's updated_at (or null
  // for local-only). Lets the app poll for remote edits without pulling the whole
  // blob every time. Null on the local adapter (nothing to poll).
  remoteStamp(): Promise<string | null>;
}

const STORAGE_KEY = "gladna-joz-organizer:v1";

export class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<AppData | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw) as AppData);
    } catch (err) {
      console.error("Failed to load data:", err);
      return null;
    }
  }

  async save(data: AppData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save data:", err);
    }
  }

  async remoteStamp(): Promise<string | null> {
    return null; // no remote to poll
  }
}

// Cloud sync. Stores the whole AppData as a single JSON row so it mirrors the
// same load()/save() contract as localStorage. Also mirrors to localStorage as
// an offline cache/fallback, so the app still opens if the network is down.
const CLOUD_ROW_ID = "main";
const CLOUD_TABLE = "app_data";
const CLOUD_TIMEOUT_MS = 8000;

// Resolve to `fallback` if the promise doesn't settle in time, so a stalled
// network request can never freeze the UI on "Loading…".
function withTimeout<T>(p: PromiseLike<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    let settled = false;
    const done = (v: T) => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    const timer = setTimeout(() => done(fallback), ms);
    Promise.resolve(p).then(
      (v) => {
        clearTimeout(timer);
        done(v);
      },
      () => {
        clearTimeout(timer);
        done(fallback);
      },
    );
  });
}

export class SupabaseAdapter implements StorageAdapter {
  private client: SupabaseClient;
  private local = new LocalStorageAdapter();

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey);
  }

  async load(): Promise<AppData | null> {
    try {
      const res = await withTimeout(
        this.client.from(CLOUD_TABLE).select("data").eq("id", CLOUD_ROW_ID).maybeSingle(),
        CLOUD_TIMEOUT_MS,
        null,
      );
      if (res === null) throw new Error("cloud load timed out");
      const { data, error } = res;
      if (error) throw error;
      if (data?.data) {
        const merged = migrate(data.data as AppData);
        this.local.save(merged); // keep an offline cache
        return merged;
      }
      // Cloud is empty (first connect). Seed it from any existing local data so
      // her current tasks/recipes aren't left behind on this device.
      const cached = await this.local.load();
      if (cached) void this.save(cached);
      return cached;
    } catch (err) {
      console.error("Cloud load failed, using local cache:", err);
      return this.local.load();
    }
  }

  async save(data: AppData): Promise<void> {
    this.local.save(data); // always keep the local cache current
    try {
      const res = await withTimeout(
        this.client.from(CLOUD_TABLE).upsert({
          id: CLOUD_ROW_ID,
          data,
          updated_at: new Date().toISOString(),
        }),
        CLOUD_TIMEOUT_MS,
        null,
      );
      if (res && res.error) throw res.error;
    } catch (err) {
      console.error("Cloud save failed (kept locally):", err);
    }
  }

  // Fetch just the row's updated_at — a tiny query the app polls to notice when
  // another device has written. Returns null on error/timeout so the caller
  // simply skips this tick instead of thrashing.
  async remoteStamp(): Promise<string | null> {
    try {
      const res = await withTimeout(
        this.client.from(CLOUD_TABLE).select("updated_at").eq("id", CLOUD_ROW_ID).maybeSingle(),
        CLOUD_TIMEOUT_MS,
        null,
      );
      if (res === null || res.error) return null;
      return (res.data?.updated_at as string | undefined) ?? null;
    } catch {
      return null;
    }
  }
}

// Forward-compatible migration hook — upgrade older blobs instead of dropping them.
function migrate(data: AppData): AppData {
  return { ...emptyData(), ...data, version: CURRENT_DATA_VERSION };
}

// Env values pasted into a hosting dashboard often arrive with junk: surrounding
// quotes, whitespace, or a stray label like "Value: https://…" copied along with
// the value. Sanitize so one bad paste can't silently drop us to local-only.
function cleanEnv(v: string | undefined): string {
  if (!v) return "";
  return v.trim().replace(/^['"]+|['"]+$/g, "").trim();
}

// Pull a usable https URL out of the configured value, even if it has a prefix
// (e.g. "Value: https://…") or a trailing slash/path.
function cleanUrl(v: string | undefined): string {
  const s = cleanEnv(v);
  const m = s.match(/https?:\/\/[^\s'"]+/);
  return (m ? m[0] : s).replace(/\/+$/, "");
}

function supabaseConfig(): { url: string; key: string } {
  return {
    url: cleanUrl(import.meta.env.VITE_SUPABASE_URL),
    key: cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY),
  };
}

let adapter: StorageAdapter | null = null;

export function getAdapter(): StorageAdapter {
  if (adapter) return adapter;
  const { url, key } = supabaseConfig();
  if (url && key) {
    try {
      adapter = new SupabaseAdapter(url, key);
      return adapter;
    } catch (err) {
      // A bad/misconfigured URL must never blank the app — fall back to local.
      console.error("Supabase init failed, using local storage instead:", err);
    }
  }
  adapter = new LocalStorageAdapter();
  return adapter;
}

// True when cloud sync is configured — handy for showing a status indicator.
export function isCloudSync(): boolean {
  const { url, key } = supabaseConfig();
  return Boolean(url && key);
}

// True when the LIVE adapter is actually the cloud one (not a local fallback).
// Reflects reality, so the UI badge can't claim "synced" when it isn't.
export function isCloudActive(): boolean {
  return getAdapter() instanceof SupabaseAdapter;
}
