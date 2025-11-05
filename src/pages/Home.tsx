import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Users, TrendingUp, Shield, LogIn, CreditCard, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import bannerImage from "@/assets/school-payment-banner.jpg";
import eduKashLogo from "@/assets/edukash-logo.png";
import { SubscriptionPaymentDialog } from "@/components/payments/SubscriptionPaymentDialog";

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
      <section className="relative overflow-hidden h-[500px]">
        <div className="absolute inset-0">
          <img 
            src={bannerImage} 
            alt="Élèves sénégalais effectuant un paiement de scolarité"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10 h-full flex items-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                Gestion Scolaire et Paiements
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Simplifiez la gestion de votre établissement
              </h2>
              <p className="text-lg text-white/90 max-w-2xl">
                EduKash permet de gérer inscriptions, paiements et finances en toute simplicité. 
                Centralisez vos données, optimisez vos processus et gagnez en efficacité.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <stat.icon className="h-8 w-8 text-white mx-auto mb-2" />
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            Gestion scolaire intelligente
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Digitalisez votre établissement avec
            <span className="text-primary"> EduKash</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            La solution complète et moderne pour gérer les inscriptions, les paiements, 
            les retards et tous les aspects administratifs et financiers de votre établissement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 shadow-elegant text-white">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 gap-2">
                <LogIn className="h-5 w-5" />
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg">
              Une plateforme complète pour moderniser la gestion de votre établissement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-lg bg-card shadow-card hover:shadow-elegant transition-shadow duration-300"
              >
                <div className="rounded-full bg-primary/10 p-2 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-foreground font-medium text-lg">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tarifs Transparents
            </h2>
            <p className="text-muted-foreground text-lg">
              Choisissez la formule qui correspond à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Abonnement Mensuel */}
            <div className="bg-card rounded-xl shadow-card hover:shadow-elegant transition-all duration-300 p-8 border-2 border-transparent hover:border-primary/20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Abonnement Mensuel</h3>
                <p className="text-muted-foreground">Flexibilité maximale</p>
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
                  <span className="text-foreground">Accès complet à toutes les fonctionnalités</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Support technique prioritaire</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Mises à jour automatiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">Sauvegarde quotidienne des données</span>
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
            <div className="bg-primary rounded-xl shadow-elegant p-8 border-2 border-primary relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  ÉCONOMISEZ 17%
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Abonnement Annuel</h3>
                <p className="text-white/80">Meilleur rapport qualité-prix</p>
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">300 000</span>
                  <span className="text-white/80 text-lg">FCFA/an</span>
                </div>
                <p className="text-white/70 text-sm mt-2">Soit 25 000 FCFA/mois</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Tous les avantages de la formule mensuelle</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">2 mois offerts sur l'année</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Formation personnalisée offerte</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white">Support dédié 7j/7</span>
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

          <p className="text-center text-muted-foreground mt-8 text-sm">
            Tous les prix sont en Francs CFA. Paiement sécurisé par Mobile Money, Virement ou Chèque.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-primary rounded-2xl p-12 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à transformer votre gestion scolaire ?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez les établissements qui font confiance à EduKash pour moderniser 
            leur administration et gagner en efficacité.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Créer mon compte
              <ArrowRight className="ml-2 h-5 w-5" />
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
