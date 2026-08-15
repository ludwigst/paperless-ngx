"use client"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-3">
      <h1 className="font-heading text-3xl italic">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button type="button" className="text-sm underline" onClick={reset}>
        Try again
      </button>
    </div>
  )
}
