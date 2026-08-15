import { MetadataManager } from "@/components/metadata/metadata-manager"

export default function TagsPage() {
  return <MetadataManager title="Tags" resource="tags" extraFields={[{ key: "color", label: "Color", placeholder: "#17541f" }]} />
}
