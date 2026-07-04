import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  CheckSquare,
  TrendingUp,
  FileText,
  MessageSquare,
  LogOut,
  Bell,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { useGetCurrentUser, getGetCurrentUserQueryKey, useGetNotifications, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import logoIcon from "@/assets/logo-mark-v3.png";
import { useNotifications } from "@/hooks/use-notifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  user: "Member",
};

function NotificationsBell() {
  const { data: initialData } = useGetNotifications({ query: { queryKey: getGetNotificationsQueryKey() } });
  const { notifications: liveNotifications, hasData } = useNotifications();

  const notifications = hasData ? liveNotifications : (initialData?.notifications || []);
  const unreadCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      n.severity === 'critical' ? 'bg-destructive' : 'bg-amber-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <div className="flex items-center text-[10px] text-muted-foreground gap-2 pt-1">
                        <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                        {n.locationName && (
                          <>
                            <span>&bull;</span>
                            <span>{n.locationName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No new notifications
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: me } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey() } });

  const displayName =
    me?.name || user?.fullName || me?.email || user?.primaryEmailAddress?.emailAddress || "Account";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-600/80 flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{displayName}</div>
          <div className="text-[11px] text-sidebar-foreground/60 truncate">
            {me ? roleLabels[me.role] ?? me.role : "…"}
          </div>
        </div>
        <button
          type="button"
          title="Sign out"
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
          className="p-2 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Locations", href: "/locations", icon: MapPin },
    { name: "Compliance", href: "/compliance", icon: ShieldCheck },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Expansion", href: "/expansion", icon: TrendingUp },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "AI Assistant", href: "/assistant", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col z-10">
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="FranchiseIntelligenceOS" className="h-8 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-[14px] leading-tight tracking-tight whitespace-nowrap">
                FranchiseIntelligence<span className="text-blue-400">OS</span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <UserMenu />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 glass border-b border-border/50 flex items-center justify-end px-8 z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <NotificationsBell />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
