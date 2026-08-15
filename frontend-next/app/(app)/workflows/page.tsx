'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { listWorkflows, patchWorkflow } from '@/lib/api/system'
import { queryKeys } from '@/lib/query'

const TRIGGER_LABELS: Record<number, string> = {
	1: 'Consumption',
	2: 'Document added',
	3: 'Document updated',
	4: 'Scheduled',
}

const ACTION_LABELS: Record<number, string> = {
	1: 'Assignment',
	2: 'Removal',
	3: 'Email',
	4: 'Webhook',
	5: 'Password removal',
	6: 'Move to trash',
}

export default function WorkflowsPage() {
	const queryClient = useQueryClient()
	const workflows = useQuery({
		queryKey: queryKeys.workflows,
		queryFn: listWorkflows,
	})
	const toggle = useMutation({
		mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
			patchWorkflow(id, { enabled }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.workflows })
		},
		onError: (error) => toast.error(error.message),
	})

	return (
		<div className="space-y-4">
			<div>
				<p className="text-[11px] uppercase tracking-[0.22em] text-copper">
					Automation
				</p>
				<h1 className="font-heading text-4xl italic">Workflows</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Triggers, conditions, and actions are stored and executed by Django.
				</p>
			</div>
			<div className="grid gap-3">
				{workflows.data?.results.map((workflow) => (
					<Card key={workflow.id}>
						<CardHeader className="flex-row items-center justify-between space-y-0">
							<CardTitle>{workflow.name}</CardTitle>
							<div className="flex items-center gap-2">
								<Switch
									checked={workflow.enabled}
									onCheckedChange={(enabled) =>
										toggle.mutate({ id: workflow.id, enabled })
									}
									aria-label={`Enable ${workflow.name}`}
								/>
							</div>
						</CardHeader>
						<CardContent className="flex flex-wrap gap-2">
							{workflow.triggers?.map((trigger, index) => (
								<Badge key={trigger.id ?? index} variant="secondary">
									{TRIGGER_LABELS[trigger.type] ?? `Trigger ${trigger.type}`}
								</Badge>
							))}
							{workflow.actions?.map((action, index) => (
								<Badge key={action.id ?? index}>
									{ACTION_LABELS[action.type] ?? `Action ${action.type}`}
								</Badge>
							))}
						</CardContent>
					</Card>
				))}
				{!workflows.data?.results.length ? (
					<p className="text-sm text-muted-foreground">No workflows yet.</p>
				) : null}
			</div>
		</div>
	)
}
