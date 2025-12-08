"use client";

import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { updateDealStage, reorderDeals, markDealWon, markDealLost } from "@/actions/deals";
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
  order?: number;
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
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  allStages: { id: string; name: string; color: string; order: number }[];
}

// Static card display
function DealCardContent({ deal, companies, contacts, stages, variant = "normal" }: {
  deal: Deal;
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  stages: { id: string; name: string; color: string; order: number }[];
  variant?: "normal" | "dragging" | "placeholder";
}) {
  const handleWon = async () => {
    const result = await markDealWon(deal.id);
    if (result.error) toast.error(result.error);
    else toast.success("Deal marked as won!");
  };

  const handleLost = async () => {
    const result = await markDealLost(deal.id);
    if (result.error) toast.error(result.error);
    else toast.info("Deal marked as lost");
  };

  if (variant === "placeholder") {
    return (
      <Card className="bg-indigo-500/20 border-indigo-500/50 border-dashed border-2">
        <CardContent className="p-4">
          <span className="font-medium text-indigo-300 text-sm">{deal.name}</span>
          <div className="mt-2 text-lg font-bold text-indigo-300">€{Number(deal.value).toLocaleString()}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-900/80 border-slate-700 hover:border-slate-600 ${variant === "dragging" ? "opacity-50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/deals/${deal.id}`} className="font-medium text-white hover:text-indigo-400 text-sm line-clamp-2">
            {deal.name}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DealDialog deal={deal} stages={stages} companies={companies} contacts={contacts}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-slate-300 focus:bg-slate-700">
                  Edit
                </DropdownMenuItem>
              </DealDialog>
              <DropdownMenuItem onClick={handleWon} className="text-emerald-400 focus:bg-emerald-500/10">
                <Trophy className="h-4 w-4 mr-2" />
                Mark as Won
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLost} className="text-red-400 focus:bg-red-500/10">
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

// Draggable deal card
function DraggableDeal({ deal, companies, contacts, stages, isDragging }: {
  deal: Deal;
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  stages: { id: string; name: string; color: string; order: number }[];
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: deal.id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing touch-none"
    >
      <DealCardContent 
        deal={deal} 
        companies={companies} 
        contacts={contacts} 
        stages={stages} 
        variant={isDragging ? "dragging" : "normal"}
      />
    </div>
  );
}

// Droppable column
function DroppableStage({ stageId, children, isActive }: { stageId: string; children: React.ReactNode; isActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage:${stageId}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] rounded-lg transition-colors ${
        isOver || isActive ? "bg-indigo-500/10" : ""
      }`}
    >
      {children}
    </div>
  );
}

// Droppable zone around each deal
function DroppableDealZone({ dealId, children }: { dealId: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: dealId });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}

export function KanbanBoard({ stages: initialStages, companies, contacts, allStages }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(initialStages);
  
  // Simple drag state - just IDs and position
  const [dragState, setDragState] = useState<{
    activeId: string | null;
    activeStageId: string | null;
    overStageId: string | null;
    overIndex: number;
  }>({ activeId: null, activeStageId: null, overStageId: null, overIndex: 0 });

  const lastOverRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function getDeal(dealId: string): Deal | null {
    for (const stage of data) {
      const deal = stage.deals.find(d => d.id === dealId);
      if (deal) return deal;
    }
    return null;
  }

  function getStageId(dealId: string): string | null {
    for (const stage of data) {
      if (stage.deals.some(d => d.id === dealId)) return stage.id;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const dealId = String(event.active.id);
    const stageId = getStageId(dealId);
    const stageDeals = data.find(s => s.id === stageId)?.deals || [];
    const index = stageDeals.findIndex(d => d.id === dealId);
    
    setDragState({
      activeId: dealId,
      activeStageId: stageId,
      overStageId: stageId,
      overIndex: index,
    });
    lastOverRef.current = null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    
    if (!over || !dragState.activeId) return;
    
    const overId = String(over.id);
    
    // Skip duplicate
    if (lastOverRef.current === overId) return;
    lastOverRef.current = overId;

    let targetStageId: string;
    let targetIndex: number;

    if (overId.startsWith("stage:")) {
      targetStageId = overId.replace("stage:", "");
      const stage = data.find(s => s.id === targetStageId);
      targetIndex = stage ? stage.deals.length : 0;
    } else {
      const stageId = getStageId(overId);
      if (!stageId) return;
      targetStageId = stageId;
      const stage = data.find(s => s.id === stageId);
      targetIndex = stage?.deals.findIndex(d => d.id === overId) ?? 0;
    }

    if (dragState.overStageId !== targetStageId || dragState.overIndex !== targetIndex) {
      setDragState(prev => ({
        ...prev,
        overStageId: targetStageId,
        overIndex: targetIndex,
      }));
    }
  }

  async function handleDragEnd() {
    const { activeId, activeStageId, overStageId, overIndex } = dragState;
    
    setDragState({ activeId: null, activeStageId: null, overStageId: null, overIndex: 0 });
    lastOverRef.current = null;

    if (!activeId || !activeStageId || !overStageId) return;

    const activeDeal = getDeal(activeId);
    if (!activeDeal) return;

    let newData: Stage[];
    
    if (activeStageId === overStageId) {
      newData = data.map(stage => {
        if (stage.id !== activeStageId) return stage;
        
        const deals = [...stage.deals];
        const currentIndex = deals.findIndex(d => d.id === activeId);
        if (currentIndex === -1) return stage;
        
        const [removed] = deals.splice(currentIndex, 1);
        const newIndex = overIndex > currentIndex ? overIndex - 1 : overIndex;
        deals.splice(Math.max(0, Math.min(newIndex, deals.length)), 0, removed);
        
        return { ...stage, deals };
      });
    } else {
      newData = data.map(stage => {
        if (stage.id === activeStageId) {
          return { ...stage, deals: stage.deals.filter(d => d.id !== activeId) };
        }
        if (stage.id === overStageId) {
          const deals = [...stage.deals];
          deals.splice(Math.min(overIndex, deals.length), 0, { ...activeDeal, stageId: overStageId });
          return { ...stage, deals };
        }
        return stage;
      });
    }

    newData = newData.map(s => ({
      ...s,
      total: s.deals.reduce((sum, d) => sum + Number(d.value), 0),
    }));

    setData(newData);

    try {
      if (activeStageId === overStageId) {
        const stage = newData.find(s => s.id === overStageId);
        if (stage) await reorderDeals(stage.deals.map(d => d.id));
      } else {
        const result = await updateDealStage(activeId, overStageId, overIndex);
        if (result.error) {
          toast.error(result.error);
          setData(initialStages);
          return;
        }
        const stage = newData.find(s => s.id === overStageId);
        if (stage) await reorderDeals(stage.deals.map(d => d.id));
        toast.success("Diil liigutatud!");
      }
    } catch {
      toast.error("Viga");
      setData(initialStages);
    }
  }

  function handleDragCancel() {
    setDragState({ activeId: null, activeStageId: null, overStageId: null, overIndex: 0 });
    lastOverRef.current = null;
  }

  const draggedDeal = dragState.activeId ? getDeal(dragState.activeId) : null;

  // Render deals with placeholder
  function renderDeals(stage: Stage) {
    const { activeId, activeStageId, overStageId, overIndex } = dragState;
    const isSourceStage = activeStageId === stage.id;
    const isTargetStage = overStageId === stage.id;
    const activeDeal = activeId ? getDeal(activeId) : null;

    const items: React.ReactNode[] = [];

    stage.deals.forEach((deal, index) => {
      const isDragging = deal.id === activeId;

      // Add placeholder before this deal
      if (isTargetStage && !isSourceStage && index === overIndex && activeDeal) {
        items.push(
          <div key="placeholder">
            <DealCardContent deal={activeDeal} companies={companies} contacts={contacts} stages={allStages} variant="placeholder" />
          </div>
        );
      }

      items.push(
        <DroppableDealZone key={deal.id} dealId={deal.id}>
          <DraggableDeal 
            deal={deal} 
            companies={companies} 
            contacts={contacts} 
            stages={allStages}
            isDragging={isDragging}
          />
        </DroppableDealZone>
      );
    });

    // Placeholder at end
    if (isTargetStage && !isSourceStage && overIndex >= stage.deals.length && activeDeal) {
      items.push(
        <div key="placeholder">
          <DealCardContent deal={activeDeal} companies={companies} contacts={contacts} stages={allStages} variant="placeholder" />
        </div>
      );
    }

    return items;
  }

  if (!mounted) {
    return (
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {initialStages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col rounded-lg border bg-slate-800/30 border-slate-700/50">
            <div className="p-4 border-b border-slate-700/50" style={{ borderTopColor: stage.color, borderTopWidth: 3 }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{stage.name}</h3>
                <Badge variant="secondary" className="bg-slate-700 text-slate-300">{stage.deals.length}</Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">€{stage.total.toLocaleString()}</p>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
              {stage.deals.map((deal) => (
                <DealCardContent key={deal.id} deal={deal} companies={companies} contacts={contacts} stages={allStages} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {data.map((stage) => {
          const isActive = dragState.overStageId === stage.id;

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 flex flex-col rounded-lg border transition-all ${
                isActive ? "bg-indigo-500/5 border-indigo-500/50 shadow-lg shadow-indigo-500/10" : "bg-slate-800/30 border-slate-700/50"
              }`}
            >
              <div className="p-4 border-b border-slate-700/50" style={{ borderTopColor: stage.color, borderTopWidth: 3 }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{stage.name}</h3>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">{stage.deals.length}</Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">€{stage.total.toLocaleString()}</p>
              </div>

              <DroppableStage stageId={stage.id} isActive={isActive}>
                {renderDeals(stage)}
                
                {stage.deals.length === 0 && !dragState.activeId && (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-500">Lohista siia</p>
                  </div>
                )}
              </DroppableStage>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {draggedDeal && (
          <div className="w-80 rotate-2 scale-105 shadow-2xl">
            <DealCardContent deal={draggedDeal} companies={companies} contacts={contacts} stages={allStages} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
