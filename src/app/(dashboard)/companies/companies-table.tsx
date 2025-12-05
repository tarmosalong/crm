"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Globe, Pencil, Trash2 } from "lucide-react";
import { CompanyDialog } from "./company-dialog";
import { deleteCompany } from "@/actions/companies";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  sector: string | null;
  size: string | null;
  website: string | null;
  tags: {
    tag: { id: string; name: string; color: string };
  }[];
  _count: {
    contacts: number;
    deals: number;
  };
}

interface CompaniesTableProps {
  companies: Company[];
  tags: { id: string; name: string; color: string }[];
}

export function CompaniesTable({ companies, tags }: CompaniesTableProps) {
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    
    const result = await deleteCompany(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Company deleted");
    }
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-slate-400">No companies found</p>
        <p className="text-slate-500 text-sm mt-1">
          Add your first company to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-400">Company</TableHead>
            <TableHead className="text-slate-400">Sector</TableHead>
            <TableHead className="text-slate-400">Size</TableHead>
            <TableHead className="text-slate-400">Tags</TableHead>
            <TableHead className="text-slate-400">Contacts</TableHead>
            <TableHead className="text-slate-400">Deals</TableHead>
            <TableHead className="text-slate-400 w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow
              key={company.id}
              className="border-slate-700 hover:bg-slate-800/50"
            >
              <TableCell>
                <Link
                  href={`/companies/${company.id}`}
                  className="font-medium text-white hover:text-indigo-400"
                >
                  {company.name}
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 mt-0.5"
                  >
                    <Globe className="h-3 w-3" />
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </TableCell>
              <TableCell className="text-slate-300">
                {company.sector || "-"}
              </TableCell>
              <TableCell className="text-slate-300">
                {company.size || "-"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {company.tags.map((t) => (
                    <Badge
                      key={t.tag.id}
                      variant="outline"
                      style={{
                        borderColor: t.tag.color,
                        color: t.tag.color,
                      }}
                    >
                      {t.tag.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-slate-300">
                {company._count.contacts}
              </TableCell>
              <TableCell className="text-slate-300">
                {company._count.deals}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-slate-800 border-slate-700"
                  >
                    <CompanyDialog company={company} tags={tags}>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-slate-300 focus:bg-slate-700 focus:text-white"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </CompanyDialog>
                    <DropdownMenuItem
                      onClick={() => handleDelete(company.id)}
                      className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

