import { useListTasks, getListTasksQueryKey, useCreateTask, useUpdateTask, useDeleteTask, useListLocations, getListLocationsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, Clock, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Tasks() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: tasks, isLoading } = useListTasks(undefined, { query: { queryKey: getListTasksQueryKey() } });
  const { data: locations } = useListLocations({ query: { queryKey: getListLocationsQueryKey() } });
  
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleStatusChange = (id: number, status: "todo" | "in_progress" | "done") => {
    updateTask.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      }
    });
  };

  const filteredTasks = tasks?.filter(t => filter === "all" || t.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">Operational tasks and compliance follow-ups.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">All</Button>
        <Button variant={filter === "todo" ? "default" : "outline"} onClick={() => setFilter("todo")} size="sm">To Do</Button>
        <Button variant={filter === "in_progress" ? "default" : "outline"} onClick={() => setFilter("in_progress")} size="sm">In Progress</Button>
        <Button variant={filter === "done" ? "default" : "outline"} onClick={() => setFilter("done")} size="sm">Done</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filteredTasks?.length ? (
        <div className="grid gap-4">
          {filteredTasks.map(task => {
            const loc = locations?.find(l => l.id === task.locationId);
            return (
              <Card key={task.id} className={`overflow-hidden border-l-4 ${
                task.priority === 'high' ? 'border-l-red-500' : 
                task.priority === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{task.title}</h3>
                      <Badge variant="outline" className={
                        task.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                        task.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''
                      }>{task.status.replace('_', ' ')}</Badge>
                      {task.source === 'compliance' && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">Auto-created</Badge>
                      )}
                    </div>
                    {task.description && <p className="text-muted-foreground text-sm line-clamp-1 mb-2">{task.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {loc && <span className="font-medium text-foreground">{loc.name}</span>}
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status !== 'done' && (
                      <Button size="sm" variant="outline" onClick={() => handleStatusChange(task.id, "done")}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
