import { MetadataManager } from '@/components/metadata/metadata-manager'

export default function CustomFieldsPage() {
	return (
		<MetadataManager
			title="Custom fields"
			resource="custom_fields"
			extraFields={[{ key: 'data_type', label: 'Data type' }]}
		/>
	)
}
