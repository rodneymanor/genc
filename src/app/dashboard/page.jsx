// This page has been consolidated into the new Create page (/create-script/idea)
// The UI elements from this page are now part of that page.
// This file can be deleted or repurposed (e.g., for a redirect or future distinct dashboard content).

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">
        Dashboard (Consolidated)
      </h1>
      <p className="text-muted-foreground">
        The main dashboard content has been moved to the Create page.
      </p>
      <p className="text-muted-foreground mt-2">
        Please navigate to <a href="/create-script/idea" className="text-primary hover:underline">/create-script/idea</a>.
      </p>
      {/* Consider implementing a redirect here if this route should no longer be directly accessible */}
    </div>
  );
} 