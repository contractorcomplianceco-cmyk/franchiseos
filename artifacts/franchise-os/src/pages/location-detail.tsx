import { useGetLocation, getGetLocationQueryKey, useListLicenses, getListLicensesQueryKey, useListComplianceChecks, getListComplianceChecksQueryKey, useListTasks, getListTasksQueryKey, useListAudits, getListAuditsQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Store, ShieldCheck, FileText, CheckSquare, Calendar, ChevronLeft, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function LocationDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: location, isLoading: loadingLoc } = useGetLocation(id, { query: { enabled: !!id, queryKey: getGetLocationQueryKey(id) } });
  const { data: licenses, isLoading: loadingLic } = useListLicenses({ locationId: id }, { query: { enabled: !!id, queryKey: getListLicensesQueryKey({ locationId: id }) } });
  const { data: checks, isLoading: loadingChk } = useListComplianceChecks({ locationId: id }, { query: { enabled: !!id, queryKey: getListComplianceChecksQueryKey({ locationId: id }) } });
  const { data: audits, isLoading: loadingAud } = useListAudits({ locationId: id }, { query: { enabled: !!id, queryKey: getListAuditsQueryKey({ locationId: id }) } });

  if (loadingLoc) {
    return <div className="p-8 space-y-6"><Skeleton className="h-12 w-64" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!location) {
    return <div className="p-8 text-center">Location not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/locations">
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{location.name}</h1>
            <Badge variant={location.status === 'active' ? 'default' : location.status === 'onboarding' ? 'secondary' : 'destructive'} 
                   className={location.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
              {location.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {location.address ? `${location.address}, ` : ''}{location.city}, {location.state} {location.zip}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${
              location.complianceScore >= 80 ? 'text-green-600' : 
              location.complianceScore >= 50 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {location.complianceScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Overall health metric</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Owner / Operator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{location.ownerName || "Unassigned"}</div>
            {location.openedDate && <p className="text-xs text-muted-foreground mt-2">Opened: {format(new Date(location.openedDate), "MMMM yyyy")}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Licenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Licenses & Permits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLic ? <Skeleton className="h-32 w-full" /> : licenses?.length ? (
              <div className="space-y-4">
                {licenses.map(lic => (
                  <div key={lic.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                    <div>
                      <div className="font-medium">{lic.name}</div>
                      <div className="text-xs text-muted-foreground">{lic.type}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`mb-1
                        ${lic.status === 'valid' ? 'bg-green-50 text-green-700 border-green-200' : 
                          lic.status === 'expiring' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}
                      `}>{lic.status}</Badge>
                      <div className="text-xs text-muted-foreground">Exp: {format(new Date(lic.expiryDate), "MMM d, yyyy")}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">No licenses found.</p>}
          </CardContent>
        </Card>

        {/* Audits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Recent Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAud ? <Skeleton className="h-32 w-full" /> : audits?.length ? (
              <div className="space-y-4">
                {audits.map(audit => (
                  <div key={audit.id} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        Score: <span className={`font-bold ${audit.score >= 80 ? 'text-green-600' : audit.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{audit.score}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Auditor: {audit.auditor}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {format(new Date(audit.conductedAt), "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">No audits recorded.</p>}
          </CardContent>
        </Card>
        
        {/* Compliance Checks (Full width) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Compliance Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingChk ? <Skeleton className="h-32 w-full" /> : checks?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-medium">{check.category}</TableCell>
                      <TableCell>{check.description}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${check.score >= 80 ? 'text-green-600' : check.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                          {check.score}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                          ${check.status === 'pass' ? 'text-green-700 bg-green-50 border-green-200' :
                            check.status === 'warn' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200'}
                        `}>{check.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(check.checkedAt), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <p className="text-sm text-muted-foreground text-center py-4">No compliance checks found.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
