export function PlaceholderPanel({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex h-full min-h-60 flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">
        {description ?? "Em breve."}
      </p>
    </div>
  )
}
