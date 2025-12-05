"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateDealStage, markDealWon, markDealLost } from "@/actions/deals";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, User, MoreHorizontal, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DealDialog } from "./deal-dialog";
import Link from "next/link";

interface Deal {
  id: string;
  name: string;
  value: number | { toString(): string };
  currency: string;
  probability: number;
  stageId: string;
  stage: { id: string; name: string; color: string };
  company: { id: string; name: string } | null;
  contact: { id: string; name: string } | null;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  deals: Deal[];
  total: number;
}

interface KanbanBoardProps {
  stages: Stage[];
  deals: Deal[];
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  allStages: { id: string; name: string; color: string; order: number }[];
}

function DealCard({
  deal,
  companies,
  contacts,
  stages,
  isDragging,
}: {
  deal: Deal;
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  stages: { id: string; name: string; color: string; order: number }[];
  isDragging?: boolean;
}) {
  const handleWon = async () => {
    const result = await markDealWon(deal.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Deal marked as won!");
    }
  };

  const handleLost = async () => {
    const result = await markDealLost(deal.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.info("Deal marked as lost");
    }
  };

  return (
    <Card
      className={`bg-slate-900/80 border-slate-700 hover:border-slate-600 transition-all ${
        isDragging ? "opacity-50 rotate-2 scale-105" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/deals/${deal.id}`}
            className="font-medium text-white hover:text-indigo-400 text-sm line-clamp-2"
          >
            {deal.name}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-white shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-800 border-slate-700"
            >
              <DealDialog
                deal={deal}
                stages={stages}
                companies={companies}
                contacts={contacts}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-slate-300 focus:bg-slate-700"
                >
                  Edit
                </DropdownMenuItem>
              </DealDialog>
              <DropdownMenuItem
                onClick={handleWon}
                className="text-emerald-400 focus:bg-emerald-500/10"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Mark as Won
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLost}
                className="text-red-400 focus:bg-red-500/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center gap-2 text-lg font-bold text-white">
          €{Number(deal.value).toLocaleString()}
          <Badge variant="outline" className="text-xs font-normal border-slate-600 text-slate-400">
            {deal.probability}%
          </Badge>
        </div>

        <div className="mt-3 space-y-1.5">
          {deal.company && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{deal.company.name}</span>
            </div>
          )}
          {deal.contact && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <User className="h-3 w-3" />
              <span className="truncate">{deal.contact.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SortableDealCard({
  deal,
  companies,
  contacts,
  stages,
}: {
  deal: Deal;
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  stages: { id: string; name: string; color: string; order: number }[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <DealCard
        deal={deal}
        companies={companies}
        contacts={contacts}
        stages={stages}
        isDragging={isDragging}
      />
    </div>
  );
}

function DroppableColumn({
  stage,
  children,
}: {
  stage: Stage;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] transition-colors ${
        isOver ? "bg-indigo-500/10 rounded-lg" : ""
      }`}
    >
      {children}
    </div>
  );
}

export function KanbanBoard({
  stages,
  deals,
  companies,
  contacts,
  allStages,
}: KanbanBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setActiveDeal(deal);
      setActiveStageId(deal.stageId);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    const overId = over.id as string;
    
    // Check if hovering over a stage
    const isOverStage = stages.some((s) => s.id === overId);
    if (isOverStage) {
      setActiveStageId(overId);
      return;
    }

    // Check if hovering over a deal - find its stage
    const overDeal = deals.find((d) => d.id === overId);
    if (overDeal) {
      setActiveStageId(overDeal.stageId);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    const dealId = active.id as string;
    const deal = deals.find((d) => d.id === dealId);
    
    setActiveDeal(null);
    setActiveStageId(null);

    if (!over || !deal) return;

    const overId = over.id as string;
    
    // Determine the target stage
    let targetStageId: string | null = null;
    
    // Check if dropped on a stage directly
    const isStage = stages.some((s) => s.id === overId);
    if (isStage) {
      targetStageId = overId;
    } else {
      // Dropped on another deal - find its stage
      const overDeal = deals.find((d) => d.id === overId);
      if (overDeal) {
        targetStageId = overDeal.stageId;
      }
    }

    if (!targetStageId || deal.stageId === targetStageId) return;

    const result = await updateDealStage(dealId, targetStageId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Diil liigutatud!");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-80 flex flex-col rounded-lg border transition-colors ${
              activeStageId === stage.id
                ? "bg-indigo-500/5 border-indigo-500/50"
                : "bg-slate-800/30 border-slate-700/50"
            }`}
          >
            {/* Stage Header */}
            <div
              className="p-4 border-b border-slate-700/50 rounded-t-lg"
              style={{ borderTopColor: stage.color, borderTopWidth: 3 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{stage.name}</h3>
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                  {stage.deals.length}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                €{stage.total.toLocaleString()}
              </p>
            </div>

            {/* Stage Content - Droppable */}
            <DroppableColumn stage={stage}>
              <SortableContext
                id={stage.id}
                items={stage.deals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {stage.deals.map((deal) => (
                  <SortableDealCard
                    key={deal.id}
                    deal={deal}
                    companies={companies}
                    contacts={contacts}
                    stages={allStages}
                  />
                ))}
                {stage.deals.length === 0 && (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-500">Lohista siia</p>
                  </div>
                )}
              </SortableContext>
            </DroppableColumn>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeDeal && (
          <div className="w-80 rotate-3 scale-105">
            <DealCard
              deal={activeDeal}
              companies={companies}
              contacts={contacts}
              stages={allStages}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

