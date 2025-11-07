import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, TrendingUp, Shield, LogIn, CreditCard, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import bannerImage from "@/assets/school-payment-banner.jpg";
import eduKashLogo from "@/assets/edukash-logo.png";
import { SubscriptionPaymentDialog } from "@/components/payments/SubscriptionPaymentDialog";
import { toast } from "sonner";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<{
    type: "monthly" | "annual";
    amount: number;
  } | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubscriptionClick = (type: "monthly" | "annual", amount: number) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour souscrire à un abonnement");
      navigate("/auth");
      return;
    }
    setSelectedSubscription({ type, amount });
    setPaymentDialogOpen(true);
  };
  const features = [
    "Gestion complète des élèves et inscriptions",
    "Suivi des paiements et retards automatiques",
    "Génération de certificats et documents",
    "Statistiques et rapports détaillés",
    "Interface moderne et intuitive",
    "Sécurisé et conforme aux normes",
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Élèves gérés" },
    { icon: TrendingUp, value: "99%", label: "Satisfaction" },
    { icon: Shield, value: "100%", label: "Sécurisé" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton de connexion */}
      <header className="absolute top-0 left-0 right-0 z-20 backdrop-blur-sm bg-background/80 border-b border-border/50">
        <div className="h-1 bg-[image:var(--gradient-hero)]"></div>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img 
            src={eduKashLogo} 
            alt="EduKash" 
            className="h-14 w-auto object-contain animate-fade-in"
          />
          <Link to="/auth">
            <Button variant="secondary" className="gap-2 shadow-soft hover:shadow-card transition-all duration-300">
              <LogIn className="h-4 w-4" />
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      {/* Modern Hero Banner with Image */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={bannerImage} 
            alt="Parents d'élèves effectuant un paiement de scolarité"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-primary/80"></div>
        
        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[image:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--primary-foreground))_10px,hsl(var(--primary-foreground))_11px)]"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium border border-white/30 shadow-glow">
                <Shield className="h-4 w-4" />
                Gestion Scolaire et Paiements
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
                Simplifiez la gestion de votre{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">établissement</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-secondary/50 -rotate-1"></span>
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto lg:mx-0">
                EduKash permet de gérer inscriptions, paiements et finances en toute simplicité. 
                Centralisez vos données, optimisez vos processus et gagnez en efficacité.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="text-lg px-8 gap-2 shadow-elegant hover:shadow-glow hover-scale">
                    Commencer gratuitement
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 w-full lg:w-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover-scale shadow-card hover:shadow-elegant min-w-[280px]"
                  style={{animationDelay: `${0.3 + index * 0.1}s`}}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary/20 p-3 rounded-xl">
                      <stat.icon className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="hsl(var(--background))" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-scale-in">
            <Shield className="h-4 w-4" />
            Gestion scolaire intelligente
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight animate-fade-in">
            Digitalisez votre établissement avec
            <span className="relative inline-block ml-3">
              <span className="relative z-10 text-primary">EduKash</span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 blur-sm"></span>
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.1s'}}>
            La solution complète et moderne pour gérer les inscriptions, les paiements, 
            les retards et tous les aspects administratifs et financiers de votre établissement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="text-lg px-8 shadow-elegant hover:shadow-glow hover-scale w-full sm:w-auto">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-lg px-8 gap-2 hover-scale w-full sm:w-auto">
                <LogIn className="h-5 w-5" />
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[image:var(--gradient-overlay)] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une plateforme complète pour moderniser la gestion de votre établissement
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-card shadow-card hover:shadow-elegant transition-all duration-300 hover-scale border border-border/50 hover:border-primary/20 animate-fade-in group"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="rounded-full bg-[image:var(--gradient-primary)] p-2 mt-1 flex-shrink-0 shadow-soft group-hover:shadow-glow transition-shadow">
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="text-foreground font-medium text-base md:text-lg">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[image:radial-gradient(circle_at_center,hsl(var(--primary))_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 space-y-4 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Tarifs Transparents
            </h2>
            <p className="text-muted-foreground text-lg">
              Choisissez la formule qui correspond à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Abonnement Mensuel */}
            <div className="bg-card rounded-2xl shadow-card hover:shadow-elegant transition-all duration-300 p-8 border-2 border-border hover:border-primary/30 hover-scale animate-fade-in group">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[image:var(--gradient-primary)] mb-4 shadow-soft group-hover:shadow-glow transition-shadow">
                  <Calendar className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Abonnement Mensuel</h3>
                <p className="text-base text-muted-foreground">Flexibilité maximale</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-foreground">25 000</span>
                  <span className="text-muted-foreground text-lg">FCFA/mois</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-foreground">Accès complet à toutes les fonctionnalités</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-foreground">Support technique prioritaire</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-foreground">Mises à jour automatiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-base text-foreground">Sauvegarde quotidienne des données</span>
                </li>
              </ul>

              <Button 
                className="w-full shadow-soft hover:shadow-card transition-shadow" 
                size="lg"
                onClick={() => handleSubscriptionClick("monthly", 25000)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Choisir cette formule
              </Button>
            </div>

            {/* Abonnement Annuel */}
            <div className="bg-[image:var(--gradient-primary)] rounded-2xl shadow-elegant hover:shadow-glow p-8 border-2 border-primary relative overflow-hidden hover-scale animate-fade-in group" style={{animationDelay: '0.1s'}}>
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[image:repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--primary-foreground))_10px,hsl(var(--primary-foreground))_11px)]"></div>
              </div>

              <div className="absolute top-4 right-4 z-10">
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-soft animate-pulse">
                  ÉCONOMISEZ 17%
                </span>
              </div>

              <div className="text-center mb-6 relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mb-4 shadow-soft group-hover:shadow-glow transition-shadow">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Abonnement Annuel</h3>
                <p className="text-base text-white/90">Meilleur rapport qualité-prix</p>
              </div>
              
              <div className="text-center mb-6 relative z-10">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">300 000</span>
                  <span className="text-white/90 text-lg">FCFA/an</span>
                </div>
                <p className="text-white/80 text-sm mt-2">Soit 25 000 FCFA/mois</p>
              </div>

              <ul className="space-y-3 mb-8 relative z-10">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-base text-white">Tous les avantages de la formule mensuelle</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-base text-white">2 mois offerts sur l'année</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-base text-white">Formation personnalisée offerte</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-base text-white">Support dédié 7j/7</span>
                </li>
              </ul>

              <Button 
                variant="secondary" 
                className="w-full shadow-soft hover:shadow-card transition-shadow relative z-10" 
                size="lg"
                onClick={() => handleSubscriptionClick("annual", 300000)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Choisir cette formule
              </Button>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-8 text-sm animate-fade-in" style={{animationDelay: '0.2s'}}>
            Tous les prix sont en Francs CFA. Paiement sécurisé par Mobile Money, Virement ou Chèque.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-[image:var(--gradient-hero)] rounded-3xl p-12 text-center shadow-elegant hover:shadow-glow transition-all duration-300 relative overflow-hidden group">
          {/* Animated Background Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" style={{transitionDelay: '0.2s'}}></div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground animate-fade-in">
              Prêt à transformer votre gestion scolaire ?
            </h2>
            <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.1s'}}>
              Rejoignez les établissements qui font confiance à EduKash pour moderniser 
              leur administration et gagner en efficacité.
            </p>
            <Link to="/auth" className="inline-block animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-elegant hover:shadow-glow hover-scale">
                Créer mon compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payment Dialog */}
      {selectedSubscription && (
        <SubscriptionPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          subscriptionType={selectedSubscription.type}
          amount={selectedSubscription.amount}
        />
      )}
    </div>
  );
};

export default Home;
