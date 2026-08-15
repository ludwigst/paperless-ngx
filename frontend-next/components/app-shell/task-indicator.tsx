"use client"

import { useQuery } from "@tanstack/react-query"
import { Activity } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { listTasks } from "@/lib/api/system"
import { queryKeys } from "@/lib/query"
import { PaperlessTaskStatus } from "@/types/paperless"

export function TaskIndicator() {
  const tasks = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => listTasks({ page_size: 20 }),
    refetchInterval: 8_000,
  })

  const active = tasks.data?.results.filter((task) =>
    [PaperlessTaskStatus.Pending, PaperlessTaskStatus.Started, "PENDING", "STARTED"].includes(
      task.status,
    ),
  ).length

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/tasks" aria-label="Processing tasks">
        <span className="relative">
          <Activity className="size-4" />
          {active ? (
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-copper px-1 text-[10px] leading-4 text-primary-foreground">
              {active}
            </span>
          ) : null}
        </span>
      </Link>
    </Button>
  )
}
