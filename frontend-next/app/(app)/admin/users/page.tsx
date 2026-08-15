"use client"

import { useQuery } from "@tanstack/react-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listUsers } from "@/lib/api/system"
import { queryKeys } from "@/lib/query"
import { displayName } from "@/lib/utils/search-params"

export default function UsersPage() {
  const users = useQuery({ queryKey: queryKeys.users, queryFn: listUsers })

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-copper">Administration</p>
        <h1 className="font-heading text-4xl italic">Users</h1>
        <p className="text-sm text-muted-foreground">Permissions are enforced by Django, not this UI.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {users.data?.results.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{displayName(user.first_name, user.last_name, user.username)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{user.username}</p>
              <p>{user.is_superuser ? "Superuser" : user.is_staff ? "Staff" : "User"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
