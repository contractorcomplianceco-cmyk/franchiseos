import { useListDocuments, getListDocumentsQueryKey, useRequestUploadUrl, useCreateDocument } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Clock, Plus, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useState } from "react";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function Documents() {
  const qc = useQueryClient();
  const { data: documents, isLoading } = useListDocuments(undefined, { query: { queryKey: getListDocumentsQueryKey() } });
  const requestUpload = useRequestUploadUrl();
  const createDocument = useCreateDocument();
  
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
        
        <ObjectUploader
          buttonClassName="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 shadow-sm"
          onGetUploadParameters={async (file) => {
            const res = await requestUpload.mutateAsync({
              data: {
                name: file.name,
                size: file.size ?? 0,
                contentType: file.type || "application/octet-stream"
              }
            });
            // We store the objectPath on the file's meta so we can read it onComplete
            file.meta.objectPath = res.objectPath;
            return {
              method: "PUT",
              url: res.uploadURL,
              headers: { "Content-Type": file.type || "application/octet-stream" }
            };
          }}
          onComplete={async (result) => {
            const uploads = result.successful;
            if (uploads && uploads.length > 0) {
              for (const upload of uploads) {
                await createDocument.mutateAsync({
                  data: {
                    name: upload.name ?? "Untitled",
                    category: "General", // default category
                    fileType: upload.type || "application/octet-stream",
                    fileSize: upload.size ?? 0,
                    objectPath: upload.meta.objectPath as string,
                  }
                });
              }
              qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
            }
          }}
        >
          <Plus className="w-4 h-4" />
          Upload Document
        </ObjectUploader>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search documents..." 
          className="pl-9 glass bg-background/40 border-border/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : filteredDocs?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc, i) => (
            <Card key={doc.id} className="glass hover:border-primary/40 transition-all duration-300 hover:shadow-md cursor-pointer group animate-in slide-in-from-bottom-2 fade-in" style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}>
              <CardContent className="p-5 flex flex-col h-full relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary ring-1 ring-primary/20 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="bg-secondary/50 backdrop-blur-sm">{doc.category}</Badge>
                </div>
                <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors leading-tight line-clamp-2">{doc.name}</h3>
                
                {doc.fileSize && (
                  <p className="text-xs text-muted-foreground mb-4">
                    {doc.fileType?.split('/').pop()?.toUpperCase() || 'FILE'} &bull; {formatBytes(doc.fileSize)}
                  </p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                  <div className="flex items-center text-[11px] text-muted-foreground font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                  </div>
                  {doc.objectPath && (
                    <a 
                      href={`/api/storage${doc.objectPath}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border/60 glass">
          <div className="bg-background/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-border">
            <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No documents found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Try adjusting your search or upload a new document to the knowledge base.</p>
        </div>
      )}
    </div>
  );
}
