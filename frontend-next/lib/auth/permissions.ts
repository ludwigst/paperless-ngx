export type PermissionAction = 'add' | 'view' | 'change' | 'delete'

export type PermissionType =
	| 'document'
	| 'tag'
	| 'correspondent'
	| 'documenttype'
	| 'storagepath'
	| 'savedview'
	| 'paperlesstask'
	| 'applicationconfiguration'
	| 'uisettings'
	| 'logentry'
	| 'note'
	| 'mailaccount'
	| 'mailrule'
	| 'processedmail'
	| 'user'
	| 'group'
	| 'sharelink'
	| 'customfield'
	| 'workflow'

export interface PermissionUser {
	id: number
	is_superuser?: boolean
	is_staff?: boolean
}

export function permissionCode(
	action: PermissionAction,
	type: PermissionType
) {
	return `${action}_${type}`
}

export function can(
	user: PermissionUser | null | undefined,
	permissions: string[] | undefined,
	action: PermissionAction,
	type: PermissionType
) {
	if (!user) return false
	if (user.is_superuser) return true
	return Boolean(permissions?.includes(permissionCode(action, type)))
}

export function ownsObject(
	user: PermissionUser | null | undefined,
	owner?: number | null
) {
	if (!user) return false
	if (user.is_superuser) return true
	if (owner == null) return true
	return owner === user.id
}

export function canViewLogs(user: PermissionUser | null | undefined) {
	return Boolean(user?.is_superuser || user?.is_staff)
}

export function canViewSystemStatus(
	user: PermissionUser | null | undefined,
	permissions?: string[]
) {
	if (!user) return false
	if (user.is_superuser || user.is_staff) return true
	return Boolean(permissions?.includes('view_system_monitoring'))
}
