import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, GraduationCap, School, Users, TrendingUp, Shield, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import bannerImage from "@/assets/school-payment-banner.jpg";

const Home = () => {
  const features = [
    "Gestion complète des élèves et inscriptions",
    "Suivi des paiements et retards automatiques",
    "Génération de certificats et documents",
    "Statistiques et rapports détaillés",
    "Interface moderne et intuitive",
    "Sécurisé et conforme aux normes",
  ];

  const stats = [
    { icon: School, value: "500+", label: "Écoles actives" },
    { icon: Users, value: "50K+", label: "Élèves gérés" },
    { icon: TrendingUp, value: "99%", label: "Satisfaction" },
    { icon: Shield, value: "100%", label: "Sécurisé" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header avec bouton de connexion */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <School className="h-6 w-6" />
            <span className="font-bold text-xl">SchoolLink</span>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/75"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10 h-full flex items-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                <GraduationCap className="h-4 w-4" />
                Solution Multi-Établissements
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Une plateforme pour toutes vos écoles
              </h2>
              <p className="text-lg text-white/90 max-w-2xl">
                SchoolLink permet de gérer plusieurs établissements depuis une seule interface. 
                Centralisez vos données, optimisez vos processus et gagnez en efficacité.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
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
            <GraduationCap className="h-4 w-4" />
            Gestion scolaire intelligente
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Digitalisez votre établissement avec
            <span className="bg-gradient-accent bg-clip-text text-transparent"> SchoolLink</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            La solution complète et moderne pour gérer les inscriptions, les paiements, 
            les retards et tous les aspects administratifs de votre école.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 shadow-elegant">
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

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-primary rounded-2xl p-12 text-center shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à transformer votre gestion scolaire ?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Rejoignez les établissements qui font confiance à SchoolLink pour moderniser 
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
    </div>
  );
};

export default Home;
