"use client";

import { useActionState, useState, useEffect } from "react";
import { createTask, updateTask, TaskFormState } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  contactId?: string | null;
  dealId?: string | null;
  contact?: { id: string } | null;
  deal?: { id: string } | null;
}

interface TaskDialogProps {
  task?: Task;
  contacts: { id: string; name: string }[];
  deals: { id: string; name: string }[];
  children: React.ReactNode;
}

export function TaskDialog({ task, contacts, deals, children }: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!task;

  const boundUpdateTask = task ? updateTask.bind(null, task.id) : createTask;

  const [state, formAction, isPending] = useActionState<TaskFormState, FormData>(
    boundUpdateTask,
    {}
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success(isEdit ? "Task updated" : "Task created");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit ? "Update task details" : "Create a new task or reminder"}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={task?.title}
              required
              placeholder="e.g., Follow up on proposal"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-slate-300">
                Due Date
              </Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={
                  task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
                }
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-300">
                Priority
              </Label>
              <Select name="priority" defaultValue={task?.priority || "MEDIUM"}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="LOW"
                    className="text-slate-300 focus:bg-slate-700"
                  >
                    Low
                  </SelectItem>
                  <SelectItem
                    value="MEDIUM"
                    className="text-amber-400 focus:bg-slate-700"
                  >
                    Medium
                  </SelectItem>
                  <SelectItem
                    value="HIGH"
                    className="text-red-400 focus:bg-slate-700"
                  >
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactId" className="text-slate-300">
                Link to Contact
              </Label>
              <Select
                name="contactId"
                defaultValue={task?.contact?.id || task?.contactId || "none"}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none" className="text-slate-400">
                    None
                  </SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem
                      key={contact.id}
                      value={contact.id}
                      className="text-slate-300 focus:bg-slate-700"
                    >
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealId" className="text-slate-300">
                Link to Deal
              </Label>
              <Select
                name="dealId"
                defaultValue={task?.deal?.id || task?.dealId || "none"}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none" className="text-slate-400">
                    None
                  </SelectItem>
                  {deals.map((deal) => (
                    <SelectItem
                      key={deal.id}
                      value={deal.id}
                      className="text-slate-300 focus:bg-slate-700"
                    >
                      {deal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task?.description || ""}
              rows={3}
              placeholder="Add details about this task..."
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

