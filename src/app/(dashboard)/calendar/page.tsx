import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CalendarView } from "./calendar-view";
import { TaskDialog } from "../tasks/task-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [tasks, contacts, deals] = await Promise.all([
    db.task.findMany({
      where: {
        assigneeId: session.user.id,
        dueDate: { not: null },
      },
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        priority: true,
        status: true,
        contact: { select: { id: true, name: true } },
        deal: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: "asc" },
    }),
    db.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.deal.findMany({
      where: { ownerId: session.user.id, status: "OPEN" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize dates for client component
  const serializedTasks = tasks.map((task) => ({
    ...task,
    dueDate: task.dueDate?.toISOString() || null,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-slate-400 mt-1">
            View your tasks and deadlines in calendar format
          </p>
        </div>
        <TaskDialog contacts={contacts} deals={deals}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </TaskDialog>
      </div>

      {/* Calendar */}
      <CalendarView tasks={serializedTasks} contacts={contacts} deals={deals} />
    </div>
  );
}


