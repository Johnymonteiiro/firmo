"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToParentElement } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"

/**
 * Grade reordenável por arrastar (dnd-kit).
 *
 * O arraste sai de uma **alça própria**, não do card inteiro. É o que permite
 * o card continuar clicável (abrir, marcar um checkbox) sem ambiguidade — e é
 * o que torna a reordenação possível pelo teclado: a alça é um botão, então
 * espaço inicia o arraste e as setas movem, sem disputar a tecla com a ação
 * de abrir o card.
 */
export function SortableGrid({
  ids,
  onReorder,
  className,
  children,
}: {
  ids: string[]
  onReorder: (next: string[]) => void
  className?: string
  children: React.ReactNode
}) {
  const sensors = useSensors(
    // Sem a distância mínima, um clique com o dedo trêmulo vira arraste e o
    // card não abre.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return

    onReorder(arrayMove(ids, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={className}>{children}</div>
      </SortableContext>
    </DndContext>
  )
}

export interface SortableRenderProps {
  /** Props da alça — vão no botão que inicia o arraste. */
  handle: React.HTMLAttributes<HTMLElement> & { ref: (node: HTMLElement | null) => void }
  isDragging: boolean
}

/** Item da grade. O conteúdo recebe a alça e decide onde colocá-la. */
export function SortableItem({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: (props: SortableRenderProps) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        // Arrastando, o card sobe acima dos vizinhos e perde um pouco de
        // opacidade — sem isso ele desliza por baixo deles.
        isDragging && "z-10 opacity-80",
        className
      )}
    >
      {children({
        handle: {
          ref: setActivatorNodeRef,
          ...attributes,
          ...listeners,
        },
        isDragging,
      })}
    </div>
  )
}

/** Alça padrão: o ícone de agarrar, com o cursor e o rótulo certos. */
export function DragHandle({
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing",
        className
      )}
      {...props}
    >
      <HugeiconsIcon
        icon={DragDropVerticalIcon}
        strokeWidth={2}
        className="size-4"
      />
    </button>
  )
}
