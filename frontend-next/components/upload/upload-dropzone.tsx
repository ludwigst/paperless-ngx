"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

import { uploadDocument } from "@/lib/api/documents"
import { queryKeys } from "@/lib/query"
import { cn } from "@/lib/utils"

export function UploadDropzone({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  const dragCount = useRef(0)
  const queryClient = useQueryClient()

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files)
      if (!list.length) return
      toast.message(`Uploading ${list.length} file${list.length === 1 ? "" : "s"}`)
      await Promise.all(
        list.map(async (file) => {
          try {
            await uploadDocument(file)
            toast.success(`${file.name} queued for processing`)
          } catch (error) {
            toast.error(error instanceof Error ? error.message : `Could not upload ${file.name}`)
          }
        }),
      )
      await queryClient.invalidateQueries({ queryKey: ["documents"] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks })
    },
    [queryClient],
  )

  return (
    <div
      className="relative min-h-svh"
      onDragEnter={(event) => {
        event.preventDefault()
        dragCount.current += 1
        setActive(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault()
        dragCount.current -= 1
        if (dragCount.current <= 0) {
          dragCount.current = 0
          setActive(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        dragCount.current = 0
        setActive(false)
        void uploadFiles(event.dataTransfer.files)
      }}
    >
      {children}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!active}
      >
        <div className="rounded-2xl border border-dashed border-copper bg-card px-10 py-8 text-center shadow-xl">
          <p className="font-heading text-3xl italic">Drop to archive</p>
          <p className="mt-2 text-sm text-muted-foreground">Files are sent to Paperless for OCR and indexing.</p>
        </div>
      </div>
    </div>
  )
}
