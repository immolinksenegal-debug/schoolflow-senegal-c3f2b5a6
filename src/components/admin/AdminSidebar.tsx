import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  School,
  UserCog,
  BarChart3,
  Settings,
  Shield,
  Database
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
import eduKashLogo from "@/assets/edukash-logo.png";

const menuItems = [
  { title: "Tableau de bord", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Établissements", url: "/admin/schools", icon: School },
  { title: "Utilisateurs", url: "/admin/users", icon: UserCog },
  { title: "Rapports", url: "/admin/reports", icon: BarChart3 },
  { title: "Base de données", url: "/admin/database", icon: Database },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-center">
          {open ? (
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
      </SidebarContent>
    </Sidebar>
  );
}
