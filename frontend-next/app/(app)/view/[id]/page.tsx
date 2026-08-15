import { DocumentExplorer } from '@/components/documents/document-explorer'

export default async function SavedViewPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <DocumentExplorer viewId={Number(id)} />
}
