import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/types/paperless"

export function TagChip({ tag }: { tag: Tag }) {
  return (
    <Badge
      variant="secondary"
      className="border-0 text-[11px]"
      style={{
        backgroundColor: tag.color || undefined,
        color: tag.text_color || undefined,
      }}
    >
      {tag.name}
    </Badge>
  )
}
