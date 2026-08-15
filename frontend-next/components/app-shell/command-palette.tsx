"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const ROUTES = [
  { href: "/documents", label: "Documents" },
  { href: "/inbox", label: "Inbox" },
  { href: "/tags", label: "Tags" },
  { href: "/correspondents", label: "Correspondents" },
  { href: "/document-types", label: "Document types" },
  { href: "/storage-paths", label: "Storage paths" },
  { href: "/custom-fields", label: "Custom fields" },
  { href: "/workflows", label: "Workflows" },
  { href: "/tasks", label: "Tasks" },
  { href: "/settings", label: "Settings" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/groups", label: "Groups" },
]

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { setTheme } = useTheme()

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to a page or action…" />
      <CommandList>
        <CommandEmpty>No matching command.</CommandEmpty>
        <CommandGroup heading="Go to">
          {ROUTES.map((route) => (
            <CommandItem
              key={route.href}
              value={route.label}
              onSelect={() => {
                router.push(route.href)
                onOpenChange(false)
              }}
            >
              {route.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Appearance">
          <CommandItem onSelect={() => setTheme("light")}>Light theme</CommandItem>
          <CommandItem onSelect={() => setTheme("dark")}>Dark theme</CommandItem>
          <CommandItem onSelect={() => setTheme("system")}>System theme</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
