import { useListLocations, getListLocationsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Store, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Locations() {
  const { data: locations, isLoading } = useListLocations({ query: { queryKey: getListLocationsQueryKey() } });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Locations</h1>
          <p className="text-muted-foreground mt-1">Manage franchise locations across your portfolio.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : locations?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(loc => (
            <Link key={loc.id} href={`/locations/${loc.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 p-2 rounded-md text-primary">
                      <Store className="w-5 h-5" />
                    </div>
                    <Badge variant={loc.status === 'active' ? 'default' : loc.status === 'onboarding' ? 'secondary' : 'destructive'} 
                           className={loc.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                      {loc.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{loc.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {loc.city}, {loc.state}
                  </div>
                  
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Compliance</span>
                    <span className={`font-bold ${
                      loc.complianceScore >= 80 ? 'text-green-600' : 
                      loc.complianceScore >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {loc.complianceScore}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
          <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No locations yet</h3>
          <p className="text-muted-foreground mb-4">Add your first franchise location to get started.</p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      )}
    </div>
  );
}
