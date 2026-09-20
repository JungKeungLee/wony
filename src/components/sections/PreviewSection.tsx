import { PREVIEW_ITEMS } from "@/lib/constants";
import PreviewCard from "./PreviewCard";

export default function PreviewSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
      <div className="grid gap-5 sm:grid-cols-2">
        {PREVIEW_ITEMS.map((item, i) => (
          <PreviewCard key={item.href} item={item} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}
