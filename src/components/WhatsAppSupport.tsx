import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const WhatsAppSupport = () => {
  const handleWhatsAppClick = () => {
    // Remplacez ce numéro par votre numéro WhatsApp Business
    const phoneNumber = "221776543210"; // Format: code pays + numéro sans +
    const message = encodeURIComponent("Bonjour, j'ai besoin d'aide avec EduKash");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 left-6 shadow-lg z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white"
      size="lg"
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Support WhatsApp
    </Button>
  );
};
