import { 
  useListConversations, 
  getListConversationsQueryKey, 
  useListConversationMessages, 
  getListConversationMessagesQueryKey, 
  useSendChatMessage,
  useDeleteConversation
} from "@workspace/api-client-react";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, MessageSquarePlus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Assistant() {
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: loadingConvs } = useListConversations({ query: { queryKey: getListConversationsQueryKey() } });
  
  const { data: messages, isLoading: loadingMsgs } = useListConversationMessages(
    activeConvId!, 
    { query: { enabled: !!activeConvId, queryKey: getListConversationMessagesQueryKey(activeConvId!) } }
  );

  const sendMessage = useSendChatMessage();
  const deleteConversation = useDeleteConversation();

  useEffect(() => {
    if (conversations?.length && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const payload = { message: input, conversationId: activeConvId || undefined };
    setInput("");

    sendMessage.mutate({ data: payload }, {
      onSuccess: (res) => {
        if (!activeConvId) {
          setActiveConvId(res.conversationId);
        }
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        if (res.conversationId) {
          queryClient.invalidateQueries({ queryKey: getListConversationMessagesQueryKey(res.conversationId) });
        }
      }
    });
  };

  const handleNewChat = () => {
    setActiveConvId(null);
  };

  const handleDelete = (id: number) => {
    deleteConversation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        if (activeConvId === id) setActiveConvId(null);
      }
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col hidden md:flex">
        <CardHeader className="p-4 border-b">
          <Button className="w-full" onClick={handleNewChat} variant="secondary">
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingConvs ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : conversations?.map(conv => (
              <div 
                key={conv.id} 
                className={`p-3 rounded-lg text-sm cursor-pointer flex justify-between items-center group transition-colors ${
                  activeConvId === conv.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                }`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <div className="truncate flex-1 pr-2">
                  <div className="font-medium truncate">{conv.title}</div>
                  <div className={`text-xs mt-1 ${activeConvId === conv.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {format(new Date(conv.createdAt), "MMM d")}
                  </div>
                </div>
                <button 
                  className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-all`}
                  onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="py-4 border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-primary" />
            FranchiseOS Assistant
          </CardTitle>
        </CardHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
          {!activeConvId && !messages?.length ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Bot className="w-16 h-16 mb-4 opacity-50 text-primary" />
              <h2 className="text-xl font-medium mb-2 text-foreground">How can I help?</h2>
              <p className="max-w-md text-center">Ask me about portfolio performance, compliance scores, upcoming expirations, or location details.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-lg">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-sm py-1.5 px-3">Which locations have compliance scores under 80?</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-sm py-1.5 px-3">Show me expiring licenses</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-sm py-1.5 px-3">Summarize recent audits</Badge>
              </div>
            </div>
          ) : loadingMsgs ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 ml-auto rounded-2xl rounded-tr-none" />
              <Skeleton className="h-24 w-3/4 rounded-2xl rounded-tl-none" />
            </div>
          ) : (
            messages?.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted text-foreground rounded-tl-sm border'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span className="text-xs opacity-70 font-medium tracking-wide uppercase">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {sendMessage.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted text-foreground rounded-tl-sm border flex items-center gap-2">
                <Bot className="w-4 h-4 animate-pulse text-primary" />
                <span className="text-sm text-muted-foreground animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your franchise operations..." 
              className="flex-1 rounded-full px-6 focus-visible:ring-primary"
              disabled={sendMessage.isPending}
            />
            <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!input.trim() || sendMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
