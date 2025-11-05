import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  Home, Users, BookOpen, Settings, BarChart3,
  FileText, DollarSign, AlertCircle, Receipt, TrendingUp, LogOut, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import eduKashLogo from "@/assets/edukash-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const mainLinks = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/dashboard", label: "Tableau de bord", icon: BarChart3 },
  ];

  const managementLinks = [
    { to: "/students", label: "Élèves", icon: Users, description: "Gestion des élèves" },
    { to: "/classes", label: "Classes", icon: BookOpen, description: "Niveaux et classes" },
    { to: "/enrollments", label: "Inscriptions", icon: FileText, description: "Inscriptions et réinscriptions" },
  ];

  const financeLinks = [
    { to: "/payments", label: "Paiements", icon: DollarSign, description: "Encaissements et suivi" },
    { to: "/late-payments", label: "Retards", icon: AlertCircle, description: "Retards et relances" },
    { to: "/certificates", label: "Certificats", icon: Receipt, description: "Documents et attestations" },
  ];

  const analyticsLinks = [
    { to: "/reports", label: "Rapports", icon: TrendingUp, description: "Statistiques et analyses" },
    { to: "/settings", label: "Paramètres", icon: Settings, description: "Configuration" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src={eduKashLogo} 
              alt="EduKash" 
              className="h-20 sm:h-28 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Gestion
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2">
                      {managementLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.to}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={link.to}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  isActive(link.to) && "bg-accent"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div className="text-sm font-medium leading-none">{link.label}</div>
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {link.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Finances
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2">
                      {financeLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.to}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={link.to}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  isActive(link.to) && "bg-accent"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div className="text-sm font-medium leading-none">{link.label}</div>
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {link.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Plus
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4">
                      {analyticsLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.to}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={link.to}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  isActive(link.to) && "bg-accent"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div className="text-sm font-medium leading-none">{link.label}</div>
                                </div>
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {link.description}
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-3">
                {/* Main Links */}
                {mainLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t pt-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-4 mb-2">Gestion</p>
                  {managementLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <div>
                          <div>{link.label}</div>
                          <p className="text-xs text-muted-foreground">{link.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t pt-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-4 mb-2">Finances</p>
                  {financeLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <div>
                          <div>{link.label}</div>
                          <p className="text-xs text-muted-foreground">{link.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t pt-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-4 mb-2">Plus</p>
                  {analyticsLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <div>
                          <div>{link.label}</div>
                          <p className="text-xs text-muted-foreground">{link.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full mt-4 justify-start gap-3"
                >
                  <LogOut className="h-5 w-5" />
                  Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
