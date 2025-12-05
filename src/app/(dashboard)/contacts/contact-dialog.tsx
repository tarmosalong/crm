"use client";

import { useActionState, useState, useEffect } from "react";
import { createContact, updateContact, ContactFormState } from "@/actions/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  notes?: string | null;
  linkedin?: string | null;
  companies?: { company: { id: string } }[];
  tags?: { tag: { id: string } }[];
}

interface ContactDialogProps {
  contact?: Contact;
  companies: { id: string; name: string }[];
  tags: { id: string; name: string; color: string }[];
  children: React.ReactNode;
}

export function ContactDialog({
  contact,
  companies,
  tags,
  children,
}: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!contact;

  const boundUpdateContact = contact
    ? updateContact.bind(null, contact.id)
    : createContact;

  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    boundUpdateContact,
    {}
  );

  // Handle form submission result
  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success(isEdit ? "Contact updated" : "Contact created");
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
          <DialogTitle>{isEdit ? "Edit Contact" : "Add Contact"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit
              ? "Update contact information"
              : "Add a new contact to your CRM"}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={contact?.name}
                required
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact?.email || ""}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={contact?.phone || ""}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-300">
                Role / Title
              </Label>
              <Input
                id="role"
                name="role"
                defaultValue={contact?.role || ""}
                placeholder="e.g. CEO, Sales Manager"
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-slate-300">
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                name="linkedin"
                defaultValue={contact?.linkedin || ""}
                placeholder="linkedin.com/in/..."
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Company Selection */}
          {companies.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-300">Companies</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                {companies.map((company) => (
                  <label
                    key={company.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="companyIds"
                      value={company.id}
                      defaultChecked={contact?.companies?.some(
                        (c) => c.company.id === company.id
                      )}
                      className="rounded border-slate-600"
                    />
                    <span className="text-sm text-slate-300">{company.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags Selection */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-slate-300">Tags</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-700 cursor-pointer"
                    style={{ backgroundColor: `${tag.color}20` }}
                  >
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={contact?.tags?.some(
                        (t) => t.tag.id === tag.id
                      )}
                      className="rounded border-slate-600"
                    />
                    <span className="text-sm" style={{ color: tag.color }}>
                      {tag.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={contact?.notes || ""}
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

