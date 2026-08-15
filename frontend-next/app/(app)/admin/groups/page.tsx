"use client"

import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listGroups } from "@/lib/api/system"
import { queryKeys } from "@/lib/query"

export default function GroupsPage() {
  const groups = useQuery({ queryKey: queryKeys.groups, queryFn: listGroups })

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-copper">Administration</p>
        <h1 className="font-heading text-4xl italic">Groups</h1>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {groups.data?.results.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {group.permissions?.length ?? 0} permissions
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
