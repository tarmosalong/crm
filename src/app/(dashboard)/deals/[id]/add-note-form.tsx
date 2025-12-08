"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createNote } from "@/actions/notes";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface AddNoteFormProps {
  dealId?: string;
  contactId?: string;
  companyId?: string;
}

export function AddNoteForm({ dealId, contactId, companyId }: AddNoteFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  const boundAction = async (prevState: { error?: string; success?: boolean }, formData: FormData) => {
    if (dealId) formData.set("dealId", dealId);
    if (contactId) formData.set("contactId", contactId);
    if (companyId) formData.set("companyId", companyId);
    return createNote(prevState, formData);
  };

  const [state, formAction, isPending] = useActionState(boundAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success("Note added");
      formRef.current?.reset();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <Textarea
        name="content"
        placeholder="Write a note..."
        className="bg-slate-900/50 border-slate-600 text-white min-h-[100px] resize-none"
        required
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Add Note"
          )}
        </Button>
      </div>
    </form>
  );
}

