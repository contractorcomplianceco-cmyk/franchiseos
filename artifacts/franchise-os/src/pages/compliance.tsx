import { useListComplianceChecks, getListComplianceChecksQueryKey, useListLocations, getListLocationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = {
  pass: "hsl(142, 71%, 45%)", // green
  warn: "hsl(38, 92%, 50%)", // amber
  fail: "hsl(348, 83%, 47%)", // red
};

type HeatmapRow = {
  locationId: number;
  name: string;
  cells: (number | null)[];
};

function heatColor(score: number | null): string {
  if (score === null) return "hsl(var(--muted) / 0.3)";
  if (score >= 80) return `hsl(142, 71%, 45%, ${0.35 + (score - 80) / 20 * 0.45})`;
  if (score >= 50) return `hsl(38, 92%, 50%, ${0.35 + (score - 50) / 30 * 0.45})`;
  return `hsl(348, 83%, 47%, ${0.4 + (50 - score) / 50 * 0.45})`;
}

export default function Compliance() {
  const { data: checks, isLoading: loadingChecks } = useListComplianceChecks(undefined, { query: { queryKey: getListComplianceChecksQueryKey() } });
  const { data: locations } = useListLocations({ query: { queryKey: getListLocationsQueryKey() } });

  const getLocationName = (id: number) => {
    return locations?.find((l) => l.id === id)?.name || "Unknown Location";
  };

  const chartData = useMemo(() => {
    if (!checks || !locations) return { statusData: [], locationData: [], trendData: [], heatmap: { categories: [], rows: [] as HeatmapRow[] } };

    // Status distribution
    const statusCount = { pass: 0, warn: 0, fail: 0 };
    checks.forEach(c => {
      if (c.status === 'pass') statusCount.pass++;
      else if (c.status === 'warn') statusCount.warn++;
      else if (c.status === 'fail') statusCount.fail++;
    });
    const statusData = [
      { name: "Pass", value: statusCount.pass, fill: COLORS.pass },
      { name: "Warning", value: statusCount.warn, fill: COLORS.warn },
      { name: "Fail", value: statusCount.fail, fill: COLORS.fail },
    ].filter(d => d.value > 0);

    // Score per location
    const locScores: Record<number, { sum: number, count: number }> = {};
    checks.forEach(c => {
      if (!locScores[c.locationId]) locScores[c.locationId] = { sum: 0, count: 0 };
      locScores[c.locationId].sum += c.score;
      locScores[c.locationId].count += 1;
    });

    const locationData = Object.entries(locScores).map(([locId, data]) => ({
      name: getLocationName(Number(locId)),
      score: Math.round(data.sum / data.count)
    })).sort((a, b) => b.score - a.score).slice(0, 10); // Top 10 worst/best doesn't matter, just show some

    // Trend over time: average score grouped by month
    const monthly: Record<string, { sum: number, count: number, ts: number }> = {};
    checks.forEach(c => {
      const d = new Date(c.checkedAt);
      if (Number.isNaN(d.getTime())) return;
      const key = format(d, "MMM yyyy");
      const ts = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      if (!monthly[key]) monthly[key] = { sum: 0, count: 0, ts };
      monthly[key].sum += c.score;
      monthly[key].count += 1;
    });
    const trendData = Object.entries(monthly)
      .map(([label, v]) => ({ label, score: Math.round(v.sum / v.count), ts: v.ts }))
      .sort((a, b) => a.ts - b.ts);

    // Heatmap: locations (rows) x categories (cols), colored by avg score
    const categories = Array.from(new Set(checks.map(c => c.category))).sort();
    const cellMap: Record<string, { sum: number, count: number }> = {};
    checks.forEach(c => {
      const key = `${c.locationId}::${c.category}`;
      if (!cellMap[key]) cellMap[key] = { sum: 0, count: 0 };
      cellMap[key].sum += c.score;
      cellMap[key].count += 1;
    });
    const rows: HeatmapRow[] = Object.keys(locScores)
      .map(Number)
      .map(locId => ({
        locationId: locId,
        name: getLocationName(locId),
        cells: categories.map(cat => {
          const cell = cellMap[`${locId}::${cat}`];
          return cell ? Math.round(cell.sum / cell.count) : null;
        }),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 12);

    return { statusData, locationData, trendData, heatmap: { categories, rows } };
  }, [checks, locations]);

  const pieChartConfig = {
    value: { label: "Checks" },
    pass: { label: "Pass", color: COLORS.pass },
    warn: { label: "Warning", color: COLORS.warn },
    fail: { label: "Fail", color: COLORS.fail },
  };

  const barChartConfig = {
    score: { label: "Avg Score", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Compliance</h1>
          <p className="text-muted-foreground mt-1">Portfolio-wide compliance monitoring and history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Overall breakdown of all compliance checks</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingChecks ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : chartData.statusData.length > 0 ? (
              <ChartContainer config={pieChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {chartData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Average Score by Location</CardTitle>
            <CardDescription>Performance comparison across portfolio</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loadingChecks ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : chartData.locationData.length > 0 ? (
              <ChartContainer config={barChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.locationData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Compliance Trend</CardTitle>
          <CardDescription>Average score over time across all checks</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loadingChecks ? (
            <Skeleton className="w-full h-full rounded-xl" />
          ) : chartData.trendData.length > 0 ? (
            <ChartContainer config={barChartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-score)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ stroke: 'hsl(var(--border))' }} content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} fill="url(#trendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Risk Heatmap</CardTitle>
          <CardDescription>Average score by location and category — spot weak areas at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingChecks ? (
            <Skeleton className="w-full h-64 rounded-xl" />
          ) : chartData.heatmap.rows.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="flex items-end gap-1 mb-1">
                  <div className="w-40 flex-shrink-0" />
                  {chartData.heatmap.categories.map((cat) => (
                    <div key={cat} className="w-20 flex-shrink-0 text-[10px] text-muted-foreground text-center leading-tight px-1 truncate" title={cat}>
                      {cat}
                    </div>
                  ))}
                </div>
                {chartData.heatmap.rows.map((row) => (
                  <div key={row.locationId} className="flex items-center gap-1 mb-1">
                    <div className="w-40 flex-shrink-0 text-xs font-medium truncate pr-2" title={row.name}>{row.name}</div>
                    {row.cells.map((score, i) => (
                      <div
                        key={i}
                        className="w-20 h-10 flex-shrink-0 rounded-md flex items-center justify-center text-xs font-semibold text-foreground/90 border border-border/40"
                        style={{ backgroundColor: heatColor(score) }}
                        title={score === null ? "No data" : `${score}%`}
                      >
                        {score === null ? "–" : `${score}`}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: heatColor(95) }} /> Strong (≥80)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: heatColor(65) }} /> At risk (50–79)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: heatColor(30) }} /> Critical (&lt;50)</span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingChecks ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : checks?.length ? (
            <div className="rounded-lg border overflow-hidden bg-background/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Checked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check, i) => (
                    <TableRow key={check.id} className="animate-in slide-in-from-left-2 fade-in hover:bg-muted/30" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
                      <TableCell className="font-medium">{getLocationName(check.locationId)}</TableCell>
                      <TableCell>{check.category}</TableCell>
                      <TableCell className="max-w-xs truncate" title={check.description}>{check.description}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          check.score >= 80 ? 'text-green-600 dark:text-green-500' :
                          check.score >= 50 ? 'text-amber-600 dark:text-amber-500' : 'text-red-600 dark:text-red-500'
                        }`}>
                          {check.score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`shadow-sm ${
                          check.status === 'pass' ? 'bg-green-50/50 text-green-700 border-green-200 dark:bg-green-950/30' :
                            check.status === 'warn' ? 'bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-950/30' :
                            'bg-red-50/50 text-red-700 border-red-200 dark:bg-red-950/30'
                        }`}>
                          {check.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(check.checkedAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border/60">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No compliance checks recorded.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
