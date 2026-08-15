import { Suspense } from "react"

import { AppShell } from "@/components/app-shell/app-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="h-svh w-full" />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  )
}
