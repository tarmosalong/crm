import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Building2,
  Handshake,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  Trophy,
  XCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { UpcomingTasks } from "./upcoming-tasks";
import { RecentDeals } from "./recent-deals";

async function getDashboardStats(userId: string) {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    contactsCount,
    companiesCount,
    openDealsCount,
    openDealsValue,
    wonDealsThisMonth,
    wonDealsLastMonth,
    lostDealsThisMonth,
    openTasksCount,
    overdueTasksCount,
    recentDeals,
    upcomingTasks,
    pipelineStages,
    totalWonAllTime,
    totalLostAllTime,
  ] = await Promise.all([
    db.contact.count({ where: { ownerId: userId } }),
    db.company.count({ where: { ownerId: userId } }),
    db.deal.count({ where: { ownerId: userId, status: "OPEN" } }),
    db.deal.aggregate({
      where: { ownerId: userId, status: "OPEN" },
      _sum: { value: true },
    }),
    // Won this month
    db.deal.aggregate({
      where: {
        ownerId: userId,
        status: "WON",
        wonDate: { gte: startOfMonth },
      },
      _sum: { value: true },
      _count: true,
    }),
    // Won last month
    db.deal.aggregate({
      where: {
        ownerId: userId,
        status: "WON",
        wonDate: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { value: true },
      _count: true,
    }),
    // Lost this month
    db.deal.aggregate({
      where: {
        ownerId: userId,
        status: "LOST",
        updatedAt: { gte: startOfMonth },
      },
      _sum: { value: true },
      _count: true,
    }),
    db.task.count({ where: { assigneeId: userId, status: "OPEN" } }),
    db.task.count({
      where: {
        assigneeId: userId,
        status: "OPEN",
        dueDate: { lt: today },
      },
    }),
    db.deal.findMany({
      where: { ownerId: userId, status: "OPEN" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        value: true,
        currency: true,
        probability: true,
        description: true,
        expectedCloseDate: true,
        status: true,
        company: { select: { name: true } },
        contact: { select: { name: true } },
        stage: { select: { name: true, color: true } },
      },
    }),
    db.task.findMany({
      where: {
        assigneeId: userId,
        status: "OPEN",
        dueDate: { gte: today },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        dueDate: true,
        priority: true,
        status: true,
        contact: { select: { name: true } },
        deal: { select: { name: true } },
      },
    }),
    // Pipeline stages with deal counts and values
    db.pipelineStage.findMany({
      where: {
        deals: {
          some: { ownerId: userId, status: "OPEN" },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        order: true,
        deals: {
          where: { ownerId: userId, status: "OPEN" },
          select: { value: true },
        },
      },
      orderBy: { order: "asc" },
    }),
    // Total won all time
    db.deal.aggregate({
      where: { ownerId: userId, status: "WON" },
      _count: true,
    }),
    // Total lost all time
    db.deal.aggregate({
      where: { ownerId: userId, status: "LOST" },
      _count: true,
    }),
  ]);

  // Calculate pipeline breakdown
  const pipelineBreakdown = pipelineStages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    color: stage.color,
    count: stage.deals.length,
    value: stage.deals.reduce((sum, d) => sum + Number(d.value), 0),
  }));

  // Serialize Decimal values for client components
  const serializedRecentDeals = recentDeals.map((deal) => ({
    ...deal,
    value: Number(deal.value),
  }));

  // Serialize tasks for client component
  const serializedTasks = upcomingTasks.map((task) => ({
    ...task,
    dueDate: task.dueDate,
  }));

  // Calculate win rate
  const totalClosedDeals = totalWonAllTime._count + totalLostAllTime._count;
  const winRate = totalClosedDeals > 0 ? Math.round((totalWonAllTime._count / totalClosedDeals) * 100) : 0;

  // Calculate month-over-month change
  const wonThisMonthValue = Number(wonDealsThisMonth._sum.value || 0);
  const wonLastMonthValue = Number(wonDealsLastMonth._sum.value || 0);
  const monthChange = wonLastMonthValue > 0 
    ? Math.round(((wonThisMonthValue - wonLastMonthValue) / wonLastMonthValue) * 100)
    : wonThisMonthValue > 0 ? 100 : 0;

  // Calculate weighted pipeline value
  const weightedPipeline = serializedRecentDeals.reduce(
    (sum, deal) => sum + deal.value * (deal.probability / 100),
    0
  );

  return {
    contactsCount,
    companiesCount,
    openDealsCount,
    openDealsValue: Number(openDealsValue._sum.value || 0),
    wonDealsThisMonth: {
      count: wonDealsThisMonth._count,
      value: wonThisMonthValue,
    },
    wonDealsLastMonth: {
      count: wonDealsLastMonth._count,
      value: wonLastMonthValue,
    },
    lostDealsThisMonth: {
      count: lostDealsThisMonth._count,
      value: Number(lostDealsThisMonth._sum.value || 0),
    },
    openTasksCount,
    overdueTasksCount,
    recentDeals: serializedRecentDeals,
    upcomingTasks: serializedTasks,
    pipelineBreakdown,
    winRate,
    monthChange,
    weightedPipeline,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const stats = await getDashboardStats(session.user.id);

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.contactsCount,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/contacts",
    },
    {
      title: "Companies",
      value: stats.companiesCount,
      icon: Building2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      href: "/companies",
    },
    {
      title: "Open Deals",
      value: stats.openDealsCount,
      subValue: `€${Number(stats.openDealsValue).toLocaleString()}`,
      icon: Handshake,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      href: "/deals",
    },
    {
      title: "Open Tasks",
      value: stats.openTasksCount,
      subValue: stats.overdueTasksCount > 0 ? `${stats.overdueTasksCount} overdue` : undefined,
      subValueColor: stats.overdueTasksCount > 0 ? "text-red-400" : undefined,
      icon: stats.overdueTasksCount > 0 ? AlertTriangle : CheckSquare,
      color: stats.overdueTasksCount > 0 ? "text-red-500" : "text-amber-500",
      bgColor: stats.overdueTasksCount > 0 ? "bg-red-500/10" : "bg-amber-500/10",
      href: "/tasks",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your sales today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {stat.value}
                    </p>
                    {stat.subValue && (
                      <p className={`text-sm mt-1 ${stat.subValueColor || "text-slate-400"}`}>
                        {stat.subValue}
                      </p>
                    )}
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Won This Month */}
        <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/5 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-300">Won This Month</p>
                </div>
                <p className="text-3xl font-bold text-white mt-2">
                  €{stats.wonDealsThisMonth.value.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-300/70 mt-1">
                  {stats.wonDealsThisMonth.count} deal{stats.wonDealsThisMonth.count !== 1 ? "s" : ""} closed
                </p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stats.monthChange >= 0 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/20 text-red-400"
              }`}>
                {stats.monthChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stats.monthChange >= 0 ? "+" : ""}{stats.monthChange}%
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-500/20">
              <p className="text-xs text-slate-400">
                Last month: €{stats.wonDealsLastMonth.value.toLocaleString()} ({stats.wonDealsLastMonth.count} deals)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lost This Month */}
        <Card className="bg-gradient-to-br from-red-600/20 to-red-500/5 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <p className="text-sm font-medium text-red-300">Lost This Month</p>
                </div>
                <p className="text-3xl font-bold text-white mt-2">
                  €{stats.lostDealsThisMonth.value.toLocaleString()}
                </p>
                <p className="text-sm text-red-300/70 mt-1">
                  {stats.lostDealsThisMonth.count} deal{stats.lostDealsThisMonth.count !== 1 ? "s" : ""} lost
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-500/20">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">Win Rate (All Time)</p>
                <p className="text-sm font-medium text-white">{stats.winRate}%</p>
              </div>
              <Progress value={stats.winRate} className="mt-2 h-1.5 bg-slate-700" />
            </div>
          </CardContent>
        </Card>

        {/* Weighted Pipeline */}
        <Card className="bg-gradient-to-br from-violet-600/20 to-violet-500/5 border-violet-500/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-violet-400" />
                  <p className="text-sm font-medium text-violet-300">Weighted Pipeline</p>
                </div>
                <p className="text-3xl font-bold text-white mt-2">
                  €{Math.round(stats.weightedPipeline).toLocaleString()}
                </p>
                <p className="text-sm text-violet-300/70 mt-1">
                  Expected revenue
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-violet-500/20">
              <p className="text-xs text-slate-400">
                Total pipeline: €{stats.openDealsValue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Breakdown */}
      {stats.pipelineBreakdown.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Pipeline Breakdown
            </CardTitle>
            <CardDescription className="text-slate-400">
              Deals by stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pipelineBreakdown.map((stage) => {
                const percentage = stats.openDealsValue > 0 
                  ? (stage.value / stats.openDealsValue) * 100 
                  : 0;
                return (
                  <div key={stage.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={{ borderColor: stage.color, color: stage.color }}
                        >
                          {stage.name}
                        </Badge>
                        <span className="text-sm text-slate-400">
                          {stage.count} deal{stage.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">
                        €{stage.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: stage.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Handshake className="h-5 w-5 text-violet-500" />
              Recent Deals
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your latest deal activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentDeals deals={stats.recentDeals} />
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription className="text-slate-400">
              Tasks due soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingTasks tasks={stats.upcomingTasks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
