import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    "Gestion complète des élèves et inscriptions",
    "Suivi des paiements et retards automatiques",
    "Génération de certificats et documents",
    "Statistiques et rapports détaillés",
    "Interface moderne et intuitive",
    "Sécurisé et conforme aux normes",
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
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
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 shadow-elegant">
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/students">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Voir les élèves
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
          <Link to="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
