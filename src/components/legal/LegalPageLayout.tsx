import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  label: string;
  title: string;
  children: ReactNode;
}

export default function LegalPageLayout({ label, title, children }: LegalPageLayoutProps) {
  return (
    <main>
      <section className="flex flex-col items-center gap-4 px-6 pb-10 pt-32 text-center sm:pt-40">
        <span className="font-display text-xs tracking-[0.4em] text-star">{label}</span>
        <h1 className="font-display text-3xl tracking-wide text-text sm:text-5xl">{title}</h1>
      </section>

      <article className="mx-auto max-w-2xl px-6 pb-32 text-sm leading-relaxed text-text-soft sm:text-base">
        {children}
      </article>
    </main>
  );
}
