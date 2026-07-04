import { useListDocuments, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useState } from "react";

export default function Documents() {
  const { data: documents, isLoading } = useListDocuments(undefined, { query: { queryKey: getListDocumentsQueryKey() } });
  const [search, setSearch] = useState("");

  const filteredDocs = documents?.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">SOPs, policies, and operational knowledge base.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search documents..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : filteredDocs?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => (
            <Card key={doc.id} className="hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-primary/10 p-2 rounded-md text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary">{doc.category}</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{doc.name}</h3>
                <div className="mt-auto pt-4 flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No documents found</h3>
          <p className="text-muted-foreground">Try adjusting your search or upload a new document.</p>
        </div>
      )}
    </div>
  );
}
