import { getContacts } from "@/actions/contacts";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ContactsTable } from "./contacts-table";
import { ContactDialog } from "./contact-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface ContactsPageProps {
  searchParams: Promise<{ search?: string; tag?: string; company?: string }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.id) return null;

  const [contacts, companies, tags] = await Promise.all([
    getContacts({
      search: params.search,
      tagId: params.tag,
      companyId: params.company,
    }),
    db.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="text-slate-400 mt-1">
            Manage your contacts and relationships
          </p>
        </div>
        <ContactDialog companies={companies} tags={tags}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </ContactDialog>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            name="search"
            placeholder="Search contacts..."
            defaultValue={params.search}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </form>
      </div>

      {/* Table */}
      <ContactsTable contacts={contacts} companies={companies} tags={tags} />
    </div>
  );
}

