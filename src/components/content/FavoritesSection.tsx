"use client";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ContentItem } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { reorderFavorites } from "@/store/slices/favoritesSlice";
import ContentCard from "./ContentCard";
import { EmptyState } from "./StateViews";

function SortableCard({ id, item }: { id: string; item: ContentItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-black/50 text-white active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={12} />
      </div>
      <ContentCard item={item} />
    </div>
  );
}

export default function FavoritesSection() {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.favorites.order);
  const items = useAppSelector((s) => s.favorites.items);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    dispatch(reorderFavorites(arrayMove(order, oldIndex, newIndex)));
  }

  const orderedItems = order.map((id) => items[id]).filter(Boolean);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Favorites</h1>
        <span className="text-xs text-neutral-400">{orderedItems.length} saved · drag to reorder</span>
      </div>

      {orderedItems.length === 0 ? (
        <EmptyState message="You haven't favorited anything yet." />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {orderedItems.map((item) => (
                <SortableCard key={item.id} id={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
