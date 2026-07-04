import { useGetExpansionReadiness, getGetExpansionReadinessQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Expansion() {
  const { data: readiness, isLoading } = useGetExpansionReadiness({ query: { queryKey: getGetExpansionReadinessQueryKey() } });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Expansion Intelligence</h1>
          <p className="text-muted-foreground mt-1">Data-driven recommendations for portfolio growth by state.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : readiness?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readiness.sort((a, b) => b.readinessScore - a.readinessScore).map((state) => (
            <Card key={state.state} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{state.stateName}</CardTitle>
                    <CardDescription>{state.locationCount} existing locations</CardDescription>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    state.readinessScore >= 80 ? 'bg-green-100 text-green-700' :
                    state.readinessScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {state.readinessScore}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Avg Compliance</span>
                      <span className="font-medium">{state.avgComplianceScore}%</span>
                    </div>
                    <Progress value={state.avgComplianceScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Open Tasks</span>
                      <span className="font-medium">{state.openTaskCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-3 rounded-md text-sm flex gap-2 items-start mt-auto ${
                  state.readinessScore >= 80 ? 'bg-green-50 text-green-800' :
                  state.readinessScore >= 50 ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'
                }`}>
                  {state.readinessScore >= 80 ? <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <p>{state.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">No expansion data available.</div>
      )}
    </div>
  );
}
