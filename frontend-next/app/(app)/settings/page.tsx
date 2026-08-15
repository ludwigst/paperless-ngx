"use client"

import { useQuery } from "@tanstack/react-query"
import { useTheme } from "next-themes"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUiSettings } from "@/lib/api/system"
import { queryKeys } from "@/lib/query"
import { displayName } from "@/lib/utils/search-params"

export default function SettingsPage() {
  const { data } = useQuery({ queryKey: queryKeys.uiSettings, queryFn: getUiSettings })
  const { theme, setTheme } = useTheme()
  const user = data?.user

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-copper">Preferences</p>
        <h1 className="font-heading text-4xl italic">Settings</h1>
      </div>
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Identity comes from the Paperless Django user, not this frontend.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {displayName(user?.first_name, user?.last_name, user?.username)}</p>
              <p><span className="text-muted-foreground">Username:</span> {user?.username}</p>
              <p><span className="text-muted-foreground">Staff:</span> {user?.is_staff ? "Yes" : "No"}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Theme is stored on this device.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Label htmlFor="dark">Dark theme</Label>
              <Switch
                id="dark"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Processing, OCR, and consumption remain Django/Celery responsibilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Drop files anywhere in the app or use Upload on the documents page. Newly consumed documents appear after the backend finishes OCR.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
