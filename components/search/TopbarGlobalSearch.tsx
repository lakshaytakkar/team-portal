"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, CheckSquare, Users, Folder, FileText, Clock, History, Briefcase, Phone, UserCheck } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useUserContext } from "@/lib/providers/UserContextProvider"
import { buildSidebarConfig } from "@/lib/utils/sidebar-config"
import { getPagesByCategory, searchPages, CATEGORY_LABELS } from "@/lib/utils/sidebar-context"
import { 
  searchEmployees, 
  searchTasks, 
  searchProjects,
  searchDeals,
  searchCalls,
  searchCandidates,
  type SearchEmployeeResult, 
  type SearchTaskResult,
  type SearchProjectResult,
  type SearchDealResult,
  type SearchCallResult,
  type SearchCandidateResult
} from "@/lib/actions/search"
import { getAvatarForUser } from "@/lib/utils/avatars"
import { cn } from "@/lib/utils"

const RECENT_SEARCHES_KEY = "topbar-search-recents"
const MAX_RECENT_SEARCHES = 5

type SearchCategory = "all" | "tasks" | "people" | "pages" | "projects" | "deals" | "calls" | "candidates"

interface SearchPageResult {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}


export function TopbarGlobalSearch() {
  const router = useRouter()
  const { user } = useUserContext()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<SearchCategory>("all")
  const [isSearching, setIsSearching] = React.useState(false)
  const [employeeResults, setEmployeeResults] = React.useState<SearchEmployeeResult[]>([])
  const [taskResults, setTaskResults] = React.useState<SearchTaskResult[]>([])
  const [projectResults, setProjectResults] = React.useState<SearchProjectResult[]>([])
  const [dealResults, setDealResults] = React.useState<SearchDealResult[]>([])
  const [callResults, setCallResults] = React.useState<SearchCallResult[]>([])
  const [candidateResults, setCandidateResults] = React.useState<SearchCandidateResult[]>([])
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)


  // Only show for superadmin
  if (!user?.isSuperadmin) {
    return null
  }

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error)
    }
  }, [])

  // Get pages from sidebar config
  const pages = React.useMemo(() => {
    if (!user) return []
    return buildSidebarConfig(user)
  }, [user])

  // Filter pages locally - use searchPages utility when query exists
  const pageResults = React.useMemo<SearchPageResult[]>(() => {
    if (!query.trim()) return []
    return searchPages(user, query)
      .slice(0, 10)
      .map((page) => ({
        label: page.label,
        href: page.href,
        icon: page.icon,
        description: page.description,
      }))
  }, [user, query])

  // Debounced server search
  React.useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setEmployeeResults([])
      setTaskResults([])
      setProjectResults([])
      setDealResults([])
      setCallResults([])
      setCandidateResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      try {
        const [employees, tasks, projects, deals, calls, candidates] = await Promise.all([
          searchEmployees(query),
          searchTasks(query),
          searchProjects(query),
          searchDeals(query),
          searchCalls(query),
          searchCandidates(query),
        ])
        setEmployeeResults(employees)
        setTaskResults(tasks)
        setProjectResults(projects)
        setDealResults(deals)
        setCallResults(calls)
        setCandidateResults(candidates)
      } catch (error) {
        console.error("Search error:", error)
        setEmployeeResults([])
        setTaskResults([])
        setProjectResults([])
        setDealResults([])
        setCallResults([])
        setCandidateResults([])
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Focus input when popover opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Handle keyboard shortcut (Ctrl+K / Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, MAX_RECENT_SEARCHES)
    setRecentSearches(updated)
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to save recent search:", error)
    }
  }

  const handleSelect = (href: string, searchQuery?: string) => {
    if (searchQuery) {
      saveRecentSearch(searchQuery)
    }
    router.push(href)
    setOpen(false)
    setQuery("")
  }

  const handleQuickJump = (href: string) => {
    router.push(href)
    setOpen(false)
    setQuery("")
  }

  // Quick jump items
  const quickJumps = [
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Projects", href: "/projects", icon: Folder },
    { label: "HR Employees", href: "/hr/employees", icon: Users },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Permissions", href: "/admin/permissions", icon: FileText },
  ]

  // Determine what to show based on category and query
  const showAll = selectedCategory === "all"
  const hasQuery = query.trim().length >= 2
  const showPages = (showAll || selectedCategory === "pages") && hasQuery && pageResults.length > 0
  const showPeople = (showAll || selectedCategory === "people") && hasQuery && employeeResults.length > 0
  const showTasks = (showAll || selectedCategory === "tasks") && hasQuery && taskResults.length > 0
  const showProjects = (showAll || selectedCategory === "projects") && hasQuery && projectResults.length > 0
  const showDeals = (showAll || selectedCategory === "deals") && hasQuery && dealResults.length > 0
  const showCalls = (showAll || selectedCategory === "calls") && hasQuery && callResults.length > 0
  const showCandidates = (showAll || selectedCategory === "candidates") && hasQuery && candidateResults.length > 0
  const showQuickJumps = !hasQuery
  const showRecents = !hasQuery && recentSearches.length > 0
  const hasResults = showPages || showPeople || showTasks || showProjects || showDeals || showCalls || showCandidates

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center gap-2 px-3 py-1.5 h-9 w-64 rounded-[10px] border border-border bg-background hover:bg-muted/50 transition-colors text-left"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground font-medium flex-1">
            Search here...
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[600px] p-0 rounded-[14px] border border-border shadow-lg"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-5 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-[38px] rounded-[10px] border border-border text-sm font-medium tracking-[0.28px]"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-5 pt-4 pb-3 border-b border-border">
            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as SearchCategory)}>
              <TabsList className="h-10 bg-muted p-0.5 rounded-lg">
                <TabsTrigger
                  value="all"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "all" && "bg-white shadow-sm"
                  )}
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "tasks" && "bg-white shadow-sm"
                  )}
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="people"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "people" && "bg-white shadow-sm"
                  )}
                >
                  People
                </TabsTrigger>
                <TabsTrigger
                  value="pages"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "pages" && "bg-white shadow-sm"
                  )}
                >
                  Pages
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "projects" && "bg-white shadow-sm"
                  )}
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="deals"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "deals" && "bg-white shadow-sm"
                  )}
                >
                  Deals
                </TabsTrigger>
                <TabsTrigger
                  value="calls"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "calls" && "bg-white shadow-sm"
                  )}
                >
                  Calls
                </TabsTrigger>
                <TabsTrigger
                  value="candidates"
                  className={cn(
                    "h-9 px-4 text-sm font-medium leading-4 tracking-[0.28px] rounded-md",
                    selectedCategory === "candidates" && "bg-white shadow-sm"
                  )}
                >
                  Candidates
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Results Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {isSearching && hasQuery && (
              <div className="p-8 text-center text-sm font-medium tracking-[0.28px] text-muted-foreground">
                Searching...
              </div>
            )}

            {!isSearching && hasQuery && !hasResults && (
              <div className="p-8 text-center text-sm font-medium tracking-[0.28px] text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {!isSearching && (
              <>
                {/* Quick Jumps */}
                {showQuickJumps && (
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      Quick Jumps
                    </h3>
                    <div className="space-y-1.5">
                      {quickJumps.map((jump) => {
                        const Icon = jump.icon
                        return (
                          <button
                            key={jump.href}
                            onClick={() => handleQuickJump(jump.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium tracking-[0.28px] text-foreground">{jump.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {showRecents && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Recent Searches
                    </h3>
                    <div className="space-y-1.5">
                      {recentSearches.map((recent, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(recent)
                            saveRecentSearch(recent)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium tracking-[0.28px] text-foreground">{recent}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pages Results */}
                {showPages && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      {hasQuery ? "Pages" : `${CATEGORY_LABELS[selectedCategory] || selectedCategory} Pages`}
                    </h3>
                    <div className="space-y-1.5">
                      {pageResults.map((page) => {
                        const Icon = page.icon
                        return (
                          <button
                            key={page.href}
                            onClick={() => handleSelect(page.href, query)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="text-sm font-medium tracking-[0.28px] text-foreground">{page.label}</div>
                              {page.description && (
                                <div className="text-sm leading-5 tracking-[0.28px] text-muted-foreground mt-0.5">{page.description}</div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* People Results */}
                {showPeople && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      People
                    </h3>
                    <div className="space-y-1.5">
                      {employeeResults.map((employee) => (
                        <button
                          key={employee.id}
                          onClick={() => handleSelect(`/hr/employees/${employee.id}`, query)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.avatar || getAvatarForUser(employee.name)} />
                            <AvatarFallback className="text-xs">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium tracking-[0.28px] text-foreground truncate">
                              {employee.name}
                            </div>
                            <div className="text-sm leading-5 tracking-[0.28px] text-muted-foreground truncate mt-0.5">
                              {employee.email}
                            </div>
                          </div>
                          {employee.department && (
                            <Badge variant="outline" className="text-xs font-medium">
                              {employee.department}
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks Results */}
                {showTasks && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      Tasks
                    </h3>
                    <div className="space-y-1.5">
                      {taskResults.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => handleSelect(`/tasks?q=${encodeURIComponent(query)}`, query)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <CheckSquare className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium tracking-[0.28px] text-foreground truncate">
                              {task.name}
                            </div>
                            {task.description && (
                              <div className="text-sm leading-5 tracking-[0.28px] text-muted-foreground truncate mt-0.5">
                                {task.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant={
                                task.status === "completed"
                                  ? "completed"
                                  : task.status === "in-progress"
                                  ? "in-progress"
                                  : task.status === "in-review"
                                  ? "on-hold"
                                  : task.status === "blocked"
                                  ? "on-hold"
                                  : "not-started"
                              }
                              className="text-xs"
                            >
                              {task.status === "not-started" ? "Not Started" :
                               task.status === "in-progress" ? "In Progress" :
                               task.status === "in-review" ? "In Review" :
                               task.status === "completed" ? "Completed" :
                               task.status === "blocked" ? "Blocked" :
                               task.status}
                            </Badge>
                            <Badge
                              variant={
                                task.priority === "urgent" || task.priority === "high"
                                  ? "priority-high"
                                  : task.priority === "medium"
                                  ? "priority-medium"
                                  : "priority-low"
                              }
                              className="text-xs"
                            >
                              {task.priority === "urgent" ? "Urgent" :
                               task.priority === "high" ? "High" :
                               task.priority === "medium" ? "Medium" :
                               task.priority === "low" ? "Low" :
                               task.priority}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Results */}
                {showProjects && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      Projects
                    </h3>
                    <div className="space-y-1.5">
                      {projectResults.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleSelect(`/projects/${project.id}`, query)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium tracking-[0.28px] text-foreground truncate">
                              {project.name}
                            </div>
                            {project.description && (
                              <div className="text-sm leading-5 tracking-[0.28px] text-muted-foreground truncate mt-0.5">
                                {project.description}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={
                              project.status === "completed"
                                ? "completed"
                                : project.status === "active"
                                ? "in-progress"
                                : project.status === "planning"
                                ? "not-started"
                                : "on-hold"
                            }
                            className="text-xs"
                          >
                            {project.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deals Results */}
                {showDeals && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      Deals
                    </h3>
                    <div className="space-y-1.5">
                      {dealResults.map((deal) => (
                        <button
                          key={deal.id}
                          onClick={() => handleSelect(`/sales/deals?q=${encodeURIComponent(query)}`, query)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium tracking-[0.28px] text-foreground truncate">
                              {deal.name}
                            </div>
                            <div className="text-sm leading-5 tracking-[0.28px] text-muted-foreground truncate mt-0.5">
                              {deal.company} {deal.contactName && `• ${deal.contactName}`}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {deal.stage}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calls Results */}
                {showCalls && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      Calls
                    </h3>
                    <div className="space-y-1.5">
                      {callResults.map((call) => (
                        <button
                          key={call.id}
                          onClick={() => handleSelect(`/my-calls?q=${encodeURIComponent(query)}`, query)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium tracking-[0.28px] text-foreground truncate">
                              {call.contactName}
                            </div>
                            {call.company && (
                              <div className="text-sm leading-5 tracking-[0.28px] text-muted-foreground truncate mt-0.5">
                                {call.company}
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {call.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidates Results */}
                {showCandidates && (
                  <div className="p-5 border-t border-border">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-[0.28px] mb-4">
                      Candidates
                    </h3>
                    <div className="space-y-1.5">
                      {candidateResults.map((candidate) => (
                        <button
                          key={candidate.id}
                          onClick={() => handleSelect(`/recruitment/candidates/${candidate.id}`, query)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                        >
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium tracking-[0.28px] text-foreground truncate">
                              {candidate.fullName}
                            </div>
                            <div className="text-sm leading-5 tracking-[0.28px] text-muted-foreground truncate mt-0.5">
                              {candidate.email}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {candidate.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

