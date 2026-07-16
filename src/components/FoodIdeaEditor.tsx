import { useState } from "react";
import type { FoodIdea } from "../types";
import { Modal } from "./Modal";
import { CopyButton } from "./CopyButton";
import {
  buildCaption,
  INGREDIENTS_HEADER,
  RECIPE_HEADER,
  RECIPE_ENDING,
  TIPS_HEADER,
  TIPS_BULLET,
  CTA_DEFAULT,
  HASHTAGS_DEFAULT,
} from "../lib/caption";

// Full editor for a Food idea, organised into the Instagram caption sections.
// `focus` decides whether the status toggles lead ("content") or the recipe
// sections lead ("recipe").
export function FoodIdeaEditor({
  idea,
  focus,
  onSave,
  onClose,
  onDelete,
}: {
  idea: FoodIdea;
  focus: "content" | "recipe";
  onSave: (patch: Partial<FoodIdea>) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(idea.name);
  const [punchLine, setPunchLine] = useState(idea.punchLine ?? "");
  const [ingredients, setIngredients] = useState(idea.ingredients ?? "");
  const [steps, setSteps] = useState(idea.steps ?? "");
  const [tips, setTips] = useState(idea.tips ?? "");
  const [cta, setCta] = useState(idea.cta ?? CTA_DEFAULT);
  const [hashtags, setHashtags] = useState(idea.hashtags ?? HASHTAGS_DEFAULT);
  const [source, setSource] = useState(idea.source ?? "");
  const [notes, setNotes] = useState(idea.notes ?? "");
  const [made, setMade] = useState(idea.made);
  const [posted, setPosted] = useState(idea.posted);
  const [written, setWritten] = useState(idea.written);
  const [showPreview, setShowPreview] = useState(false);

  // Live draft, used for the caption preview + copy.
  const draft: FoodIdea = {
    ...idea,
    name,
    punchLine,
    ingredients,
    steps,
    tips,
    cta,
    hashtags,
  };
  const caption = buildCaption(draft);

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      punchLine: punchLine.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      steps: steps.trim() || undefined,
      tips: tips.trim() || undefined,
      cta: cta.trim() || undefined,
      hashtags: hashtags.trim() || undefined,
      source: source.trim() || undefined,
      notes: notes.trim() || undefined,
      made,
      posted,
      written,
    });
  };

  const statusToggles = (
    <div className="field">
      <label>Status</label>
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        <Toggle label="Made" on={made} onClick={() => setMade((v) => !v)} />
        <Toggle label="Posted" on={posted} onClick={() => setPosted((v) => !v)} />
        <Toggle label="Recipe written" on={written} onClick={() => setWritten((v) => !v)} />
      </div>
    </div>
  );

  const sections = (
    <>
      <Section roman="I" label="Name of the dish">
        <input
          className="input"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
      </Section>

      <Section roman="II" label="Punch line">
        <textarea
          className="textarea"
          value={punchLine}
          placeholder="The hook / one-liner…"
          onChange={(e) => setPunchLine(e.target.value)}
        />
      </Section>

      <Section roman="III" label="Ingredients" phrase={INGREDIENTS_HEADER}>
        <textarea
          className="textarea"
          value={ingredients}
          placeholder="One per line…"
          onChange={(e) => setIngredients(e.target.value)}
        />
      </Section>

      <Section roman="IV" label="Recipe" phrase={RECIPE_HEADER}>
        <textarea
          className="textarea"
          value={steps}
          placeholder="How to make it…"
          onChange={(e) => setSteps(e.target.value)}
        />
        <span className="faint" style={{ fontSize: "0.78rem" }}>
          Always ends with “{RECIPE_ENDING}”.
        </span>
      </Section>

      <Section roman="V" label="Tips & tricks" phrase={TIPS_HEADER}>
        <textarea
          className="textarea"
          value={tips}
          placeholder={`${TIPS_BULLET}one tip per line…`}
          onChange={(e) => setTips(e.target.value)}
        />
        <span className="faint" style={{ fontSize: "0.78rem" }}>
          Each line becomes a “{TIPS_BULLET.trim()}” bullet.
        </span>
      </Section>

      <Section roman="VI" label="Call to action">
        <input
          className="input"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
        />
      </Section>

      <Section roman="VII" label="Hashtags">
        <textarea
          className="textarea"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />
      </Section>
    </>
  );

  return (
    <Modal title="Food idea / recipe" onClose={onClose}>
      <div className="stack">
        {focus === "content" ? (
          <>
            {statusToggles}
            {sections}
          </>
        ) : (
          <>
            {sections}
            {statusToggles}
          </>
        )}

        <div className="field">
          <label>Source (optional)</label>
          <input
            className="input"
            value={source}
            placeholder="original / Instagram / mom / a link…"
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Private notes (not copied)</label>
          <textarea
            className="textarea"
            value={notes}
            placeholder="Just for you — reshoot ideas, reminders…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <hr className="divider" />

        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <CopyButton text={caption} />
          <button
            className="btn"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? "Hide preview" : "👁 Preview caption"}
          </button>
        </div>

        {showPreview && <div className="caption-preview">{caption}</div>}

        <div className="row" style={{ marginTop: 6 }}>
          {onDelete && (
            <button className="btn danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <div className="spacer" />
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Section({
  roman,
  label,
  phrase,
  children,
}: {
  roman: string;
  label: string;
  phrase?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>
        <span className="roman">{roman}</span>
        {label}
      </label>
      {phrase && <span className="section-phrase">{phrase}</span>}
      {children}
    </div>
  );
}

function Toggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={"btn sm" + (on ? " primary" : "")} onClick={onClick}>
      {on ? "✓ " : ""}
      {label}
    </button>
  );
}
