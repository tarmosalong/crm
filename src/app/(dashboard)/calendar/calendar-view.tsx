"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  User,
  Handshake,
  Plus,
  Loader2,
  CalendarDays,
  Calendar as CalendarIcon,
  LayoutGrid,
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
  startOfYear,
  eachMonthOfInterval,
  isPast,
  isWeekend,
} from "date-fns";
import { toggleTaskStatus, createTask } from "@/actions/tasks";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  contact: { id: string; name: string } | null;
  deal: { id: string; name: string } | null;
}

interface CalendarViewProps {
  tasks: Task[];
  contacts: { id: string; name: string }[];
  deals: { id: string; name: string }[];
}

type ViewType = "week" | "month" | "year";

const PRIORITY_COLORS = {
  HIGH: "bg-rose-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-slate-500",
};

const PRIORITY_BORDERS = {
  HIGH: "border-l-rose-500",
  MEDIUM: "border-l-amber-500",
  LOW: "border-l-slate-500",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function CalendarView({ tasks: initialTasks, contacts, deals }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("month");
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, formAction, isPending] = useActionState(createTask, {});

  useEffect(() => {
    if (formState.success) {
      toast.success("Task created!");
      setSelectedDate(null);
      formRef.current?.reset();
    }
    if (formState.error) {
      toast.error(formState.error);
    }
  }, [formState]);

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const getTasksForMonth = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
    });
  };

  const handleComplete = async (taskId: string) => {
    setIsCompleting(true);
    const result = await toggleTaskStatus(taskId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task updated!");
      setTasks(tasks.map((t) => 
        t.id === taskId ? { ...t, status: t.status === "OPEN" ? "DONE" : "OPEN" } : t
      ));
      setSelectedTask(null);
    }
    setIsCompleting(false);
  };

  const handleDayClick = (day: Date, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button[data-task]')) return;
    setSelectedDate(day);
  };

  const goToPrev = () => {
    switch (viewType) {
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(subYears(currentDate, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (viewType) {
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(addYears(currentDate, 1));
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getHeaderTitle = () => {
    switch (viewType) {
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "year":
        return format(currentDate, "yyyy");
    }
  };

  // Task item component for consistency
  const TaskItem = ({ task, compact = false }: { task: Task; compact?: boolean }) => {
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status === "OPEN";
    
    return (
      <button
        data-task
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTask(task);
        }}
        className={`w-full text-left transition-all border-l-2 ${PRIORITY_BORDERS[task.priority as keyof typeof PRIORITY_BORDERS]} ${
          task.status === "DONE"
            ? "bg-slate-800/50 text-slate-500"
            : isOverdue
            ? "bg-rose-950/30 text-rose-200 hover:bg-rose-950/50"
            : "bg-slate-800/80 text-slate-100 hover:bg-slate-700"
        } ${compact ? "px-1.5 py-0.5 rounded text-xs" : "px-2 py-1.5 rounded-md text-sm"}`}
      >
        <div className="flex items-center gap-1.5">
          {task.status === "DONE" ? (
            <CheckCircle2 className={`shrink-0 text-emerald-500 ${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
          ) : (
            <Circle className={`shrink-0 text-slate-500 ${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
          )}
          <span className={`truncate ${task.status === "DONE" ? "line-through" : ""}`}>
            {task.title}
          </span>
        </div>
      </button>
    );
  };

  // Week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-3">
        {/* Week Grid - Vertical layout for better readability */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isDayToday = isToday(day);
            const isWeekendDay = isWeekend(day);
            const openTasks = dayTasks.filter(t => t.status === "OPEN");
            const completedTasks = dayTasks.filter(t => t.status === "DONE");

            return (
              <div
                key={day.toISOString()}
                onClick={(e) => handleDayClick(day, e)}
                className={`min-h-[360px] rounded-xl transition-all cursor-pointer group overflow-hidden ${
                  isDayToday
                    ? "bg-indigo-950/40 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
                    : isWeekendDay
                    ? "bg-slate-900/30 hover:bg-slate-900/50"
                    : "bg-slate-900/60 hover:bg-slate-800/80"
                }`}
              >
                {/* Day Header */}
                <div className={`px-3 py-2 border-b ${isDayToday ? "border-indigo-500/30 bg-indigo-900/30" : "border-slate-700/50"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-medium uppercase tracking-wide ${
                        isDayToday ? "text-indigo-400" : isWeekendDay ? "text-slate-500" : "text-slate-400"
                      }`}>
                        {WEEKDAYS_FULL[index]}
                      </span>
                      <div className={`text-2xl font-bold ${isDayToday ? "text-indigo-300" : "text-white"}`}>
                        {format(day, "d")}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {openTasks.length > 0 && (
                        <Badge variant="secondary" className="bg-slate-700 text-slate-200 text-xs">
                          {openTasks.length} open
                        </Badge>
                      )}
                      <Plus className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-2 space-y-1.5 max-h-[280px] overflow-y-auto">
                  {dayTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-slate-600 text-sm">
                      No tasks
                    </div>
                  ) : (
                    <>
                      {openTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                      {completedTasks.length > 0 && openTasks.length > 0 && (
                        <div className="border-t border-slate-700/50 my-2" />
                      )}
                      {completedTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();
    const paddingDays = startDay === 0 ? 6 : startDay - 1;

    return (
      <>
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {WEEKDAYS.map((day, index) => (
            <div 
              key={day} 
              className={`text-center text-xs font-semibold uppercase tracking-wider py-2 rounded-lg ${
                index >= 5 ? "text-slate-500 bg-slate-900/30" : "text-slate-400 bg-slate-900/50"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="h-32 bg-slate-900/20 rounded-lg" />
          ))}

          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            const isWeekendDay = isWeekend(day);
            const openTasks = dayTasks.filter(t => t.status === "OPEN");
            const highPriorityTasks = openTasks.filter(t => t.priority === "HIGH");

            return (
              <div
                key={day.toISOString()}
                onClick={(e) => handleDayClick(day, e)}
                className={`h-32 rounded-lg transition-all cursor-pointer group overflow-hidden ${
                  isDayToday
                    ? "bg-indigo-950/50 ring-2 ring-indigo-500 shadow-md shadow-indigo-500/20"
                    : isCurrentMonth
                    ? isWeekendDay
                      ? "bg-slate-900/30 hover:bg-slate-900/50"
                      : "bg-slate-900/60 hover:bg-slate-800"
                    : "bg-slate-900/10 hover:bg-slate-900/30"
                }`}
              >
                {/* Day Header */}
                <div className={`px-2 py-1 flex items-center justify-between ${
                  isDayToday ? "bg-indigo-900/30" : ""
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isDayToday 
                        ? "bg-indigo-500 text-white" 
                        : isCurrentMonth 
                        ? "text-white" 
                        : "text-slate-600"
                    }`}>
                      {format(day, "d")}
                    </span>
                    {highPriorityTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {openTasks.length > 0 && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        isDayToday ? "bg-indigo-900/50 text-indigo-300" : "bg-slate-800 text-slate-400"
                      }`}>
                        {openTasks.length}
                      </span>
                    )}
                    <Plus className="h-3.5 w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Tasks */}
                <div className="px-1.5 pb-1 space-y-0.5 overflow-y-auto max-h-[85px]">
                  {dayTasks.slice(0, 3).map((task) => (
                    <TaskItem key={task.id} task={task} compact />
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-slate-500 text-center py-0.5 bg-slate-800/50 rounded">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Year view
  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const months = eachMonthOfInterval({
      start: yearStart,
      end: new Date(currentDate.getFullYear(), 11, 31),
    });

    const totalTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getFullYear() === currentDate.getFullYear();
    });
    const totalOpen = totalTasks.filter(t => t.status === "OPEN");

    return (
      <div className="space-y-6">
        {/* Year Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-900/50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{totalTasks.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{totalOpen.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Open</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{totalTasks.length - totalOpen.length}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-400">
              {totalOpen.filter(t => t.priority === "HIGH").length}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">High Priority</div>
          </div>
        </div>

        {/* Months Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {months.map((month) => {
            const monthTasks = getTasksForMonth(month);
            const openTasks = monthTasks.filter((t) => t.status === "OPEN");
            const completedTasks = monthTasks.filter((t) => t.status === "DONE");
            const highPriorityTasks = openTasks.filter((t) => t.priority === "HIGH");
            const isCurrentMonth = isSameMonth(month, new Date());
            const isPastMonth = month < new Date() && !isCurrentMonth;

            return (
              <button
                key={month.toISOString()}
                onClick={() => {
                  setCurrentDate(month);
                  setViewType("month");
                }}
                className={`p-4 rounded-xl transition-all text-left group ${
                  isCurrentMonth
                    ? "bg-indigo-950/50 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20 hover:bg-indigo-950/70"
                    : isPastMonth
                    ? "bg-slate-900/30 hover:bg-slate-900/50"
                    : "bg-slate-900/60 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-lg font-bold ${isCurrentMonth ? "text-indigo-300" : "text-white"}`}>
                    {format(month, "MMM")}
                  </span>
                  {highPriorityTasks.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>

                {monthTasks.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{openTasks.length}</span>
                      <span className="text-sm text-slate-500">open</span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${monthTasks.length > 0 ? (completedTasks.length / monthTasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{completedTasks.length} done</span>
                      {highPriorityTasks.length > 0 && (
                        <Badge className="bg-rose-500/20 text-rose-400 text-xs border-rose-500/30">
                          {highPriorityTasks.length} urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 py-4">No tasks</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white">{getHeaderTitle()}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
              >
                Today
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <div className="flex items-center bg-slate-900/80 rounded-lg p-1 border border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewType("week")}
                  className={`px-3 gap-1.5 ${viewType === "week" ? "bg-indigo-600 text-white hover:bg-indigo-600" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Week</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewType("month")}
                  className={`px-3 gap-1.5 ${viewType === "month" ? "bg-indigo-600 text-white hover:bg-indigo-600" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Month</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewType("year")}
                  className={`px-3 gap-1.5 ${viewType === "year" ? "bg-indigo-600 text-white hover:bg-indigo-600" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Year</span>
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrev}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Render View */}
          {viewType === "week" && renderWeekView()}
          {viewType === "month" && renderMonthView()}
          {viewType === "year" && renderYearView()}

          {/* Legend */}
          {viewType !== "year" && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-4 border-t border-slate-700">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Priority:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-l-2 border-rose-500 bg-slate-800" />
                <span className="text-xs text-slate-400">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-l-2 border-amber-500 bg-slate-800" />
                <span className="text-xs text-slate-400">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border-l-2 border-slate-500 bg-slate-800" />
                <span className="text-xs text-slate-400">Low</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <Plus className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-500">Click any day to add task</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Plus className="h-4 w-4 text-indigo-400" />
              </div>
              New Task
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <form ref={formRef} action={formAction} className="space-y-4 mt-2">
            <input
              type="hidden"
              name="dueDate"
              value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Title *</label>
              <Input
                name="title"
                placeholder="What needs to be done?"
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Description</label>
              <Textarea
                name="description"
                placeholder="Add more details..."
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px] resize-none focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Priority</label>
                <Select name="priority" defaultValue="MEDIUM">
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="HIGH" className="focus:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-rose-400">High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM" className="focus:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-amber-400">Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="LOW" className="focus:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <span className="text-slate-400">Low</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Contact</label>
                <Select name="contactId" defaultValue="none">
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="none" className="text-slate-400 focus:bg-slate-700">None</SelectItem>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id} className="text-slate-300 focus:bg-slate-700">
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Related Deal</label>
              <Select name="dealId" defaultValue="none">
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none" className="text-slate-400 focus:bg-slate-700">None</SelectItem>
                  {deals.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id} className="text-slate-300 focus:bg-slate-700">
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-700">
              <Button type="button" variant="ghost" onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-white hover:bg-slate-700">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" />Create Task</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <button
                onClick={() => selectedTask && handleComplete(selectedTask.id)}
                disabled={isCompleting}
                className="hover:scale-110 transition-transform"
              >
                {selectedTask?.status === "DONE" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                ) : (
                  <Circle className="h-6 w-6 text-slate-400 hover:text-slate-300" />
                )}
              </button>
              <span className={`text-lg ${selectedTask?.status === "DONE" ? "line-through text-slate-500" : "text-white"}`}>
                {selectedTask?.title}
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">Task details</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <Badge
                  className={`${
                    selectedTask.priority === "HIGH"
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/50"
                      : selectedTask.priority === "MEDIUM"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                      : "bg-slate-500/20 text-slate-400 border-slate-500/50"
                  }`}
                >
                  {selectedTask.priority} priority
                </Badge>
                {selectedTask.dueDate && (
                  <span className={`text-sm ${
                    isPast(new Date(selectedTask.dueDate)) && !isToday(new Date(selectedTask.dueDate)) && selectedTask.status === "OPEN"
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}>
                    {isPast(new Date(selectedTask.dueDate)) && !isToday(new Date(selectedTask.dueDate)) && selectedTask.status === "OPEN" ? "Overdue: " : "Due: "}
                    {format(new Date(selectedTask.dueDate), "EEE, MMM d")}
                  </span>
                )}
              </div>

              {selectedTask.description && (
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedTask.description}</p>
                </div>
              )}

              <div className="space-y-2">
                {selectedTask.contact && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 p-2 rounded bg-slate-900/30">
                    <User className="h-4 w-4 text-indigo-400" />
                    <span>Contact: <span className="text-slate-300">{selectedTask.contact.name}</span></span>
                  </div>
                )}
                {selectedTask.deal && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 p-2 rounded bg-slate-900/30">
                    <Handshake className="h-4 w-4 text-emerald-400" />
                    <span>Deal: <span className="text-slate-300">{selectedTask.deal.name}</span></span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700">
                <Button
                  onClick={() => handleComplete(selectedTask.id)}
                  disabled={isCompleting}
                  className={selectedTask.status === "DONE" 
                    ? "bg-slate-600 hover:bg-slate-500 text-white" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }
                >
                  {isCompleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {selectedTask.status === "DONE" ? "Mark Incomplete" : "Mark Complete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
