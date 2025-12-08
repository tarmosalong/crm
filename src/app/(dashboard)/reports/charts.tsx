"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";

interface PipelineChartProps {
  data: {
    stage: string;
    color: string;
    count: number;
    value: number;
  }[];
}

export function PipelineBarChart({ data }: PipelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
        <XAxis
          type="number"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="stage"
          stroke="#64748b"
          fontSize={12}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f8fafc" }}
          formatter={(value: number) => [`€${value.toLocaleString()}`, "Value"]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PipelinePieChart({ data }: PipelineChartProps) {
  const filteredData = data.filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="stage"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={{ stroke: "#64748b" }}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`€${value.toLocaleString()}`, "Value"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface MonthlyDataPoint {
  month: string;
  won: number;
  lost: number;
}

interface MonthlyChartProps {
  data: MonthlyDataPoint[];
}

export function MonthlyTrendChart({ data }: MonthlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="wonGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lostGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f8fafc" }}
          formatter={(value: number) => [`€${value.toLocaleString()}`]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="won"
          name="Won"
          stroke="#10b981"
          fill="url(#wonGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="lost"
          name="Lost"
          stroke="#ef4444"
          fill="url(#lostGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface WinRateData {
  month: string;
  rate: number;
}

interface WinRateChartProps {
  data: WinRateData[];
}

export function WinRateChart({ data }: WinRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f8fafc" }}
          formatter={(value: number) => [`${value}%`, "Win Rate"]}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#8b5cf6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DealsCountData {
  stage: string;
  count: number;
  color: string;
}

interface DealsCountChartProps {
  data: DealsCountData[];
}

export function DealsCountChart({ data }: DealsCountChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="stage" stroke="#64748b" fontSize={11} angle={-20} textAnchor="end" height={50} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#f8fafc" }}
        />
        <Bar dataKey="count" name="Deals" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

