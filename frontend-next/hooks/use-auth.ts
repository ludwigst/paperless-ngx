"use client"

import { useQuery } from "@tanstack/react-query"

import { getUiSettings } from "@/lib/api/system"
import { can, type PermissionAction, type PermissionType } from "@/lib/auth/permissions"
import { queryKeys } from "@/lib/query"

export function useUiSettings() {
  return useQuery({
    queryKey: queryKeys.uiSettings,
    queryFn: getUiSettings,
  })
}

export function usePermission(action: PermissionAction, type: PermissionType) {
  const { data } = useUiSettings()
  return can(data?.user, data?.permissions, action, type)
}
