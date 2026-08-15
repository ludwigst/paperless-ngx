"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

import { Input } from "@/components/ui/input"

export function GlobalSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("q") ?? "")
  const [, startTransition] = useTransition()

  return (
    <form
      className="relative min-w-0 flex-1 max-w-xl"
      onSubmit={(event) => {
        event.preventDefault()
        startTransition(() => {
          const next = new URLSearchParams(searchParams.toString())
          if (value) next.set("q", value)
          else next.delete("q")
          next.delete("page")
          router.push(`/documents?${next.toString()}`)
        })
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        data-global-search
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search the archive"
        aria-label="Search documents"
        className="h-9 bg-card pl-9"
      />
    </form>
  )
}
