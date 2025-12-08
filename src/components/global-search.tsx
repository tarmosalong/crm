"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User, 
  Building2, 
  Handshake, 
  CheckSquare, 
  Loader2,
  ArrowRight,
  Clock,
  Sparkles,
  LayoutDashboard,
  Calendar,
  FileText,
  Settings,
  X,
  Command,
} from "lucide-react";
import { globalSearch, SearchResult } from "@/actions/search";
import { useDebounce } from "@/hooks/use-debounce";

const ICONS = {
  contact: User,
  company: Building2,
  deal: Handshake,
  task: CheckSquare,
};

const COLORS = {
  contact: "text-sky-400 bg-sky-500/10",
  company: "text-emerald-400 bg-emerald-500/10",
  deal: "text-violet-400 bg-violet-500/10",
  task: "text-amber-400 bg-amber-500/10",
};

const TYPE_LABELS = {
  contact: "Contact",
  company: "Company",
  deal: "Deal",
  task: "Task",
};

const QUICK_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-indigo-400" },
  { label: "Contacts", href: "/contacts", icon: User, color: "text-sky-400" },
  { label: "Companies", href: "/companies", icon: Building2, color: "text-emerald-400" },
  { label: "Deals", href: "/deals", icon: Handshake, color: "text-violet-400" },
  { label: "Tasks", href: "/tasks", icon: CheckSquare, color: "text-amber-400" },
  { label: "Calendar", href: "/calendar", icon: Calendar, color: "text-rose-400" },
  { label: "Reports", href: "/reports", icon: FileText, color: "text-cyan-400" },
  { label: "Settings", href: "/settings", icon: Settings, color: "text-slate-400" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const router = useRouter();
  
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search
  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await globalSearch(q);
      setResults(data);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  // Save to recent searches
  const saveToRecent = (result: SearchResult) => {
    const updated = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSelect = (result: SearchResult) => {
    saveToRecent(result);
    setOpen(false);
    setQuery("");
    router.push(result.href);
  };

  const handleQuickLink = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = results.length > 0 ? results : (query.length < 2 ? QUICK_LINKS : []);
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && items.length > 0) {
        e.preventDefault();
        if (results.length > 0) {
          handleSelect(results[selectedIndex]);
        } else if (query.length < 2) {
          handleQuickLink(QUICK_LINKS[selectedIndex].href);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex, query]);

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Flatten for index tracking
  const flatResults = Object.values(groupedResults).flat();

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-slate-400 border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all group"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2 group-hover:text-indigo-400 transition-colors" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-500">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 bg-slate-900 border-slate-700 overflow-hidden">
          <DialogTitle className="sr-only">Search</DialogTitle>
          
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-slate-500" />
            )}
            <Input
              placeholder="Search contacts, companies, deals, tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-500 hover:text-white"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  <span className="text-sm text-slate-500">Searching...</span>
                </div>
              </div>
            )}

            {/* No results */}
            {!isLoading && query.length >= 2 && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium">No results found</p>
                <p className="text-slate-600 text-sm mt-1">Try a different search term</p>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && results.length > 0 && (
              <div className="py-2">
                {Object.entries(groupedResults).map(([type, items]) => {
                  const Icon = ICONS[type as keyof typeof ICONS];
                  const colorClass = COLORS[type as keyof typeof COLORS];

                  return (
                    <div key={type} className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}s
                      </div>
                      {items.map((result) => {
                        const globalIndex = flatResults.findIndex(r => r.id === result.id && r.type === result.type);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleSelect(result)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected ? "bg-indigo-500/10" : "hover:bg-slate-800/50"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="border-slate-700 text-slate-500 text-xs shrink-0">
                              {TYPE_LABELS[type as keyof typeof TYPE_LABELS]}
                            </Badge>
                            {isSelected && (
                              <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Default state - Quick Links & Recent */}
            {!isLoading && query.length < 2 && (
              <div className="py-2">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between px-4 py-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Recent
                      </span>
                      <button
                        onClick={clearRecent}
                        className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((result) => {
                      const Icon = ICONS[result.type];
                      const colorClass = COLORS[result.type];

                      return (
                        <button
                          key={`recent-${result.type}-${result.id}`}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-800/50 transition-colors"
                        >
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${colorClass}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 text-sm text-slate-300 truncate">{result.title}</span>
                          <span className="text-xs text-slate-600">{TYPE_LABELS[result.type]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Quick Links */}
                <div>
                  <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Quick Navigation
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-2">
                    {QUICK_LINKS.map((link, index) => {
                      const isSelected = selectedIndex === index && query.length < 2;

                      return (
                        <button
                          key={link.href}
                          onClick={() => handleQuickLink(link.href)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                            isSelected ? "bg-indigo-500/10 ring-1 ring-indigo-500/30" : "hover:bg-slate-800/50"
                          }`}
                        >
                          <link.icon className={`h-4 w-4 ${link.color}`} />
                          <span className="text-sm text-slate-300">{link.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">esc</kbd>
                close
              </span>
            </div>
            <span className="text-xs text-slate-600">
              {results.length > 0 && `${results.length} results`}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
