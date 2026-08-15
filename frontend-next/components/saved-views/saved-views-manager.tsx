'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { usePermission, useUiSettings } from '@/hooks/use-auth'
import { useSavedViews } from '@/hooks/use-metadata'
import { deleteSavedView } from '@/lib/api/metadata'
import { saveUiSettings } from '@/lib/api/system'
import { queryKeys } from '@/lib/query'
import {
	patchSavedViewVisibility,
	savedViewVisibility,
	toggleId,
} from '@/lib/utils/saved-views'

export function SavedViewsManager() {
	const canView = usePermission('view', 'savedview')
	const canChange = usePermission('change', 'uisettings')
	const canDelete = usePermission('delete', 'savedview')
	const views = useSavedViews()
	const ui = useUiSettings()
	const queryClient = useQueryClient()

	const updateVisibility = useMutation({
		mutationFn: async (patch: {
			sidebarIds?: number[]
			dashboardIds?: number[]
		}) => {
			const current = ui.data?.settings ?? {}
			return saveUiSettings(patchSavedViewVisibility(current, patch))
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.uiSettings })
			await queryClient.invalidateQueries({ queryKey: queryKeys.savedViews })
		},
		onError: (error) => toast.error(error.message),
	})

	const remove = useMutation({
		mutationFn: (id: number) => deleteSavedView(id),
		onSuccess: async (_, id) => {
			const visibility = savedViewVisibility(ui.data?.settings)
			await saveUiSettings(
				patchSavedViewVisibility(ui.data?.settings ?? {}, {
					sidebarIds: toggleId(visibility.sidebarIds, id, false),
					dashboardIds: toggleId(visibility.dashboardIds, id, false),
				})
			)
			toast.success('Saved view deleted')
			await queryClient.invalidateQueries({ queryKey: queryKeys.savedViews })
			await queryClient.invalidateQueries({ queryKey: queryKeys.uiSettings })
		},
		onError: (error) => toast.error(error.message),
	})

	if (ui.isLoading || views.isLoading) {
		return (
			<div className="space-y-2">
				<h1 className="font-heading text-4xl italic">Saved views</h1>
				<p className="text-sm text-muted-foreground">Loading…</p>
			</div>
		)
	}

	if (!canView) {
		return (
			<div className="space-y-2">
				<h1 className="font-heading text-4xl italic">Saved views</h1>
				<p className="text-sm text-muted-foreground">
					You do not have permission to view saved views.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div>
				<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
					Shortcuts
				</p>
				<h1 className="font-heading text-4xl italic tracking-tight">
					Saved views
				</h1>
				<p className="mt-1 max-w-2xl text-sm text-muted-foreground">
					Visibility lives in your UI settings, not on the view itself. Open a
					view to edit its filters.
				</p>
			</div>

			<div className="overflow-hidden rounded-xl border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Sidebar</TableHead>
							<TableHead>Dashboard</TableHead>
							<TableHead className="w-24" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{views.results.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className="py-16 text-center text-muted-foreground"
								>
									No saved views yet. Filter documents, then use Save as.
								</TableCell>
							</TableRow>
						) : null}
						{views.results.map((view) => (
							<TableRow key={view.id}>
								<TableCell>
									<Link
										href={`/view/${view.id}`}
										className="font-medium hover:underline"
									>
										{view.name}
									</Link>
								</TableCell>
								<TableCell>
									<Switch
										checked={Boolean(view.show_in_sidebar)}
										disabled={!canChange || updateVisibility.isPending}
										onCheckedChange={(checked) => {
											const visibility = savedViewVisibility(ui.data?.settings)
											updateVisibility.mutate({
												sidebarIds: toggleId(
													visibility.sidebarIds,
													view.id,
													checked
												),
											})
										}}
										aria-label={`Show ${view.name} in sidebar`}
									/>
								</TableCell>
								<TableCell>
									<Switch
										checked={Boolean(view.show_on_dashboard)}
										disabled={!canChange || updateVisibility.isPending}
										onCheckedChange={(checked) => {
											const visibility = savedViewVisibility(ui.data?.settings)
											updateVisibility.mutate({
												dashboardIds: toggleId(
													visibility.dashboardIds,
													view.id,
													checked
												),
											})
										}}
										aria-label={`Show ${view.name} on dashboard`}
									/>
								</TableCell>
								<TableCell>
									{canDelete ? (
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													aria-label="Delete"
												>
													<Trash2 className="size-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Delete this view?
													</AlertDialogTitle>
													<AlertDialogDescription>
														“{view.name}” will be removed. Documents are not
														affected.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => remove.mutate(view.id)}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									) : null}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
