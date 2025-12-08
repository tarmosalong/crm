import { notFound } from "next/navigation";
import { getContact } from "@/actions/contacts";
import { getTags } from "@/actions/tags";
import { getCompanies } from "@/actions/companies";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Building2,
  Handshake,
  MessageSquare,
  StickyNote,
  ArrowLeft,
  Pencil,
  Calendar,
  CheckSquare,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ContactDialog } from "../contact-dialog";

interface ContactPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { id } = await params;
  const [contact, tags, companies] = await Promise.all([
    getContact(id),
    getTags(),
    getCompanies({}),
  ]);

  if (!contact) {
    notFound();
  }

  // Serialize data for client components
  const serializedContact = {
    ...contact,
    deals: contact.deals.map((deal) => ({
      ...deal,
      value: Number(deal.value),
    })),
  };

  const totalDealsValue = serializedContact.deals.reduce((sum, d) => sum + d.value, 0);
  const openDeals = serializedContact.deals.filter((d) => d.status === "OPEN");
  const openTasks = contact.tasks.filter((t) => t.status === "OPEN");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-16 w-16 rounded-full bg-blue-600/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-400">
              {contact.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{contact.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {contact.role && (
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {contact.role}
                </Badge>
              )}
              {contact.tags.map((ct) => (
                <Badge
                  key={ct.tag.id}
                  variant="outline"
                  style={{ borderColor: ct.tag.color, color: ct.tag.color }}
                >
                  {ct.tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <ContactDialog tags={tags} companies={companies} contact={serializedContact}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </ContactDialog>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.companies.length > 0 && (
                <div className="pt-4 border-t border-slate-700 space-y-2">
                  <p className="text-xs text-slate-500 uppercase">Companies</p>
                  {contact.companies.map((cc) => (
                    <Link
                      key={cc.company.id}
                      href={`/companies/${cc.company.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-slate-300">{cc.company.name}</span>
                      {cc.isPrimary && (
                        <Badge variant="outline" className="ml-auto border-emerald-500/50 text-emerald-400 text-xs">
                          Primary
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
              {contact.notes && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500 uppercase mb-2">Notes</p>
                  <p className="text-sm text-slate-400">{contact.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-violet-500/10">
                  <Handshake className="h-5 w-5 text-violet-400 mx-auto" />
                  <p className="text-2xl font-bold text-white mt-1">
                    {openDeals.length}
                  </p>
                  <p className="text-xs text-slate-400">Open Deals</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-500/10">
                  <CheckSquare className="h-5 w-5 text-amber-400 mx-auto" />
                  <p className="text-2xl font-bold text-white mt-1">
                    {openTasks.length}
                  </p>
                  <p className="text-xs text-slate-400">Open Tasks</p>
                </div>
              </div>
              {totalDealsValue > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                  <p className="text-sm text-slate-400">Total Deal Value</p>
                  <p className="text-xl font-bold text-emerald-400">
                    €{totalDealsValue.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Deals & Tasks */}
        <div className="space-y-6">
          {/* Deals */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Handshake className="h-5 w-5 text-violet-500" />
                Deals
              </CardTitle>
              <CardDescription className="text-slate-400">
                Associated deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serializedContact.deals.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No deals yet</p>
              ) : (
                <div className="space-y-3">
                  {serializedContact.deals.slice(0, 5).map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {deal.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          €{deal.value.toLocaleString()}
                        </p>
                      </div>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-amber-500" />
                Open Tasks
              </CardTitle>
              <CardDescription className="text-slate-400">
                Tasks for this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              {openTasks.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No open tasks</p>
              ) : (
                <div className="space-y-3">
                  {openTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {task.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            task.priority === "HIGH"
                              ? "border-red-500/50 text-red-400"
                              : task.priority === "MEDIUM"
                              ? "border-amber-500/50 text-amber-400"
                              : "border-slate-500/50 text-slate-400"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.dueDate && (
                        <span className="text-xs text-slate-400">
                          {format(new Date(task.dueDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity */}
        <div className="space-y-6">
          {/* Communications */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
                Communications
              </CardTitle>
              <CardDescription className="text-slate-400">
                Recent interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contact.communications.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No communications yet</p>
              ) : (
                <div className="space-y-3">
                  {contact.communications.slice(0, 5).map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3 rounded-lg bg-slate-900/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                          {comm.type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {format(new Date(comm.date), "MMM d")}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {comm.subject}
                      </p>
                      {comm.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {comm.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        {comm.author.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-amber-500" />
                Notes
              </CardTitle>
              <CardDescription className="text-slate-400">
                Internal notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contact.contactNotes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No notes yet</p>
              ) : (
                <div className="space-y-3">
                  {contact.contactNotes.slice(0, 5).map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-slate-900/50"
                    >
                      <p className="text-sm text-slate-300">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {note.author.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(note.createdAt), "MMM d")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

