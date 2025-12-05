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
import { MoreHorizontal, Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { ContactDialog } from "./contact-dialog";
import { deleteContact } from "@/actions/contacts";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  companies: {
    company: { id: string; name: string };
  }[];
  tags: {
    tag: { id: string; name: string; color: string };
  }[];
  _count: {
    deals: number;
    tasks: number;
  };
}

interface ContactsTableProps {
  contacts: Contact[];
  companies: { id: string; name: string }[];
  tags: { id: string; name: string; color: string }[];
}

export function ContactsTable({ contacts, companies, tags }: ContactsTableProps) {
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    const result = await deleteContact(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Contact deleted");
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-slate-400">No contacts found</p>
        <p className="text-slate-500 text-sm mt-1">
          Add your first contact to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-400">Name</TableHead>
            <TableHead className="text-slate-400">Contact</TableHead>
            <TableHead className="text-slate-400">Company</TableHead>
            <TableHead className="text-slate-400">Tags</TableHead>
            <TableHead className="text-slate-400">Deals</TableHead>
            <TableHead className="text-slate-400 w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow
              key={contact.id}
              className="border-slate-700 hover:bg-slate-800/50"
            >
              <TableCell>
                <Link
                  href={`/contacts/${contact.id}`}
                  className="font-medium text-white hover:text-indigo-400"
                >
                  {contact.name}
                </Link>
                {contact.role && (
                  <p className="text-sm text-slate-400">{contact.role}</p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-1 text-sm text-slate-300 hover:text-white"
                    >
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 text-sm text-slate-300 hover:text-white"
                    >
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {contact.companies.map((c) => (
                  <Link
                    key={c.company.id}
                    href={`/companies/${c.company.id}`}
                    className="text-sm text-slate-300 hover:text-white"
                  >
                    {c.company.name}
                  </Link>
                ))}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((t) => (
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
              <TableCell>
                <span className="text-slate-300">{contact._count.deals}</span>
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
                    <ContactDialog
                      contact={contact}
                      companies={companies}
                      tags={tags}
                    >
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-slate-300 focus:bg-slate-700 focus:text-white"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </ContactDialog>
                    <DropdownMenuItem
                      onClick={() => handleDelete(contact.id)}
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

