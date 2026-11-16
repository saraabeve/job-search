"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CVData, TemplateId } from "@/lib/types";

export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "classic", name: "Classic", blurb: "Centered serif, traditional" },
  { id: "modern", name: "Modern", blurb: "Clean sans with colour accents" },
  { id: "compact", name: "Compact", blurb: "Dense, fits more on a page" },
];

const STYLES: Record<
  TemplateId,
  { sheet: string; header: string; name: string; title: string; heading: string; body: string }
> = {
  classic: {
    sheet: "font-serif text-[13px] leading-[1.5]",
    header: "text-center border-b border-neutral-800 pb-3",
    name: "text-[28px] font-bold",
    title: "text-[14px] italic text-neutral-700",
    heading: "mt-5 mb-2 border-b border-neutral-400 pb-0.5 text-[12px] font-bold uppercase",
    body: "",
  },
  modern: {
    sheet: "font-sans text-[12.5px] leading-[1.5]",
    header: "border-l-4 border-[#4f3ff0] pl-4",
    name: "text-[30px] font-semibold tracking-tight",
    title: "text-[15px] font-medium text-[#4f3ff0]",
    heading: "mt-6 mb-2 text-[11px] font-semibold uppercase text-[#4f3ff0]",
    body: "",
  },
  compact: {
    sheet: "font-sans text-[11.5px] leading-[1.4]",
    header: "flex flex-wrap items-baseline justify-between gap-x-4 border-b-2 border-neutral-900 pb-2",
    name: "text-[22px] font-bold",
    title: "text-[12.5px] text-neutral-700",
    heading: "mt-3.5 mb-1 bg-neutral-100 px-1.5 py-0.5 text-[11px] font-bold uppercase",
    body: "",
  },
};

const A4_WIDTH = 794;

function Section(props: { heading: string; title: string; show: boolean; children: ReactNode }) {
  if (!props.show) return null;
  return (
    <section>
      <h2 className={props.heading}>{props.title}</h2>
      {props.children}
    </section>
  );
}

const dates = (start: string, end: string) => [start, end].filter(Boolean).join(" – ");

/** The CV rendered as an A4 sheet. Scales down to fit its container on screen and prints at full size. */
export function CVPreview({ data, template }: { data: CVData; template: TemplateId }) {
  const s = STYLES[template];
  const wrap = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / A4_WIDTH)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const p = data.personal;
  const contact = [p.email, p.phone, p.location, p.website].filter(Boolean);
  return (
    <div ref={wrap} className="w-full overflow-hidden print:overflow-visible">
      <article
        style={{ "--zoom": zoom } as React.CSSProperties}
        className={`cv-sheet min-h-[1123px] w-[794px] bg-white p-[14mm] text-neutral-900 shadow-sm ring-1 ring-line [zoom:var(--zoom)] print:min-h-0 print:w-auto print:p-0 print:shadow-none print:ring-0 print:[zoom:1] ${s.sheet}`}
      >
        <header className={s.header}>
          <div>
            <h1 className={s.name}>{p.fullName || "Your Name"}</h1>
            {p.title && <p className={s.title}>{p.title}</p>}
          </div>
          {contact.length > 0 && <p className="mt-1 text-[0.92em] text-neutral-600">{contact.join("  ·  ")}</p>}
        </header>

        <Section heading={s.heading} title="Profile" show={Boolean(data.summary)}>
          <p className="whitespace-pre-line">{data.summary}</p>
        </Section>

        <Section heading={s.heading} title="Experience" show={data.experience.length > 0}>
          {data.experience.map((e) => (
            <div key={e.id} className="mb-3 break-inside-avoid last:mb-0">
              <div className="flex items-baseline justify-between gap-4">
                <p>
                  <span className="font-semibold">{e.role}</span>
                  {e.company && <span> · {e.company}</span>}
                  {e.location && <span className="text-neutral-600">, {e.location}</span>}
                </p>
                <p className="shrink-0 text-[0.92em] text-neutral-600">{dates(e.start, e.end)}</p>
              </div>
              {e.bullets.filter(Boolean).length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>

        <Section heading={s.heading} title="Education" show={data.education.length > 0}>
          {data.education.map((e) => (
            <div key={e.id} className="mb-2 break-inside-avoid last:mb-0">
              <div className="flex items-baseline justify-between gap-4">
                <p>
                  <span className="font-semibold">{e.degree}</span>
                  {e.school && <span> · {e.school}</span>}
                </p>
                <p className="shrink-0 text-[0.92em] text-neutral-600">{dates(e.start, e.end)}</p>
              </div>
              {e.details && <p className="text-neutral-700">{e.details}</p>}
            </div>
          ))}
        </Section>

        <Section heading={s.heading} title="Skills" show={data.skills.length > 0}>
          <p>{data.skills.join("  ·  ")}</p>
        </Section>

        <Section heading={s.heading} title="Languages" show={data.languages.length > 0}>
          <p>{data.languages.join("  ·  ")}</p>
        </Section>
      </article>
    </div>
  );
}
