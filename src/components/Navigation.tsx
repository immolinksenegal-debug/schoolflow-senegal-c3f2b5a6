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
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-elegant">
      {/* Bande décorative avec gradient */}
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
              <img 
                src={eduKashLogo} 
                alt="EduKash" 
                className="relative h-20 sm:h-28 w-auto object-contain"
              />
            </div>
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
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-soft",
                    active
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-glow scale-105"
                      : "text-muted-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/80 hover:text-foreground hover:scale-105"
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
                  <NavigationMenuTrigger className="text-sm font-semibold bg-gradient-to-r from-transparent to-transparent hover:from-muted/50 hover:to-muted/30 rounded-xl transition-all duration-300">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Gestion
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-1 bg-gradient-to-br from-background via-background to-primary/5">
                      <ul className="grid gap-2 p-4 md:w-[500px] md:grid-cols-2">
                        {managementLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <li key={link.to}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={link.to}
                                  className={cn(
                                    "group block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-all duration-300 hover:shadow-soft",
                                    isActive(link.to) 
                                      ? "bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20" 
                                      : "hover:bg-gradient-to-br hover:from-muted hover:to-muted/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "p-2 rounded-lg transition-all duration-300",
                                      isActive(link.to) 
                                        ? "bg-primary text-primary-foreground shadow-glow" 
                                        : "bg-muted group-hover:bg-primary group-hover:text-primary-foreground"
                                    )}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="text-sm font-semibold leading-none">{link.label}</div>
                                  </div>
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-2">
                                    {link.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-semibold bg-gradient-to-r from-transparent to-transparent hover:from-muted/50 hover:to-muted/30 rounded-xl transition-all duration-300">
                    <span className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Finances
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-1 bg-gradient-to-br from-background via-background to-secondary/5">
                      <ul className="grid gap-2 p-4 md:w-[500px] md:grid-cols-2">
                        {financeLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <li key={link.to}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={link.to}
                                  className={cn(
                                    "group block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-all duration-300 hover:shadow-soft",
                                    isActive(link.to) 
                                      ? "bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20" 
                                      : "hover:bg-gradient-to-br hover:from-muted hover:to-muted/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "p-2 rounded-lg transition-all duration-300",
                                      isActive(link.to) 
                                        ? "bg-secondary text-secondary-foreground shadow-glow" 
                                        : "bg-muted group-hover:bg-secondary group-hover:text-secondary-foreground"
                                    )}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="text-sm font-semibold leading-none">{link.label}</div>
                                  </div>
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-2">
                                    {link.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-semibold bg-gradient-to-r from-transparent to-transparent hover:from-muted/50 hover:to-muted/30 rounded-xl transition-all duration-300">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Plus
                    </span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-1 bg-gradient-to-br from-background via-background to-accent/5">
                      <ul className="grid gap-2 p-4">
                        {analyticsLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <li key={link.to}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={link.to}
                                  className={cn(
                                    "group block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-all duration-300 hover:shadow-soft",
                                    isActive(link.to) 
                                      ? "bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20" 
                                      : "hover:bg-gradient-to-br hover:from-muted hover:to-muted/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "p-2 rounded-lg transition-all duration-300",
                                      isActive(link.to) 
                                        ? "bg-accent text-accent-foreground shadow-glow" 
                                        : "bg-muted group-hover:bg-accent group-hover:text-accent-foreground"
                                    )}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="text-sm font-semibold leading-none">{link.label}</div>
                                  </div>
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-2">
                                    {link.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="ml-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-gradient-to-r hover:from-muted hover:to-muted/50 transition-all duration-300"
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gradient-to-b from-background to-background">
              <SheetHeader className="border-b border-border/50 pb-4 mb-4">
                <SheetTitle className="text-left flex items-center gap-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"></div>
                  Menu
                </SheetTitle>
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
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-soft",
                        active
                          ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-glow"
                          : "text-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/50"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        active ? "bg-primary-foreground/20" : "bg-muted"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-border/50 pt-3 mt-3">
                  <div className="flex items-center gap-2 px-4 mb-3">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Gestion</p>
                  </div>
                  {managementLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-soft mb-1",
                          active
                            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-glow"
                            : "text-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/50"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          active ? "bg-primary-foreground/20" : "bg-muted"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div>{link.label}</div>
                          {!active && <p className="text-xs text-muted-foreground">{link.description}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-border/50 pt-3 mt-3">
                  <div className="flex items-center gap-2 px-4 mb-3">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-secondary to-transparent rounded-full"></div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Finances</p>
                  </div>
                  {financeLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-soft mb-1",
                          active
                            ? "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-glow"
                            : "text-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/50"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          active ? "bg-secondary-foreground/20" : "bg-muted"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div>{link.label}</div>
                          {!active && <p className="text-xs text-muted-foreground">{link.description}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-border/50 pt-3 mt-3">
                  <div className="flex items-center gap-2 px-4 mb-3">
                    <div className="h-0.5 w-8 bg-gradient-to-r from-accent to-transparent rounded-full"></div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Plus</p>
                  </div>
                  {analyticsLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:shadow-soft mb-1",
                          active
                            ? "bg-gradient-to-r from-accent to-accent/90 text-accent-foreground shadow-glow"
                            : "text-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/50"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          active ? "bg-accent-foreground/20" : "bg-muted"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div>{link.label}</div>
                          {!active && <p className="text-xs text-muted-foreground">{link.description}</p>}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-border/50 pt-4 mt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="w-full justify-start gap-3 rounded-xl bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 border-destructive/20 hover:border-destructive/40 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                    Déconnexion
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
