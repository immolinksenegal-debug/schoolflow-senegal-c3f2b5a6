import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  School,
  UserCog,
  BarChart3,
  Settings,
  Shield,
  Database,
  CreditCard,
  Wallet
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import eduKashLogo from "@/assets/edukash-logo.png";

const menuItems = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Établissements", url: "/admin/schools", icon: School },
  { title: "Utilisateurs", url: "/admin/users", icon: UserCog },
  { title: "Abonnements", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Paytech", url: "/admin/paytech", icon: Wallet },
  { title: "Rapports", url: "/admin/reports", icon: BarChart3 },
  { title: "Base de données", url: "/admin/database", icon: Database },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const SidebarContent_Component = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-center">
        {(open || isMobile) ? (
          <div className="flex items-center gap-2">
            <img src={eduKashLogo} alt="EduKash" className="h-12 w-auto" />
            <div>
              <p className="text-xs font-semibold text-primary">Super Admin</p>
            </div>
          </div>
        ) : (
          <Shield className="h-6 w-6 text-primary" />
        )}
      </div>

      <SidebarGroup>
        <SidebarGroupLabel>Administration</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                  <NavLink to={item.url} end={item.exact}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );

  if (isMobile) {
    return null; // Le trigger sera dans le header de Admin.tsx
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarContent_Component />
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminSidebarMobile({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <img src={eduKashLogo} alt="EduKash" className="h-10 w-auto" />
            <span className="text-sm font-semibold text-primary">Super Admin</span>
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">Administration</p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
