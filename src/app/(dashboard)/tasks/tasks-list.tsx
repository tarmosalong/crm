"use client";

import { toggleTaskStatus, deleteTask } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, User, Handshake } from "lucide-react";
import { TaskDialog } from "./task-dialog";
import { toast } from "sonner";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: "OPEN" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  contact: { id: string; name: string } | null;
  deal: { id: string; name: string } | null;
}

interface TasksListProps {
  tasks: Task[];
  contacts: { id: string; name: string }[];
  deals: { id: string; name: string }[];
}

const priorityColors = {
  LOW: "border-slate-500 text-slate-400",
  MEDIUM: "border-amber-500 text-amber-400",
  HIGH: "border-red-500 text-red-400",
};

function formatDueDate(date: Date) {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

function getDueDateColor(date: Date, status: string) {
  if (status === "DONE") return "text-slate-500";
  if (isPast(date) && !isToday(date)) return "text-red-400";
  if (isToday(date)) return "text-amber-400";
  return "text-slate-400";
}

export function TasksList({ tasks, contacts, deals }: TasksListProps) {
  const handleToggle = async (id: string) => {
    const result = await toggleTaskStatus(id);
    if (result.error) {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const result = await deleteTask(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task deleted");
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-slate-400">No tasks found</p>
        <p className="text-slate-500 text-sm mt-1">
          Create a task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
            task.status === "DONE"
              ? "bg-slate-800/30 border-slate-700/50"
              : "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
          }`}
        >
          <Checkbox
            checked={task.status === "DONE"}
            onCheckedChange={() => handleToggle(task.id)}
            className="mt-1 border-slate-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.status === "DONE"
                      ? "text-slate-500 line-through"
                      : "text-white"
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={priorityColors[task.priority]}
                >
                  {task.priority}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-slate-800 border-slate-700"
                  >
                    <TaskDialog task={task} contacts={contacts} deals={deals}>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-slate-300 focus:bg-slate-700 focus:text-white"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </TaskDialog>
                    <DropdownMenuItem
                      onClick={() => handleDelete(task.id)}
                      className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              {task.dueDate && (
                <span
                  className={`text-sm ${getDueDateColor(
                    new Date(task.dueDate),
                    task.status
                  )}`}
                >
                  {formatDueDate(new Date(task.dueDate))}
                </span>
              )}

              {task.contact && (
                <Link
                  href={`/contacts/${task.contact.id}`}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
                >
                  <User className="h-3 w-3" />
                  {task.contact.name}
                </Link>
              )}

              {task.deal && (
                <Link
                  href={`/deals/${task.deal.id}`}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
                >
                  <Handshake className="h-3 w-3" />
                  {task.deal.name}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

