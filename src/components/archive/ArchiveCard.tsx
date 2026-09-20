import type { ArchiveItem } from "@/data/archive";
import type { ArchiveImage } from "@/lib/types";
import ArchivePhotoSlot from "./ArchivePhotoSlot";

interface ArchiveCardProps {
  item: ArchiveItem;
  image: ArchiveImage | undefined;
  isUploading: boolean;
  onAddPhoto: () => void;
  onOpenPhoto: () => void;
}

export default function ArchiveCard({
  item,
  image,
  isUploading,
  onAddPhoto,
  onOpenPhoto,
}: ArchiveCardProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 py-5 sm:flex-row sm:items-start sm:gap-6 sm:py-6">
      <div className="order-1 flex shrink-0 flex-col gap-1 sm:w-40 md:w-44">
        <span className="font-display text-sm tracking-[0.1em] text-star sm:text-base">
          {item.date}
        </span>
        {item.uncertain && (
          <span className="text-[10px] tracking-[0.05em] text-text-soft/50">
            ※ 다시보기 기준
          </span>
        )}
      </div>

      <div className="order-2 shrink-0 sm:order-3">
        <ArchivePhotoSlot
          image={image}
          alt={`${item.title} 대표 이미지`}
          isUploading={isUploading}
          onAddPhoto={onAddPhoto}
          onOpenPhoto={onOpenPhoto}
        />
      </div>

      <div className="order-3 flex flex-1 flex-col gap-2 sm:order-2">
        <h3 className="font-serif-kr text-lg text-text sm:text-xl">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-text-soft sm:text-base">{item.description}</p>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="border border-white/15 px-2 py-0.5 text-[10px] tracking-[0.05em] text-text-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
