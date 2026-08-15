import { describe, expect, it } from 'vitest'

import {
	createPdfPages,
	defaultPdfEditMode,
	hasSplit,
	movePage,
	operationsFromPages,
	pdfSourceDocumentId,
	removeSelected,
	rotatePage,
	toggleSplitAfter,
} from '@/lib/utils/pdf-editor'

describe('pdf editor operations', () => {
	it('builds one page model per original page', () => {
		expect(createPdfPages(3).map((page) => page.page)).toEqual([1, 2, 3])
	})

	it('rotates in 90 degree steps', () => {
		const pages = rotatePage(createPdfPages(1), 0, 90)
		expect(pages[0].rotate).toBe(90)
		expect(rotatePage(pages, 0, 90)[0].rotate).toBe(180)
		expect(rotatePage(pages, 0, -90)[0].rotate).toBe(0)
	})

	it('omits deleted pages from the POST operations list', () => {
		const pages = createPdfPages(3).filter((_, index) => index !== 1)
		expect(operationsFromPages(pages)).toEqual([
			{ page: 1, rotate: 0, doc: 0 },
			{ page: 3, rotate: 0, doc: 0 },
		])
	})

	it('increments doc after a split', () => {
		const split = toggleSplitAfter(createPdfPages(3), 0)
		expect(hasSplit(split)).toBe(true)
		expect(operationsFromPages(split)).toEqual([
			{ page: 1, rotate: 0, doc: 0 },
			{ page: 2, rotate: 0, doc: 1 },
			{ page: 3, rotate: 0, doc: 1 },
		])
	})

	it('reorders pages and keeps original page numbers', () => {
		const moved = movePage(createPdfPages(3), 0, 2)
		expect(moved.map((page) => page.page)).toEqual([2, 3, 1])
	})

	it('deletes the selected pages', () => {
		const selected = createPdfPages(3).map((page, index) => ({
			...page,
			selected: index !== 1,
		}))
		expect(removeSelected(selected).map((page) => page.page)).toEqual([2])
	})

	it('reads the default edit mode from UI settings', () => {
		expect(defaultPdfEditMode()).toBe('create')
		expect(
			defaultPdfEditMode({
				'general-settings:document-editing:default-edit-mode': 'update',
			})
		).toBe('update')
	})

	it('uses the newest version as the PDF source', () => {
		expect(pdfSourceDocumentId({ id: 12 })).toBe(12)
		expect(
			pdfSourceDocumentId({
				id: 12,
				versions: [
					{ id: 12 },
					{ id: 18 },
					{ id: 15 },
				],
			})
		).toBe(18)
	})
})
