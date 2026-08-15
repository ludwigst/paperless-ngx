"use client"

import { useQuery } from "@tanstack/react-query"

import {
  listCorrespondents,
  listCustomFields,
  listDocumentTypes,
  listSavedViews,
  listStoragePaths,
  listTags,
} from "@/lib/api/metadata"
import { queryKeys } from "@/lib/query"

export function useTags() {
  return useQuery({ queryKey: queryKeys.tags, queryFn: listTags })
}

export function useCorrespondents() {
  return useQuery({ queryKey: queryKeys.correspondents, queryFn: listCorrespondents })
}

export function useDocumentTypes() {
  return useQuery({ queryKey: queryKeys.documentTypes, queryFn: listDocumentTypes })
}

export function useStoragePaths() {
  return useQuery({ queryKey: queryKeys.storagePaths, queryFn: listStoragePaths })
}

export function useCustomFields() {
  return useQuery({ queryKey: queryKeys.customFields, queryFn: listCustomFields })
}

export function useSavedViews() {
  return useQuery({ queryKey: queryKeys.savedViews, queryFn: listSavedViews })
}

export function lookupName<T extends { id: number; name?: string }>(
  items: T[] | undefined,
  id?: number | null,
) {
  if (!id) return undefined
  return items?.find((item) => item.id === id)?.name
}
