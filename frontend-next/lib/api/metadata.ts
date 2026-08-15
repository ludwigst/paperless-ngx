import { apiFetch, toQuery } from "@/lib/api/client"
import type {
  Correspondent,
  CustomField,
  DocumentType,
  Paginated,
  SavedView,
  StoragePath,
  Tag,
} from "@/types/paperless"

function listResource<T>(resource: string, extra: Record<string, string | number | boolean> = {}) {
  return apiFetch<Paginated<T>>(
    `/api/paperless/${resource}/${toQuery({ page: 1, page_size: 1000, ordering: "name", ...extra })}`,
  )
}

export const listTags = () => listResource<Tag>("tags")
export const listCorrespondents = () => listResource<Correspondent>("correspondents")
export const listDocumentTypes = () => listResource<DocumentType>("document_types")
export const listStoragePaths = () => listResource<StoragePath>("storage_paths")
export const listCustomFields = () => listResource<CustomField>("custom_fields")
export const listSavedViews = () => listResource<SavedView>("saved_views")

export function createNamed<T>(resource: string, payload: unknown) {
  return apiFetch<T>(`/api/paperless/${resource}/`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateNamed<T>(resource: string, id: number, payload: unknown) {
  return apiFetch<T>(`/api/paperless/${resource}/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteNamed(resource: string, id: number) {
  return apiFetch<void>(`/api/paperless/${resource}/${id}/`, { method: "DELETE" })
}
