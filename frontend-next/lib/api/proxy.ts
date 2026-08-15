const PATH_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/

export function buildPaperlessProxyUrl(
	backendUrl: string,
	path: string[],
	search = ''
): URL | null {
	if (
		path.length === 0 ||
		path.some((segment) => !PATH_SEGMENT.test(segment))
	) {
		return null
	}

	let base: URL
	try {
		base = new URL(backendUrl.endsWith('/') ? backendUrl : `${backendUrl}/`)
	} catch {
		return null
	}

	const url = new URL(`api/${path.join('/')}/`, base)
	if (search) {
		url.search = search.startsWith('?') ? search.slice(1) : search
	}

	if (url.origin !== base.origin) {
		return null
	}

	return url
}
