import { getDeals, getPipelineStages, seedPipelineStages } from "@/actions/deals";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { KanbanBoard } from "./kanban-board";
import { DealDialog } from "./deal-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Seed pipeline stages if they don't exist
  await seedPipelineStages();

  const [deals, stages, companies, contacts] = await Promise.all([
    getDeals(),
    getPipelineStages(),
    db.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Calculate total value per stage and sort deals by order
  const stageValues = stages.map((stage) => {
    const stageDeals = deals
      .filter((d) => d.stageId === stage.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const total = stageDeals.reduce((sum, d) => sum + Number(d.value), 0);
    return { ...stage, deals: stageDeals, total };
  });

  // Filter out Won/Lost stages for the main kanban (they are status-based)
  const kanbanStages = stageValues.filter(
    (s) => s.name !== "Won" && s.name !== "Lost"
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
          <p className="text-slate-400 mt-1">
            Track and manage your deals through the sales process
          </p>
        </div>
        <DealDialog stages={stages} companies={companies} contacts={contacts}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </DealDialog>
      </div>

      {/* Pipeline Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2 flex-shrink-0">
        {kanbanStages.map((stage) => (
          <div
            key={stage.id}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 min-w-fit"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-sm text-slate-300">{stage.name}</span>
            <span className="text-sm font-medium text-white">
              €{stage.total.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              ({stage.deals.length})
            </span>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <KanbanBoard
          stages={kanbanStages}
          companies={companies}
          contacts={contacts}
          allStages={stages}
        />
      </div>
    </div>
  );
}

