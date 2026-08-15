export interface Paginated<T> {
	count: number
	next: string | null
	previous: string | null
	results: T[]
}

export interface PermissionsObject {
	view: { users: number[]; groups: number[] }
	change: { users: number[]; groups: number[] }
}

export interface ObjectWithId {
	id: number
}

export interface ObjectWithPermissions extends ObjectWithId {
	owner?: number | null
	permissions?: PermissionsObject
	user_can_change?: boolean
	is_shared_by_requester?: boolean
}

export interface MatchingModel extends ObjectWithId {
	name: string
	slug?: string
	match?: string
	matching_algorithm?: number
	is_insensitive?: boolean
	document_count?: number
}

export interface Tag extends MatchingModel {
	color?: string
	text_color?: string
	is_inbox_tag?: boolean
	parent?: number | null
	children?: Tag[]
}

export interface Correspondent extends MatchingModel {
	last_correspondence?: string | null
}

export type DocumentType = MatchingModel

export interface StoragePath extends MatchingModel {
	path?: string
}

export enum CustomFieldDataType {
	String = 'string',
	Url = 'url',
	Date = 'date',
	Boolean = 'boolean',
	Integer = 'integer',
	Float = 'float',
	Monetary = 'monetary',
	DocumentLink = 'documentlink',
	Select = 'select',
	LongText = 'longtext',
}

export interface CustomField extends ObjectWithId {
	data_type: CustomFieldDataType
	name: string
	extra_data?: {
		select_options?: Array<{ label: string; id: string }>
		default_currency?: string
	}
	document_count?: number
}

export interface CustomFieldInstance extends ObjectWithId {
	document: number
	field: number
	value?: unknown
}

export interface DocumentNote extends ObjectWithId {
	created?: string
	note?: string
	user?: number | User
}

export interface DocumentVersionInfo {
	id: number
	added?: string
	version_label?: string | null
	checksum?: string
	is_root: boolean
}

export interface SearchHit {
	score?: number
	rank?: number
	highlights?: string
	note_highlights?: string
}

export interface Document extends ObjectWithPermissions {
	correspondent?: number | null
	document_type?: number | null
	storage_path?: number | null
	title?: string
	content?: string
	tags?: number[]
	checksum?: string
	created?: string
	modified?: string
	added?: string
	mime_type?: string
	deleted_at?: string | null
	original_file_name?: string
	archived_file_name?: string | null
	download_url?: string
	thumbnail_url?: string
	archive_serial_number?: number | null
	notes?: DocumentNote[]
	custom_fields?: CustomFieldInstance[]
	page_count?: number
	duplicate_documents?: Array<{
		id: number
		title: string
		deleted_at?: string | null
	}>
	root_document?: number | null
	versions?: DocumentVersionInfo[]
	__search_hit__?: SearchHit
}

export interface ShareLink extends ObjectWithPermissions {
	created: string
	expiration?: string | null
	slug: string
	document: number
	file_version: 'archive' | 'original' | string
}

export interface AuditLogEntry {
	id: number
	timestamp: string
	action: string
	changes: Record<string, unknown>
	actor?: { id: number; username?: string } | null
}

export interface User extends ObjectWithId {
	username?: string
	first_name?: string
	last_name?: string
	email?: string
	is_staff?: boolean
	is_active?: boolean
	is_superuser?: boolean
	groups?: number[]
	user_permissions?: string[]
	inherited_permissions?: string[]
	is_mfa_enabled?: boolean
}

export interface Group extends ObjectWithId {
	name: string
	permissions?: string[]
}

export interface SavedView extends ObjectWithPermissions {
	name: string
	icon?: string
	show_on_dashboard?: boolean
	show_in_sidebar?: boolean
	sort_field: string
	sort_reverse: boolean
	filter_rules: FilterRule[]
	page_size?: number
	display_mode?: 'table' | 'smallCards' | 'largeCards'
	display_fields?: string[]
}

export interface FilterRule {
	rule_type: number
	value: string
}

export enum PaperlessTaskStatus {
	Pending = 'pending',
	Started = 'started',
	Success = 'success',
	Failure = 'failure',
	Revoked = 'revoked',
}

export interface PaperlessTask extends ObjectWithId {
	task_id: string
	task_type: string
	task_type_display?: string
	trigger_source?: string
	status: PaperlessTaskStatus | string
	status_display?: string
	date_created: string
	date_done?: string | null
	result?: string | null
	related_document?: number | null
	acknowledged?: boolean
}

export interface WorkflowTrigger {
	id?: number
	type: number
	sources?: number[]
	filter_filename?: string
	match?: string
	matching_algorithm?: number
}

export interface WorkflowAction {
	id?: number
	type: number
	assign_title?: string
	assign_tags?: number[]
	assign_document_type?: number
	assign_correspondent?: number
}

export interface Workflow extends ObjectWithId {
	name: string
	order: number
	enabled: boolean
	triggers: WorkflowTrigger[]
	actions: WorkflowAction[]
}

export interface UiSettingsResponse {
	user: User
	settings: Record<string, unknown>
	permissions: string[]
}

export interface Statistics {
	documents_total?: number
	documents_inbox?: number
	inbox_tag?: number
	document_file_type_counts?: Array<{
		mime_type: string
		mime_type_count: number
	}>
	character_count?: number
	tag_count?: number
	correspondent_count?: number
	document_type_count?: number
}

export type BulkEditMethod =
	| 'set_correspondent'
	| 'set_document_type'
	| 'set_storage_path'
	| 'add_tag'
	| 'remove_tag'
	| 'modify_tags'
	| 'modify_custom_fields'
	| 'set_permissions'
	| 'delete'
	| 'reprocess'
	| 'rotate'
	| 'merge'

export const MATCHING_ALGORITHMS = [
	{ id: 6, label: 'Automatic' },
	{ id: 1, label: 'Any word' },
	{ id: 2, label: 'All words' },
	{ id: 3, label: 'Exact match' },
	{ id: 4, label: 'Regular expression' },
	{ id: 5, label: 'Fuzzy word' },
	{ id: 0, label: 'None' },
] as const

export const DOCUMENT_SORT_FIELDS = [
	{ field: 'created', name: 'Created' },
	{ field: 'added', name: 'Added' },
	{ field: 'modified', name: 'Modified' },
	{ field: 'title', name: 'Title' },
	{ field: 'correspondent__name', name: 'Correspondent' },
	{ field: 'document_type__name', name: 'Document type' },
	{ field: 'archive_serial_number', name: 'ASN' },
	{ field: 'page_count', name: 'Pages' },
	{ field: 'score', name: 'Search score' },
] as const
