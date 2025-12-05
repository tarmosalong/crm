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
import { format } from "date-fns";
import { markDealWon, markDealLost } from "@/actions/deals";
import { toast } from "sonner";
import { Building2, Calendar, Trophy, XCircle, Handshake } from "lucide-react";
import Link from "next/link";

interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate: Date | null;
  description: string | null;
  status: string;
  company: { name: string } | null;
  stage: { name: string; color: string };
}

interface RecentDealsProps {
  deals: Deal[];
}

export function RecentDeals({ deals: initialDeals }: RecentDealsProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleWon = async (dealId: string) => {
    setIsUpdating(true);
    const result = await markDealWon(dealId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Deal marked as won! 🎉");
      setDeals(deals.filter((d) => d.id !== dealId));
      setSelectedDeal(null);
    }
    setIsUpdating(false);
  };

  const handleLost = async (dealId: string) => {
    setIsUpdating(true);
    const result = await markDealLost(dealId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.info("Deal marked as lost");
      setDeals(deals.filter((d) => d.id !== dealId));
      setSelectedDeal(null);
    }
    setIsUpdating(false);
  };

  if (deals.length === 0) {
    return <p className="text-slate-500 text-center py-4">No deals yet</p>;
  }

  return (
    <>
      <div className="space-y-3">
        {deals.map((deal) => (
          <button
            key={deal.id}
            onClick={() => setSelectedDeal(deal)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {deal.name}
              </p>
              <p className="text-xs text-slate-400">
                {deal.company?.name || "No company"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-medium text-white">
                €{deal.value.toLocaleString()}
              </span>
              <Badge
                variant="outline"
                style={{
                  borderColor: deal.stage.color,
                  color: deal.stage.color,
                }}
              >
                {deal.stage.name}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* Deal Detail Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-violet-500" />
              {selectedDeal?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Deal details
            </DialogDescription>
          </DialogHeader>

          {selectedDeal && (
            <div className="space-y-4">
              {/* Value & Stage */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">
                    €{selectedDeal.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400">
                    {selectedDeal.probability}% probability
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-base px-3 py-1"
                  style={{
                    borderColor: selectedDeal.stage.color,
                    color: selectedDeal.stage.color,
                  }}
                >
                  {selectedDeal.stage.name}
                </Badge>
              </div>

              {/* Company & Expected Close */}
              <div className="space-y-2">
                {selectedDeal.company && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedDeal.company.name}</span>
                  </div>
                )}
                {selectedDeal.expectedCloseDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Expected close:{" "}
                      {format(new Date(selectedDeal.expectedCloseDate), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedDeal.description && (
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <p className="text-sm text-slate-300">{selectedDeal.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <Link href="/deals">
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    View Pipeline
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleLost(selectedDeal.id)}
                    disabled={isUpdating}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Lost
                  </Button>
                  <Button
                    onClick={() => handleWon(selectedDeal.id)}
                    disabled={isUpdating}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    Won
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
