export interface PdfEditorPage {
	page: number
	rotate: number
	splitAfter: boolean
	selected?: boolean
}

export interface PdfEditOperation {
	page: number
	rotate: number
	doc: number
}

export function createPdfPages(pageCount: number): PdfEditorPage[] {
	const count = Math.max(0, Math.floor(pageCount))
	return Array.from({ length: count }, (_, index) => ({
		page: index + 1,
		rotate: 0,
		splitAfter: false,
		selected: false,
	}))
}

export function rotateDegrees(current: number, delta: number) {
	return (current + delta + 360) % 360
}

export function rotatePage(
	pages: PdfEditorPage[],
	index: number,
	delta: number
) {
	return pages.map((item, itemIndex) =>
		itemIndex === index
			? { ...item, rotate: rotateDegrees(item.rotate, delta) }
			: item
	)
}

export function rotateSelected(pages: PdfEditorPage[], delta: number) {
	return pages.map((item) =>
		item.selected
			? { ...item, rotate: rotateDegrees(item.rotate, delta) }
			: item
	)
}

export function removePage(pages: PdfEditorPage[], index: number) {
	return pages.filter((_, itemIndex) => itemIndex !== index)
}

export function removeSelected(pages: PdfEditorPage[]) {
	return pages.filter((item) => !item.selected)
}

export function toggleSelected(pages: PdfEditorPage[], index: number) {
	return pages.map((item, itemIndex) =>
		itemIndex === index ? { ...item, selected: !item.selected } : item
	)
}

export function setAllSelected(pages: PdfEditorPage[], selected: boolean) {
	return pages.map((item) => ({ ...item, selected }))
}

export function toggleSplitAfter(pages: PdfEditorPage[], index: number) {
	return pages.map((item, itemIndex) =>
		itemIndex === index ? { ...item, splitAfter: !item.splitAfter } : item
	)
}

export function movePage(pages: PdfEditorPage[], from: number, to: number) {
	if (from < 0 || to < 0 || from >= pages.length || to >= pages.length) {
		return pages
	}
	const next = [...pages]
	const [item] = next.splice(from, 1)
	next.splice(to, 0, item)
	return next
}

export function hasSplit(pages: PdfEditorPage[]) {
	return pages.some((item) => item.splitAfter)
}

export function hasSelection(pages: PdfEditorPage[]) {
	return pages.some((item) => item.selected)
}

export function operationsFromPages(pages: PdfEditorPage[]): PdfEditOperation[] {
	return pages.map((item, index) => ({
		page: item.page,
		rotate: item.rotate,
		doc: docIndexForPage(pages, index),
	}))
}

export function docIndexForPage(pages: PdfEditorPage[], index: number) {
	let docIndex = 0
	for (let i = 0; i < index; i++) {
		if (pages[i].splitAfter) docIndex += 1
	}
	return docIndex
}

export function isPdfMime(mime?: string | null) {
	return Boolean(mime?.includes('pdf'))
}

export type PdfEditorEditMode = 'create' | 'update'

export function defaultPdfEditMode(settings?: Record<string, unknown>) {
	return settings?.['general-settings:document-editing:default-edit-mode'] ===
		'update'
		? 'update'
		: 'create'
}

export function pdfSourceDocumentId(doc: {
	id: number
	versions?: Array<{ id: number }>
}) {
	const versions = doc.versions ?? []
	return versions.length
		? Math.max(...versions.map((version) => version.id))
		: doc.id
}
