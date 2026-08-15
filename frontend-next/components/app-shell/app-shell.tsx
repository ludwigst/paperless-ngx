'use client'

import {
	Archive,
	FileStack,
	FolderTree,
	Inbox,
	LayoutDashboard,
	ListTodo,
	Menu,
	Search,
	Settings,
	Tags,
	Users,
	Workflow,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { UserMenu } from '@/components/app-shell/user-menu'
import { CommandPalette } from '@/components/app-shell/command-palette'
import { GlobalSearch } from '@/components/app-shell/global-search'
import { TaskIndicator } from '@/components/app-shell/task-indicator'
import { ThemeToggle } from '@/components/app-shell/theme-toggle'
import { UploadDropzone } from '@/components/upload/upload-dropzone'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { useUiSettings } from '@/hooks/use-auth'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { useSavedViews } from '@/hooks/use-metadata'
import { can } from '@/lib/auth/permissions'
import { cn } from '@/lib/utils'
import { displayName } from '@/lib/utils/search-params'

const NAV = [
	{
		href: '/documents',
		label: 'Documents',
		icon: FileStack,
		type: 'document' as const,
	},
	{ href: '/inbox', label: 'Inbox', icon: Inbox, type: 'document' as const },
	{ href: '/tags', label: 'Tags', icon: Tags, type: 'tag' as const },
	{
		href: '/correspondents',
		label: 'Correspondents',
		icon: Archive,
		type: 'correspondent' as const,
	},
	{
		href: '/document-types',
		label: 'Types',
		icon: LayoutDashboard,
		type: 'documenttype' as const,
	},
	{
		href: '/storage-paths',
		label: 'Storage paths',
		icon: FolderTree,
		type: 'storagepath' as const,
	},
	{
		href: '/custom-fields',
		label: 'Custom fields',
		icon: ListTodo,
		type: 'customfield' as const,
	},
	{
		href: '/workflows',
		label: 'Workflows',
		icon: Workflow,
		type: 'workflow' as const,
	},
	{
		href: '/tasks',
		label: 'Tasks',
		icon: ListTodo,
		type: 'paperlesstask' as const,
	},
]

function NavLinks({
	pathname,
	onNavigate,
	permissions,
	isSuperuser,
}: {
	pathname: string
	onNavigate?: () => void
	permissions?: string[]
	isSuperuser?: boolean
}) {
	return (
		<nav className="flex flex-col gap-0.5 px-2" aria-label="Primary">
			{NAV.map((item) => {
				const allowed =
					isSuperuser ||
					can(
						{ id: 0, is_superuser: isSuperuser },
						permissions,
						'view',
						item.type
					)
				if (!allowed) return null
				const active =
					pathname === item.href || pathname.startsWith(`${item.href}/`)
				const Icon = item.icon
				return (
					<Link
						key={item.href}
						href={item.href}
						onClick={onNavigate}
						className={cn(
							'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors',
							active
								? 'bg-sidebar-accent text-sidebar-accent-foreground'
								: 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground'
						)}
					>
						<Icon className="size-4" aria-hidden />
						{item.label}
					</Link>
				)
			})}
		</nav>
	)
}

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const router = useRouter()
	const [mobileOpen, setMobileOpen] = useState(false)
	const [commandOpen, setCommandOpen] = useState(false)
	const ui = useUiSettings()
	const views = useSavedViews()
	const user = ui.data?.user
	const title =
		(ui.data?.settings.app_title as string | undefined) || 'Paperless'

	useHotkeys(
		useMemo(
			() => ({
				'mod+k': () => setCommandOpen(true),
				'mod+/': () => {
					const input = document.querySelector<HTMLInputElement>(
						'[data-global-search]'
					)
					input?.focus()
				},
				'g+d': () => router.push('/documents'),
				'g+i': () => router.push('/inbox'),
				'g+s': () => router.push('/settings'),
			}),
			[router]
		)
	)

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' })
		toast.success('Signed out')
		// Hard navigation clears React Query cache after the httpOnly cookie is removed.
		// eslint-disable-next-line @next/next/no-location-assign-relative-destination
		window.location.assign('/login')
	}

	const sidebar = (
		<div className="flex h-full flex-col">
			<div className="px-4 py-5">
				<Link href="/documents" className="block">
					<p className="font-heading text-2xl italic tracking-tight">
						{title}
					</p>
					<p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-copper">
						Archive
					</p>
				</Link>
			</div>
			<NavLinks
				pathname={pathname}
				permissions={ui.data?.permissions}
				isSuperuser={user?.is_superuser}
				onNavigate={() => setMobileOpen(false)}
			/>
			{views.data?.results?.filter((view) => view.show_in_sidebar).length ? (
				<>
					<Separator className="my-3" />
					<p className="px-4 pb-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Saved views
					</p>
					<nav className="flex flex-col gap-0.5 px-2" aria-label="Saved views">
						{views.data.results
							.filter((view) => view.show_in_sidebar)
							.map((view) => (
								<Link
									key={view.id}
									href={`/documents?view=${view.id}`}
									onClick={() => setMobileOpen(false)}
									className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
								>
									{view.name}
								</Link>
							))}
					</nav>
				</>
			) : null}
			<div className="mt-auto p-3">
				<Link
					href="/settings"
					className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
				>
					<Settings className="size-4" />
					Settings
				</Link>
				{can(user, ui.data?.permissions, 'view', 'user') ? (
					<Link
						href="/admin/users"
						className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
					>
						<Users className="size-4" />
						Users
					</Link>
				) : null}
			</div>
		</div>
	)

	return (
		<UploadDropzone>
			<div className="flex min-h-svh">
				<aside className="sticky top-0 hidden h-svh w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
					{sidebar}
				</aside>
				<div className="flex min-w-0 flex-1 flex-col">
					<header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/80 px-3 py-2 backdrop-blur md:px-5">
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setMobileOpen(true)}
							aria-label="Open navigation"
						>
							<Menu className="size-4" />
						</Button>
						<GlobalSearch />
						<div className="ml-auto flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setCommandOpen(true)}
								aria-label="Command palette"
							>
								<Search className="size-4" />
							</Button>
							<TaskIndicator />
							<ThemeToggle />
							<UserMenu
								name={displayName(
									user?.first_name,
									user?.last_name,
									user?.username
								)}
								username={user?.username}
								onLogout={logout}
							/>
						</div>
					</header>
					<main className="flex-1 px-3 py-4 md:px-6 md:py-6">{children}</main>
				</div>
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetContent side="left" className="w-72 bg-sidebar p-0">
						<SheetTitle className="sr-only">Navigation</SheetTitle>
						{sidebar}
					</SheetContent>
				</Sheet>
				<CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
			</div>
		</UploadDropzone>
	)
}
