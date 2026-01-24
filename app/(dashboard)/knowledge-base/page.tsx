export default function KnowledgeBasePage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-primary/85 text-primary-foreground rounded-md px-4 py-3 flex-shrink-0 w-full mb-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Knowledge Base</h1>
            <p className="text-xs text-white/90 mt-0.5">Company documentation, guides, and resources</p>
          </div>
        </div>
      </div>
      <div className="rounded-[14px] border border-border bg-white p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-base font-medium text-muted-foreground mb-2">Coming Soon</p>
          <p className="text-sm text-muted-foreground">Company documentation, guides, and resources will be available here.</p>
        </div>
      </div>
    </div>
  )
}

