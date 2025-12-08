import { notFound } from "next/navigation";
import { getDeal, getPipelineStages } from "@/actions/deals";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Handshake,
  Building2,
  User,
  Calendar,
  MessageSquare,
  StickyNote,
  ArrowLeft,
  Pencil,
  CheckSquare,
  Euro,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DealDialog } from "../deal-dialog";
import { AddNoteForm } from "./add-note-form";
import { AddCommunicationForm } from "./add-communication-form";
import { markDealWon, markDealLost } from "@/actions/deals";

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const [deal, stages, companies, contacts] = await Promise.all([
    getDeal(id),
    getPipelineStages(),
    db.company.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.contact.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!deal) {
    notFound();
  }

  // Serialize data
  const serializedDeal = {
    ...deal,
    value: Number(deal.value),
  };

  const openTasks = deal.tasks.filter((t) => t.status === "OPEN");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/deals">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div
            className="h-16 w-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${deal.stage.color}20` }}
          >
            <Handshake className="h-8 w-8" style={{ color: deal.stage.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{deal.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                style={{ borderColor: deal.stage.color, color: deal.stage.color }}
              >
                {deal.stage.name}
              </Badge>
              <Badge
                variant="outline"
                className={
                  deal.status === "WON"
                    ? "border-emerald-500 text-emerald-400"
                    : deal.status === "LOST"
                    ? "border-red-500 text-red-400"
                    : "border-slate-500 text-slate-400"
                }
              >
                {deal.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {deal.status === "OPEN" && (
            <>
              <form action={async () => {
                "use server";
                await markDealLost(id);
              }}>
                <Button
                  type="submit"
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Lost
                </Button>
              </form>
              <form action={async () => {
                "use server";
                await markDealWon(id);
              }}>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Won
                </Button>
              </form>
            </>
          )}
          <DealDialog
            deal={serializedDeal}
            stages={stages}
            companies={companies}
            contacts={contacts}
          >
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DealDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Deal Info */}
        <div className="space-y-6">
          {/* Value Card */}
          <Card className="bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border-indigo-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-indigo-300 mb-2">
                <Euro className="h-5 w-5" />
                <span className="text-sm font-medium">Deal Value</span>
              </div>
              <p className="text-4xl font-bold text-white">
                €{serializedDeal.value.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {deal.probability}% probability
                </span>
              </div>
              <Progress value={deal.probability} className="mt-2 h-2 bg-slate-700" />
              <p className="text-xs text-slate-500 mt-2">
                Weighted: €{Math.round(serializedDeal.value * deal.probability / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Link
                    href={`/companies/${deal.company.id}`}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {deal.company.name}
                  </Link>
                </div>
              )}
              {deal.contact && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <Link
                    href={`/contacts/${deal.contact.id}`}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    {deal.contact.name}
                  </Link>
                </div>
              )}
              {deal.expectedCloseDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">
                    Expected: {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {deal.description && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400">{deal.description}</p>
                </div>
              )}
              {deal.status === "LOST" && deal.lostReason && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500 uppercase mb-1">Lost Reason</p>
                  <p className="text-sm text-red-400">{deal.lostReason}</p>
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
                {openTasks.length} task{openTasks.length !== 1 ? "s" : ""} remaining
              </CardDescription>
            </CardHeader>
            <CardContent>
              {openTasks.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No open tasks</p>
              ) : (
                <div className="space-y-2">
                  {openTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50"
                    >
                      <span className="text-sm text-slate-300 truncate">{task.title}</span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-500">
                          {format(new Date(task.dueDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Link href={`/tasks?dealId=${deal.id}`}>
                <Button variant="ghost" className="w-full mt-2 text-slate-400 hover:text-white">
                  View All Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right - Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Note */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-amber-500" />
                Add Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddNoteForm dealId={deal.id} />
            </CardContent>
          </Card>

          {/* Add Communication */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
                Log Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddCommunicationForm dealId={deal.id} contactId={deal.contactId} />
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Activity Timeline</CardTitle>
              <CardDescription className="text-slate-400">
                Recent notes and communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deal.notes.length === 0 && deal.communications.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {/* Combine and sort by date */}
                  {[
                    ...deal.notes.map((n) => ({ ...n, type: "note" as const, date: n.createdAt })),
                    ...deal.communications.map((c) => ({ ...c, type: "comm" as const })),
                  ]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 rounded-lg bg-slate-900/50"
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                            item.type === "note"
                              ? "bg-amber-500/20"
                              : "bg-emerald-500/20"
                          }`}
                        >
                          {item.type === "note" ? (
                            <StickyNote className="h-4 w-4 text-amber-400" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {item.type === "comm" && "subject" in item && (
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                                {item.type === "comm" && "type" in item ? item.type : ""}
                              </Badge>
                              <span className="text-sm font-medium text-white">
                                {item.subject}
                              </span>
                            </div>
                          )}
                          <p className="text-sm text-slate-300">
                            {item.type === "note" ? item.content : "description" in item ? item.description : ""}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                            <span>{item.author.name}</span>
                            <span>•</span>
                            <span>{format(new Date(item.date), "MMM d, yyyy 'at' HH:mm")}</span>
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


