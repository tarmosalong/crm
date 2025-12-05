import { getCompanies } from "@/actions/companies";
import { db } from "@/lib/db";
import { CompaniesTable } from "./companies-table";
import { CompanyDialog } from "./company-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface CompaniesPageProps {
  searchParams: Promise<{ search?: string; tag?: string }>;
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  
  const [companies, tags] = await Promise.all([
    getCompanies({ search: params.search, tagId: params.tag }),
    db.tag.findMany({ 
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" } 
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="text-slate-400 mt-1">
            Manage your companies and organizations
          </p>
        </div>
        <CompanyDialog tags={tags}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </CompanyDialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            name="search"
            placeholder="Search companies..."
            defaultValue={params.search}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </form>
      </div>

      {/* Table */}
      <CompaniesTable companies={companies} tags={tags} />
    </div>
  );
}

