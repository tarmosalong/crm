"use client";

import { useActionState, useState, useEffect } from "react";
import { createDeal, updateDeal, DealFormState } from "@/actions/deals";
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

interface Deal {
  id: string;
  name: string;
  value: number | { toString(): string };
  currency: string;
  probability: number;
  expectedCloseDate?: Date | null;
  description?: string | null;
  stageId: string;
  companyId?: string | null;
  contactId?: string | null;
}

interface DealDialogProps {
  deal?: Deal;
  stages: { id: string; name: string; color: string; order: number }[];
  companies: { id: string; name: string }[];
  contacts: { id: string; name: string }[];
  children: React.ReactNode;
}

export function DealDialog({
  deal,
  stages,
  companies,
  contacts,
  children,
}: DealDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!deal;

  // Filter out Won/Lost stages for new deals
  const availableStages = isEdit
    ? stages
    : stages.filter((s) => s.name !== "Won" && s.name !== "Lost");

  const defaultStage = availableStages.find((s) => s.name === "Lead") || availableStages[0];

  const boundUpdateDeal = deal ? updateDeal.bind(null, deal.id) : createDeal;

  const [state, formAction, isPending] = useActionState<DealFormState, FormData>(
    boundUpdateDeal,
    {}
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success(isEdit ? "Deal updated" : "Deal created");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "Add Deal"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit ? "Update deal information" : "Add a new deal to your pipeline"}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Deal Name *
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={deal?.name}
              required
              placeholder="e.g., Software License Q1"
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-slate-300">
                Value (€)
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                min="0"
                step="0.01"
                defaultValue={deal?.value ? Number(deal.value) : 0}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
              <input type="hidden" name="currency" value="EUR" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability" className="text-slate-300">
                Probability (%)
              </Label>
              <Input
                id="probability"
                name="probability"
                type="number"
                min="0"
                max="100"
                defaultValue={deal?.probability || 0}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stageId" className="text-slate-300">
                Stage *
              </Label>
              <Select
                name="stageId"
                defaultValue={deal?.stageId || defaultStage?.id}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {availableStages.map((stage) => (
                    <SelectItem
                      key={stage.id}
                      value={stage.id}
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate" className="text-slate-300">
                Expected Close
              </Label>
              <Input
                id="expectedCloseDate"
                name="expectedCloseDate"
                type="date"
                defaultValue={
                  deal?.expectedCloseDate
                    ? format(new Date(deal.expectedCloseDate), "yyyy-MM-dd")
                    : ""
                }
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyId" className="text-slate-300">
                Company
              </Label>
              <Select name="companyId" defaultValue={deal?.companyId || "none"}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none" className="text-slate-400">
                    None
                  </SelectItem>
                  {companies.map((company) => (
                    <SelectItem
                      key={company.id}
                      value={company.id}
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactId" className="text-slate-300">
                Contact
              </Label>
              <Select name="contactId" defaultValue={deal?.contactId || "none"}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="none" className="text-slate-400">
                    None
                  </SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem
                      key={contact.id}
                      value={contact.id}
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      {contact.name}
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
              defaultValue={deal?.description || ""}
              rows={3}
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

