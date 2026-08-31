import * as React from "react";

import { DragHandle } from "@/components/dnd/sortable-grid";
import type { SortableRenderProps } from "@/components/dnd/sortable-grid";

/**
 * Moldura comum dos gráficos: título, subtítulo e o corpo. O subtítulo é onde
 * mora a explicação do que está plotado — em gráfico de série única não há
 * legenda, então o título precisa nomear a medida.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  handle,
  isEmpty,
  emptyMessage,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Alça de reordenação — some quando o card não está numa grade ordenável. */
  handle?: SortableRenderProps["handle"];
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-w-0 flex-col gap-3 rounded-xl border bg-card p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-1.5">
          {handle ? (
            <DragHandle
              label={`Reordenar ${title}`}
              className="-ml-1.5 shrink-0"
              {...handle}
            />
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-medium">{title}</h3>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {action}
      </header>

      {isEmpty ? (
        <p className="flex min-h-56 flex-1 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage ?? "Sem dados no período."}
        </p>
      ) : (
        children
      )}
    </section>
  );
}
