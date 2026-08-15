import { MetadataManager } from "@/components/metadata/metadata-manager"

export default function StoragePathsPage() {
  return (
    <MetadataManager
      title="Storage paths"
      resource="storage_paths"
      extraFields={[{ key: "path", label: "Path", placeholder: "{{ created_year }}/{{ correspondent }}" }]}
    />
  )
}
