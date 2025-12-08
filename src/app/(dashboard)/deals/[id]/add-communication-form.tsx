"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCommunication } from "@/actions/notes";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { Loader2, Phone, Mail, Users, MessageCircle } from "lucide-react";

interface AddCommunicationFormProps {
  dealId?: string;
  contactId?: string | null;
  companyId?: string;
}

const COMM_TYPES = [
  { value: "CALL", label: "Phone Call", icon: Phone },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "MEETING", label: "Meeting", icon: Users },
  { value: "OTHER", label: "Other", icon: MessageCircle },
];

export function AddCommunicationForm({ dealId, contactId, companyId }: AddCommunicationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  const boundAction = async (prevState: { error?: string; success?: boolean }, formData: FormData) => {
    if (dealId) formData.set("dealId", dealId);
    if (contactId) formData.set("contactId", contactId);
    if (companyId) formData.set("companyId", companyId);
    return createCommunication(prevState, formData);
  };

  const [state, formAction, isPending] = useActionState(boundAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success("Communication logged");
      formRef.current?.reset();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Type</label>
          <Select name="type" defaultValue="CALL">
            <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {COMM_TYPES.map((type) => (
                <SelectItem
                  key={type.value}
                  value={type.value}
                  className="text-slate-300 focus:bg-slate-700 focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-400">Duration (minutes)</label>
          <Input
            type="number"
            name="duration"
            placeholder="15"
            className="bg-slate-900/50 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-400">Subject</label>
        <Input
          name="subject"
          placeholder="What was discussed?"
          className="bg-slate-900/50 border-slate-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-400">Description</label>
        <Textarea
          name="description"
          placeholder="Add details about the conversation..."
          className="bg-slate-900/50 border-slate-600 text-white min-h-[80px] resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Log Communication"
          )}
        </Button>
      </div>
    </form>
  );
}

