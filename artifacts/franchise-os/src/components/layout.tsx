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
} from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import logoIcon from "@/assets/logo-icon.png";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  user: "Member",
};

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
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col">
        <div className="h-20 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="FranchiseIntelligenceOS" className="h-11 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-[15px] leading-tight tracking-tight whitespace-nowrap">
                FranchiseIntelligence<span className="text-blue-400">OS</span>
              </div>
              <div className="text-[9px] tracking-[0.18em] text-sidebar-foreground/50 uppercase mt-0.5">
                Intelligence. Compliance. Growth.
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <UserMenu />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
