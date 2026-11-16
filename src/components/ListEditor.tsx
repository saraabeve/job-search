"use client";

import { useState } from "react";
import { Button, Field, inputClass } from "./ui";

/** Tag-style editor for short lists such as skills and languages. */
export function ListEditor(props: {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const fresh = draft
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !props.items.includes(s));
    if (fresh.length) props.onChange([...props.items, ...fresh]);
    setDraft("");
  }

  return (
    <div>
      <Field label={props.label}>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={draft}
            placeholder={props.placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <Button variant="secondary" onClick={add}>
            Add
          </Button>
        </div>
      </Field>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {props.items.map((item) => (
          <li key={item} className="flex items-center gap-1 rounded-full bg-brand-soft py-1 pl-3 pr-1 text-sm text-brand-dark">
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              className="h-5 w-5 cursor-pointer rounded-full leading-none hover:bg-white"
              onClick={() => props.onChange(props.items.filter((i) => i !== item))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
