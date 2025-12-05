import { getTasks } from "@/actions/tasks";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TasksList } from "./tasks-list";
import { TaskDialog } from "./task-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, CalendarDays, List, CheckCircle2 } from "lucide-react";

interface TasksPageProps {
  searchParams: Promise<{ filter?: "today" | "week" | "all" | "completed" }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.id) return null;

  const filter = params.filter || "all";

  const [tasks, contacts, deals] = await Promise.all([
    getTasks({ filter }),
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

  // Get counts for tabs
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
  const nextWeek = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todayCount, weekCount, allCount, completedCount] = await Promise.all([
    db.task.count({
      where: {
        assigneeId: session.user.id,
        status: "OPEN",
        dueDate: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    }),
    db.task.count({
      where: {
        assigneeId: session.user.id,
        status: "OPEN",
        dueDate: {
          gte: todayStart,
          lt: nextWeek,
        },
      },
    }),
    db.task.count({
      where: { assigneeId: session.user.id, status: "OPEN" },
    }),
    db.task.count({
      where: { assigneeId: session.user.id, status: "DONE" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-slate-400 mt-1">
            Manage your tasks and follow-ups
          </p>
        </div>
        <TaskDialog contacts={contacts} deals={deals}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </TaskDialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={filter} className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
          <TabsTrigger
            value="today"
            asChild
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
          >
            <a href="/tasks?filter=today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today ({todayCount})
            </a>
          </TabsTrigger>
          <TabsTrigger
            value="week"
            asChild
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
          >
            <a href="/tasks?filter=week" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Next 7 Days ({weekCount})
            </a>
          </TabsTrigger>
          <TabsTrigger
            value="all"
            asChild
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
          >
            <a href="/tasks?filter=all" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              All Open ({allCount})
            </a>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            asChild
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400"
          >
            <a href="/tasks?filter=completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completedCount})
            </a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <TasksList tasks={tasks} contacts={contacts} deals={deals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

