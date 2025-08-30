export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-heading mb-2">Your DOTS Dashboard</h1>
      <p className="text-muted-foreground">Browse new drops, manage your wishlist, and track orders.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">Recent Picks (placeholder)</div>
        <div className="rounded-lg border p-4">Orders (placeholder)</div>
      </div>
    </div>
  );
}
