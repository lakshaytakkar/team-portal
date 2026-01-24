"use client"

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { MoreVertical } from "lucide-react"

export interface KanbanColumn<T> {
  id: string
  title: string
  dotColor: string
  items: T[]
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[]
  onItemMove: (itemId: string, newColumnId: string, oldColumnId: string) => void
  renderItem: (item: T) => React.ReactNode
  getItemId: (item: T) => string
  className?: string
}

export function KanbanBoard<T>({
  columns,
  onItemMove,
  renderItem,
  getItemId,
  className,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<T | null>(null)
  const [lastMove, setLastMove] = useState<{ itemId: string; columnId: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setLastMove(null)
    // Find the active item
    for (const column of columns) {
      const item = column.items.find((item) => getItemId(item) === event.active.id)
      if (item) {
        setActiveItem(item)
        break
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      setActiveItem(null)
      return
    }

    // Find which column the active item is in
    const activeColumn = columns.find((col) =>
      col.items.some((item) => getItemId(item) === active.id)
    )

    // Check if dropping on a column (droppable) or another item
    const overColumn = columns.find((col) => col.id === over.id)
    const overItemColumn = columns.find((col) =>
      col.items.some((item) => getItemId(item) === over.id)
    )

    const targetColumn = overColumn || overItemColumn

    if (activeColumn && targetColumn && activeColumn.id !== targetColumn.id) {
      // Moving between columns
      onItemMove(active.id as string, targetColumn.id, activeColumn.id)
    }

    setActiveId(null)
    setActiveItem(null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeColumn = columns.find((col) =>
      col.items.some((item) => getItemId(item) === active.id)
    )

    // Check if over a column or an item
    const overColumn = columns.find((col) => col.id === over.id)
    const overItemColumn = columns.find((col) =>
      col.items.some((item) => getItemId(item) === over.id)
    )

    const targetColumn = overColumn || overItemColumn

    if (activeColumn && targetColumn && activeColumn.id !== targetColumn.id) {
      const moveKey = `${active.id}-${targetColumn.id}`
      const lastMoveKey = lastMove ? `${lastMove.itemId}-${lastMove.columnId}` : null
      
      // Only update if this is a new move (different column)
      if (moveKey !== lastMoveKey) {
        setLastMove({ itemId: active.id as string, columnId: targetColumn.id })
        // Moving between columns - update immediately for better UX
        onItemMove(active.id as string, targetColumn.id, activeColumn.id)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={cn("flex gap-5", className)}>
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            renderItem={renderItem}
            getItemId={getItemId}
            activeId={activeId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId && activeItem ? (
          <div className="opacity-90 rotate-2 scale-105">
            {renderItem(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface KanbanColumnComponentProps<T> {
  column: KanbanColumn<T>
  renderItem: (item: T) => React.ReactNode
  getItemId: (item: T) => string
  activeId: string | null
}

function KanbanColumnComponent<T>({
  column,
  renderItem,
  getItemId,
  activeId,
}: KanbanColumnComponentProps<T>) {
  const itemIds = column.items.map(getItemId)
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Column Header */}
      <div className="bg-muted h-10 rounded-lg px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className={cn("w-2.5 h-2.5 rounded-full", column.dotColor)} />
          <span className="text-base font-semibold text-foreground leading-6 tracking-[0.32px]">
            {column.title}
          </span>
          <div className="bg-white border border-border rounded-md w-5 h-5 flex items-center justify-center">
            <span className="text-xs font-semibold text-foreground leading-4 tracking-[0.24px]">
              {column.items.length}
            </span>
          </div>
        </div>
        <button className="w-5 h-5 flex items-center justify-center">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Column Drop Zone */}
      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-3 min-h-[200px] transition-colors",
            isOver && "bg-primary/5 rounded-lg p-2"
          )}
        >
          {column.items.length > 0 ? (
            column.items.map((item) => (
              <SortableItem
                key={getItemId(item)}
                item={item}
                renderItem={renderItem}
                getItemId={getItemId}
                isDragging={activeId === getItemId(item)}
              />
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No items in this column
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

interface SortableItemProps<T> {
  item: T
  renderItem: (item: T) => React.ReactNode
  getItemId: (item: T) => string
  isDragging: boolean
}

function SortableItem<T>({
  item,
  renderItem,
  getItemId,
  isDragging,
}: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: getItemId(item),
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging || isSortableDragging && "opacity-50"
      )}
    >
      {renderItem(item)}
    </div>
  )
}

