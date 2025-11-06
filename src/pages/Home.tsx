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
      <header className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img 
            src={eduKashLogo} 
            alt="EduKash" 
            className="h-14 w-auto object-contain brightness-0 invert"
          />
          <Link to="/auth">
            <Button variant="secondary" className="gap-2">
              <LogIn className="h-4 w-4" />
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      {/* Modern Banner with Image */}
      <section className="relative overflow-hidden h-[400px] sm:h-[450px] md:h-[500px]">
        <div className="absolute inset-0">
          <img 
            src={bannerImage} 
            alt="Élèves sénégalais effectuant un paiement de scolarité"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 relative z-10 h-full flex items-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 w-full">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                Gestion Scolaire et Paiements
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2 sm:px-0">
                Simplifiez la gestion de votre établissement
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto md:mx-0 px-2 sm:px-0">
                EduKash permet de gérer inscriptions, paiements et finances en toute simplicité. 
                Centralisez vos données, optimisez vos processus et gagnez en efficacité.
              </p>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full md:w-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white mx-auto mb-1 sm:mb-2" />
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            Gestion scolaire intelligente
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight px-2">
            Digitalisez votre établissement avec
            <span className="text-primary"> EduKash</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            La solution complète et moderne pour gérer les inscriptions, les paiements, 
            les retards et tous les aspects administratifs et financiers de votre établissement.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 shadow-elegant text-white w-full sm:w-auto">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 gap-2 w-full sm:w-auto">
                <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg px-4">
              Une plateforme complète pour moderniser la gestion de votre établissement
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 rounded-lg bg-card shadow-card hover:shadow-elegant transition-shadow duration-300"
              >
                <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 mt-0.5 sm:mt-1 flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <p className="text-foreground font-medium text-sm sm:text-base md:text-lg">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Tarifs Transparents
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg px-4">
              Choisissez la formule qui correspond à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Abonnement Mensuel */}
            <div className="bg-card rounded-xl shadow-card hover:shadow-elegant transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-primary/20">
              <div className="text-center mb-5 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Abonnement Mensuel</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Flexibilité maximale</p>
              </div>
              
              <div className="text-center mb-5 sm:mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">25 000</span>
                  <span className="text-muted-foreground text-base sm:text-lg">FCFA/mois</span>
                </div>
              </div>

              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Accès complet à toutes les fonctionnalités</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Support technique prioritaire</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Mises à jour automatiques</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Sauvegarde quotidienne des données</span>
                </li>
              </ul>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleSubscriptionClick("monthly", 25000)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Choisir cette formule
              </Button>
            </div>

            {/* Abonnement Annuel */}
            <div className="bg-primary rounded-xl shadow-elegant p-6 sm:p-8 border-2 border-primary relative overflow-hidden">
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 sm:px-3 rounded-full">
                  ÉCONOMISEZ 17%
                </span>
              </div>

              <div className="text-center mb-5 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm mb-3 sm:mb-4">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Abonnement Annuel</h3>
                <p className="text-sm sm:text-base text-white/80">Meilleur rapport qualité-prix</p>
              </div>
              
              <div className="text-center mb-5 sm:mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">300 000</span>
                  <span className="text-white/80 text-base sm:text-lg">FCFA/an</span>
                </div>
                <p className="text-white/70 text-xs sm:text-sm mt-2">Soit 25 000 FCFA/mois</p>
              </div>

              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-white">Tous les avantages de la formule mensuelle</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-white">2 mois offerts sur l'année</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-white">Formation personnalisée offerte</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-white">Support dédié 7j/7</span>
                </li>
              </ul>

              <Button 
                variant="secondary" 
                className="w-full" 
                size="lg"
                onClick={() => handleSubscriptionClick("annual", 300000)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Choisir cette formule
              </Button>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-6 sm:mt-8 text-xs sm:text-sm px-4">
            Tous les prix sont en Francs CFA. Paiement sécurisé par Mobile Money, Virement ou Chèque.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto bg-primary rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-elegant">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4 px-2">
            Prêt à transformer votre gestion scolaire ?
          </h2>
          <p className="text-primary-foreground/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Rejoignez les établissements qui font confiance à EduKash pour moderniser 
            leur administration et gagner en efficacité.
          </p>
          <Link to="/auth" className="inline-block w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
              Créer mon compte
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
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
