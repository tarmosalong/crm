import { notFound } from "next/navigation";
import { getCompany } from "@/actions/companies";
import { getTags } from "@/actions/tags";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Hash,
  Users,
  Handshake,
  MessageSquare,
  StickyNote,
  ArrowLeft,
  Pencil,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CompanyDialog } from "../company-dialog";

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const [company, tags] = await Promise.all([
    getCompany(id),
    getTags(),
  ]);

  if (!company) {
    notFound();
  }

  // Serialize data for client components
  const serializedCompany = {
    ...company,
    deals: company.deals.map((deal) => ({
      ...deal,
      value: Number(deal.value),
    })),
  };

  const totalDealsValue = serializedCompany.deals.reduce((sum, d) => sum + d.value, 0);
  const openDeals = serializedCompany.deals.filter((d) => d.status === "OPEN");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/companies">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="h-16 w-16 rounded-xl bg-emerald-600/20 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {company.sector && (
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  {company.sector}
                </Badge>
              )}
              {company.size && (
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  {company.size} employees
                </Badge>
              )}
              {company.tags.map((ct) => (
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
        <CompanyDialog tags={tags} company={serializedCompany}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CompanyDialog>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Company Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.regNumber && (
                <div className="flex items-center gap-3">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">{company.regNumber}</span>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">{company.address}</span>
                </div>
              )}
              {company.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <a
                    href={`mailto:${company.email}`}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {company.email}
                  </a>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <a
                    href={`tel:${company.phone}`}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {company.phone}
                  </a>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              {company.description && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400">{company.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-400 mx-auto" />
                  <p className="text-2xl font-bold text-white mt-1">
                    {company.contacts.length}
                  </p>
                  <p className="text-xs text-slate-400">Contacts</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-violet-500/10">
                  <Handshake className="h-5 w-5 text-violet-400 mx-auto" />
                  <p className="text-2xl font-bold text-white mt-1">
                    {openDeals.length}
                  </p>
                  <p className="text-xs text-slate-400">Open Deals</p>
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

        {/* Middle Column - Contacts & Deals */}
        <div className="space-y-6">
          {/* Contacts */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Contacts
              </CardTitle>
              <CardDescription className="text-slate-400">
                People at this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {company.contacts.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No contacts yet</p>
              ) : (
                <div className="space-y-3">
                  {company.contacts.map((cc) => (
                    <Link
                      key={cc.contact.id}
                      href={`/contacts/${cc.contact.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-400">
                          {cc.contact.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {cc.contact.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {cc.contact.role || cc.contact.email}
                        </p>
                      </div>
                      {cc.isPrimary && (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                          Primary
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
              {serializedCompany.deals.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No deals yet</p>
              ) : (
                <div className="space-y-3">
                  {serializedCompany.deals.slice(0, 5).map((deal) => (
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
                  {serializedCompany.deals.length > 5 && (
                    <Link href={`/deals?companyId=${company.id}`}>
                      <Button variant="ghost" className="w-full text-slate-400 hover:text-white">
                        View all {serializedCompany.deals.length} deals
                      </Button>
                    </Link>
                  )}
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
              {company.communications.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No communications yet</p>
              ) : (
                <div className="space-y-3">
                  {company.communications.slice(0, 5).map((comm) => (
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
              {company.notes.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No notes yet</p>
              ) : (
                <div className="space-y-3">
                  {company.notes.slice(0, 5).map((note) => (
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

