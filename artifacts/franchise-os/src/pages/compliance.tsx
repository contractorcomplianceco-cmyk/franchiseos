import { useListComplianceChecks, getListComplianceChecksQueryKey, useListLocations, getListLocationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Compliance() {
  const { data: checks, isLoading: loadingChecks } = useListComplianceChecks(undefined, { query: { queryKey: getListComplianceChecksQueryKey() } });
  const { data: locations } = useListLocations({ query: { queryKey: getListLocationsQueryKey() } });

  const getLocationName = (id: number) => {
    return locations?.find((l) => l.id === id)?.name || "Unknown Location";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Compliance</h1>
          <p className="text-muted-foreground mt-1">Portfolio-wide compliance monitoring and history.</p>
        </div>
      </div>

      <Card>
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
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
                  {checks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">{getLocationName(check.locationId)}</TableCell>
                      <TableCell>{check.category}</TableCell>
                      <TableCell className="max-w-xs truncate" title={check.description}>{check.description}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          check.score >= 80 ? 'text-green-600' :
                          check.score >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {check.score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${check.status === 'pass' ? 'bg-green-50 text-green-700 border-green-200' :
                            check.status === 'warn' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'}
                        `}>
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
            <div className="text-center py-12 text-muted-foreground">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No compliance checks recorded.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
