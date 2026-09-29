"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ContentItem } from "@/lib/types";
import ContentCard from "./ContentCard";

export default function SortableCardWrapper({
  id,
  item,
  onOpenDetails,
}: {
  id: string;
  item: ContentItem;
  onOpenDetails?: (item: ContentItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* A real <button> (rather than a plain div) so the handle is reachable
          by keyboard Tab and works with dnd-kit's KeyboardSensor out of the
          box — dragging isn't limited to mouse/touch pointers. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute left-2 top-2 z-10 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-black/50 text-white active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        <GripVertical size={12} />
      </button>
      <ContentCard item={item} onOpenDetails={onOpenDetails} />
    </div>
  );
}
