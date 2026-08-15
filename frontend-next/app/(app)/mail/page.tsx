import { Suspense } from 'react'

import { MailPage } from '@/components/mail/mail-page'
import { Skeleton } from '@/components/ui/skeleton'

export default function MailSettingsPage() {
	return (
		<Suspense fallback={<Skeleton className="h-64 w-full" />}>
			<MailPage />
		</Suspense>
	)
}
