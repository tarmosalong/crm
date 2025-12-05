"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toggleTaskStatus } from "@/actions/tasks";
import { toast } from "sonner";
import { Calendar, User, Handshake, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: string;
  status: string;
  contact: { name: string } | null;
  deal: { name: string } | null;
}

interface UpcomingTasksProps {
  tasks: Task[];
}

const priorityColors = {
  LOW: "border-slate-500 text-slate-400",
  MEDIUM: "border-amber-500 text-amber-400",
  HIGH: "border-red-500 text-red-400",
};

export function UpcomingTasks({ tasks: initialTasks }: UpcomingTasksProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async (taskId: string) => {
    setIsCompleting(true);
    const result = await toggleTaskStatus(taskId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Task completed!");
      // Remove from list
      setTasks(tasks.filter((t) => t.id !== taskId));
      setSelectedTask(null);
    }
    setIsCompleting(false);
  };

  if (tasks.length === 0) {
    return <p className="text-slate-500 text-center py-4">No upcoming tasks</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {task.title}
              </p>
              <p className="text-xs text-slate-400">
                {task.contact?.name || task.deal?.name || "No link"}
              </p>
            </div>
            {task.dueDate && (
              <Badge
                variant="outline"
                className="border-amber-500/50 text-amber-400 ml-4"
              >
                {format(new Date(task.dueDate), "MMM d")}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Checkbox
                checked={false}
                onCheckedChange={() => selectedTask && handleComplete(selectedTask.id)}
                disabled={isCompleting}
                className="border-slate-600 data-[state=checked]:bg-emerald-600"
              />
              <span className={isCompleting ? "line-through text-slate-500" : ""}>
                {selectedTask?.title}
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Task details
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              {/* Priority & Due Date */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={priorityColors[selectedTask.priority as keyof typeof priorityColors]}
                >
                  {selectedTask.priority}
                </Badge>
                {selectedTask.dueDate && (
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(selectedTask.dueDate), "EEEE, MMM d, yyyy")}
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <p className="text-sm text-slate-300">{selectedTask.description}</p>
                </div>
              )}

              {/* Links */}
              <div className="space-y-2">
                {selectedTask.contact && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <User className="h-4 w-4" />
                    <span>Contact: {selectedTask.contact.name}</span>
                  </div>
                )}
                {selectedTask.deal && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Handshake className="h-4 w-4" />
                    <span>Deal: {selectedTask.deal.name}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Link href="/tasks">
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    View All Tasks
                  </Button>
                </Link>
                <Button
                  onClick={() => handleComplete(selectedTask.id)}
                  disabled={isCompleting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {isCompleting ? "Completing..." : "Mark Complete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

