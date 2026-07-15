import type { D365Context, SavedPage } from "./types";

const RECENT_KEY = "d365PageInspector.recent";
const FAVOURITES_KEY = "d365PageInspector.favourites";
const MAX_RECENT = 15;

function makeId(context: D365Context): string {
  return `${context.environment}|${context.legalEntity}|${context.menuItem}|${context.url}`;
}

export async function getRecent(): Promise<SavedPage[]> {
  const data = await chrome.storage.local.get(RECENT_KEY);
  return (data[RECENT_KEY] as SavedPage[]) || [];
}

export async function getFavourites(): Promise<SavedPage[]> {
  const data = await chrome.storage.local.get(FAVOURITES_KEY);
  return (data[FAVOURITES_KEY] as SavedPage[]) || [];
}

export async function addToRecent(context: D365Context): Promise<SavedPage[]> {
  const existing = await getRecent();
  const id = makeId(context);
  const entry: SavedPage = { ...context, id, savedAt: new Date().toISOString() };
  const deduped = existing.filter((p) => p.id !== id);
  const updated = [entry, ...deduped].slice(0, MAX_RECENT);
  await chrome.storage.local.set({ [RECENT_KEY]: updated });
  return updated;
}

export async function toggleFavourite(context: D365Context): Promise<SavedPage[]> {
  const favourites = await getFavourites();
  const id = makeId(context);
  const exists = favourites.some((p) => p.id === id);
  const updated = exists
    ? favourites.filter((p) => p.id !== id)
    : [{ ...context, id, savedAt: new Date().toISOString() }, ...favourites];
  await chrome.storage.local.set({ [FAVOURITES_KEY]: updated });
  return updated;
}

export async function isFavourite(context: D365Context): Promise<boolean> {
  const favourites = await getFavourites();
  return favourites.some((p) => p.id === makeId(context));
}

export async function removeFavourite(id: string): Promise<SavedPage[]> {
  const favourites = await getFavourites();
  const updated = favourites.filter((p) => p.id !== id);
  await chrome.storage.local.set({ [FAVOURITES_KEY]: updated });
  return updated;
}

export async function clearRecent(): Promise<void> {
  await chrome.storage.local.set({ [RECENT_KEY]: [] });
}
