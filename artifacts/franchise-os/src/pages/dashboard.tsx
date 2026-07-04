import { useGetDashboardSummary, getGetDashboardSummaryQueryKey, useGetRecentActivity, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, MapPin, CheckSquare, Clock, AlertTriangle, FileText, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-1">Portfolio overview and recent activity.</p>
        </div>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Locations" value={summary.totalLocations} subtitle={`${summary.activeLocations} active`} icon={MapPin} />
          <StatCard 
            title="Avg Compliance" 
            value={`${summary.avgComplianceScore}%`} 
            icon={ShieldCheck} 
            trend={summary.avgComplianceScore >= 80 ? "positive" : summary.avgComplianceScore < 50 ? "negative" : "neutral"}
          />
          <StatCard title="Open Tasks" value={summary.openTasks} subtitle={`${summary.overdueTasks} overdue`} icon={CheckSquare} trend={summary.overdueTasks > 0 ? "negative" : "neutral"} />
          <StatCard title="Failed Checks" value={summary.failedChecks} icon={AlertTriangle} trend={summary.failedChecks > 0 ? "negative" : "positive"} />
          <StatCard title="Expiring Licenses" value={summary.expiringLicenses} icon={Clock} trend={summary.expiringLicenses > 0 ? "warning" : "positive"} />
          <StatCard title="Documents" value={summary.documentsCount} icon={FileText} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-6">
                {activity.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="mt-1">
                      <div className={`p-2 rounded-full ${
                        item.type === 'compliance' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                        item.type === 'task' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
                        item.type === 'audit' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800'
                      }`}>
                        {item.type === 'compliance' ? <ShieldCheck size={16} /> :
                         item.type === 'task' ? <CheckSquare size={16} /> :
                         <ArrowUpRight size={16} />}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{item.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span>{format(new Date(item.timestamp), "MMM d, h:mm a")}</span>
                        {item.locationName && (
                          <>
                            <span>&bull;</span>
                            <span>{item.locationName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, trend }: { title: string, value: string | number, subtitle?: string, icon: any, trend?: "positive" | "negative" | "warning" | "neutral" }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className="mt-2">
            <Badge variant="outline" className={`
              ${trend === 'positive' ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/20' : 
                trend === 'negative' ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20' : 
                trend === 'warning' ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20' : ''}
            `}>
              {trend}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
