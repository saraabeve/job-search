import type { ComponentProps, ReactNode } from "react";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-brand focus:ring-2 focus:ring-brand-soft";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "border border-line bg-white hover:bg-paper",
  ghost: "text-muted hover:bg-paper hover:text-ink",
  danger: "text-red-600 hover:bg-red-50",
};

export const buttonClass = (variant: keyof typeof variants = "primary") =>
  cx(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
  );

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return <button type="button" {...props} className={cx(buttonClass(variant), className)} />;
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Input({ label, className, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <Field label={label} className={className}>
      <input {...props} className={inputClass} />
    </Field>
  );
}

export function Textarea({ label, className, ...props }: ComponentProps<"textarea"> & { label: string }) {
  return (
    <Field label={label} className={className}>
      <textarea {...props} className={cx(inputClass, "resize-y leading-relaxed")} />
    </Field>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cx("rounded-xl border border-line bg-white p-5", className)} />;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded-lg px-3 py-2 text-sm",
        tone === "error" ? "bg-red-50 text-red-700" : "bg-brand-soft text-brand-dark",
      )}
    >
      {children}
    </p>
  );
}
