import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Building2,
  Handshake,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { PipelineBarChart, PipelinePieChart, MonthlyTrendChart, WinRateChart, DealsCountChart } from "./charts";
import { ExportButtons } from "./export-buttons";

async function getReportData(userId: string) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  // Get pipeline stages
  const stages = await db.pipelineStage.findMany({
    orderBy: { order: "asc" },
  });

  // Deal stats by stage
  const dealsByStage = await Promise.all(
    stages
      .filter((s) => s.name !== "Won" && s.name !== "Lost" && s.name !== "Võidetud" && s.name !== "Kaotatud")
      .map(async (stage) => {
        const deals = await db.deal.aggregate({
          where: { ownerId: userId, stageId: stage.id, status: "OPEN" },
          _count: true,
          _sum: { value: true },
        });
        return {
          stage: stage.name,
          color: stage.color,
          count: deals._count,
          value: Number(deals._sum.value || 0),
        };
      })
  );

  // Won deals this month
  const wonThisMonth = await db.deal.aggregate({
    where: {
      ownerId: userId,
      status: "WON",
      wonDate: { gte: thisMonth },
    },
    _count: true,
    _sum: { value: true },
  });

  // Won deals last month
  const wonLastMonth = await db.deal.aggregate({
    where: {
      ownerId: userId,
      status: "WON",
      wonDate: { gte: lastMonth, lt: thisMonth },
    },
    _count: true,
    _sum: { value: true },
  });

  // Won this quarter
  const wonThisQuarter = await db.deal.aggregate({
    where: {
      ownerId: userId,
      status: "WON",
      wonDate: { gte: thisQuarter },
    },
    _count: true,
    _sum: { value: true },
  });

  // Lost deals this month
  const lostThisMonth = await db.deal.aggregate({
    where: {
      ownerId: userId,
      status: "LOST",
      updatedAt: { gte: thisMonth },
    },
    _count: true,
    _sum: { value: true },
  });

  // Total open pipeline
  const openPipeline = await db.deal.aggregate({
    where: { ownerId: userId, status: "OPEN" },
    _count: true,
    _sum: { value: true },
  });

  // Win rate (last 30 days)
  const closedDeals = await db.deal.count({
    where: {
      ownerId: userId,
      status: { in: ["WON", "LOST"] },
      updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  const wonDeals = await db.deal.count({
    where: {
      ownerId: userId,
      status: "WON",
      wonDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0;

  // Entity counts
  const [contactsCount, companiesCount, dealsCount] = await Promise.all([
    db.contact.count({ where: { ownerId: userId } }),
    db.company.count({ where: { ownerId: userId } }),
    db.deal.count({ where: { ownerId: userId } }),
  ]);

  // Monthly data for trend chart (last 6 months)
  const monthlyData = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const [wonData, lostData] = await Promise.all([
      db.deal.aggregate({
        where: {
          ownerId: userId,
          status: "WON",
          wonDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { value: true },
        _count: true,
      }),
      db.deal.aggregate({
        where: {
          ownerId: userId,
          status: "LOST",
          updatedAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { value: true },
        _count: true,
      }),
    ]);

    const totalClosed = wonData._count + lostData._count;
    const rate = totalClosed > 0 ? Math.round((wonData._count / totalClosed) * 100) : 0;

    monthlyData.push({
      month: monthNames[monthStart.getMonth()],
      won: Number(wonData._sum.value || 0),
      lost: Number(lostData._sum.value || 0),
      winRate: rate,
    });
  }

  return {
    dealsByStage,
    wonThisMonth: {
      count: wonThisMonth._count,
      value: Number(wonThisMonth._sum.value || 0),
    },
    wonLastMonth: {
      count: wonLastMonth._count,
      value: Number(wonLastMonth._sum.value || 0),
    },
    wonThisQuarter: {
      count: wonThisQuarter._count,
      value: Number(wonThisQuarter._sum.value || 0),
    },
    lostThisMonth: {
      count: lostThisMonth._count,
      value: Number(lostThisMonth._sum.value || 0),
    },
    openPipeline: {
      count: openPipeline._count,
      value: Number(openPipeline._sum.value || 0),
    },
    winRate,
    contactsCount,
    companiesCount,
    dealsCount,
    monthlyData,
  };
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getReportData(session.user.id);

  const monthChange = data.wonLastMonth.value > 0
    ? Math.round(((data.wonThisMonth.value - data.wonLastMonth.value) / data.wonLastMonth.value) * 100)
    : 0;

  const winRateData = data.monthlyData.map((d) => ({
    month: d.month,
    rate: d.winRate,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">
            Track your sales performance and pipeline health
          </p>
        </div>
        <ExportButtons />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-300">Won This Month</p>
                <p className="text-3xl font-bold text-white mt-1">
                  €{data.wonThisMonth.value.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {monthChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm ${
                      monthChange >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {monthChange >= 0 ? "+" : ""}
                    {monthChange}% vs last month
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Won This Quarter</p>
            <p className="text-3xl font-bold text-white mt-1">
              €{data.wonThisQuarter.value.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {data.wonThisQuarter.count} deals closed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Open Pipeline</p>
                <p className="text-3xl font-bold text-white mt-1">
                  €{data.openPipeline.value.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {data.openPipeline.count} active deals
                </p>
              </div>
              <Target className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <p className="text-sm text-slate-400">Win Rate (30 days)</p>
            <p className="text-3xl font-bold text-white mt-1">{data.winRate}%</p>
            <p className="text-sm text-slate-500 mt-2">
              {data.lostThisMonth.count} lost this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-indigo-500" />
              Monthly Performance
            </CardTitle>
            <CardDescription className="text-slate-400">
              Won vs Lost deals over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={data.monthlyData} />
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-violet-500" />
              Pipeline Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">
              Deal value by stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PipelinePieChart data={data.dealsByStage} />
          </CardContent>
        </Card>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Value Bar Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Pipeline Value by Stage
            </CardTitle>
            <CardDescription className="text-slate-400">
              Total value in each stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineBarChart data={data.dealsByStage} />
          </CardContent>
        </Card>

        {/* Win Rate Trend */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Win Rate Trend
            </CardTitle>
            <CardDescription className="text-slate-400">
              Monthly win rate percentage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WinRateChart data={winRateData} />
          </CardContent>
        </Card>
      </div>

      {/* Deals by Stage Count */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Deals Count by Stage</CardTitle>
          <CardDescription className="text-slate-400">
            Number of deals in each pipeline stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DealsCountChart data={data.dealsByStage} />
        </CardContent>
      </Card>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Contacts</p>
                <p className="text-2xl font-bold text-white">
                  {data.contactsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Companies</p>
                <p className="text-2xl font-bold text-white">
                  {data.companiesCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-violet-500/10 p-3 rounded-lg">
                <Handshake className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Deals</p>
                <p className="text-2xl font-bold text-white">
                  {data.dealsCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
