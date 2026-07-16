// Instagram caption format for gladna.joz recipes.
//
// The recipe is stored as structured sections on a FoodIdea; buildCaption()
// assembles them into the full caption the user pastes into Instagram.
//
// Emoji note: every emoji below is widely supported and renders identically on
// desktop (Claude) and mobile (Instagram). The tips header uses 💡 rather than
// the newer 🫝, which shows as an empty box on many phones.

import type { FoodIdea } from "../types";

export const INGREDIENTS_HEADER = "🍲 Sastojci:";
export const RECIPE_HEADER = "🥘 Recept:";
export const RECIPE_ENDING = "i JEDI! 🥣";
export const TIPS_HEADER = "💡 Uči na mojim greškama:";
export const TIPS_BULLET = "• ";
export const CTA_DEFAULT = "💌 Javljaj utiske i PRIJATNO!";
export const HASHTAGS_DEFAULT =
  "#instafood #carrotcake #leto #slatko #cheesecake";

const clean = (s?: string) => (s ?? "").trim();

// Build the full Instagram caption from a food idea's sections.
export function buildCaption(f: FoodIdea): string {
  const blocks: string[] = [];

  // I — name of the dish
  if (clean(f.name)) blocks.push(clean(f.name));

  // II — punch line
  if (clean(f.punchLine)) blocks.push(clean(f.punchLine));

  // III — ingredients
  if (clean(f.ingredients)) {
    blocks.push(`${INGREDIENTS_HEADER}\n${clean(f.ingredients)}`);
  }

  // IV — recipe, always closed with the ending phrase
  if (clean(f.steps)) {
    blocks.push(`${RECIPE_HEADER}\n${clean(f.steps)}\n${RECIPE_ENDING}`);
  }

  // V — tips & tricks
  if (clean(f.tips)) {
    blocks.push(`${TIPS_HEADER}\n${withBullets(clean(f.tips))}`);
  }

  // VI — CTA (editable, default provided)
  const cta = clean(f.cta) || CTA_DEFAULT;
  blocks.push(cta);

  // VII — hashtags (editable, default provided)
  const hashtags = clean(f.hashtags) || HASHTAGS_DEFAULT;
  blocks.push(hashtags);

  return blocks.join("\n\n");
}

// Ensure each tip line is bulleted, matching the "• " starting phrase.
function withBullets(tips: string): string {
  return tips
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (!t) return "";
      return t.startsWith(TIPS_BULLET.trim()) ? t : `${TIPS_BULLET}${t}`;
    })
    .filter(Boolean)
    .join("\n");
}

// True when there's enough to bother copying.
export function hasCaptionContent(f: FoodIdea): boolean {
  return Boolean(
    clean(f.punchLine) ||
      clean(f.ingredients) ||
      clean(f.steps) ||
      clean(f.tips),
  );
}
