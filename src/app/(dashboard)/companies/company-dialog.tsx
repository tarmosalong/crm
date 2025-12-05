"use client";

import { useActionState, useState, useEffect } from "react";
import { createCompany, updateCompany, CompanyFormState } from "@/actions/companies";
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

interface Company {
  id: string;
  name: string;
  regNumber?: string | null;
  address?: string | null;
  sector?: string | null;
  size?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  tags?: { tag: { id: string } }[];
}

interface CompanyDialogProps {
  company?: Company;
  tags: { id: string; name: string; color: string }[];
  children: React.ReactNode;
}

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
];

const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Construction",
  "Education",
  "Professional Services",
  "Other",
];

export function CompanyDialog({ company, tags, children }: CompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!company;

  const boundUpdateCompany = company
    ? updateCompany.bind(null, company.id)
    : createCompany;

  const [state, formAction, isPending] = useActionState<CompanyFormState, FormData>(
    boundUpdateCompany,
    {}
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      toast.success(isEdit ? "Company updated" : "Company created");
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Company" : "Add Company"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit
              ? "Update company information"
              : "Add a new company to your CRM"}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Company Name *
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={company?.name}
                required
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regNumber" className="text-slate-300">
                Registration Number
              </Label>
              <Input
                id="regNumber"
                name="regNumber"
                defaultValue={company?.regNumber || ""}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-300">
                Website
              </Label>
              <Input
                id="website"
                name="website"
                defaultValue={company?.website || ""}
                placeholder="https://"
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
                defaultValue={company?.email || ""}
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
                defaultValue={company?.phone || ""}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector" className="text-slate-300">
                Sector
              </Label>
              <Select name="sector" defaultValue={company?.sector || ""}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {SECTORS.map((sector) => (
                    <SelectItem
                      key={sector}
                      value={sector}
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size" className="text-slate-300">
                Company Size
              </Label>
              <Select name="size" defaultValue={company?.size || ""}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem
                      key={size.value}
                      value={size.value}
                      className="text-slate-300 focus:bg-slate-700 focus:text-white"
                    >
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address" className="text-slate-300">
                Address
              </Label>
              <Input
                id="address"
                name="address"
                defaultValue={company?.address || ""}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Tags */}
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
                      defaultChecked={company?.tags?.some(
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
            <Label htmlFor="description" className="text-slate-300">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={company?.description || ""}
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

