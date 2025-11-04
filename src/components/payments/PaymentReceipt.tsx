import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { Payment } from "@/hooks/usePayments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PaymentReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  schoolInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  bank_transfer: 'Virement bancaire',
  check: 'Chèque',
  other: 'Autre',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  tuition: 'Scolarité',
  registration: 'Inscription',
  exam: 'Examens',
  transport: 'Transport',
  canteen: 'Cantine',
  uniform: 'Uniforme',
  books: 'Manuels',
  other: 'Autre',
};

export const PaymentReceipt = ({ open, onOpenChange, payment, schoolInfo }: PaymentReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle>Reçu de paiement</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 print:hidden">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="bg-background p-8 border border-border rounded-lg print:border-0">
          {/* Header with Logo */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-primary">
            <div className="flex-1">
              {schoolInfo.logo_url && (
                <img 
                  src={schoolInfo.logo_url} 
                  alt="Logo" 
                  className="h-16 mb-4 object-contain"
                />
              )}
              <h1 className="text-2xl font-bold text-primary mb-2">{schoolInfo.name}</h1>
              {schoolInfo.address && (
                <p className="text-sm text-muted-foreground">{schoolInfo.address}</p>
              )}
              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                {schoolInfo.phone && <span>Tél: {schoolInfo.phone}</span>}
                {schoolInfo.email && <span>Email: {schoolInfo.email}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-primary/10 px-4 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">N° Reçu</p>
                <p className="text-lg font-bold font-mono text-primary">{payment.receipt_number}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {format(new Date(payment.payment_date), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">REÇU DE PAIEMENT</h2>
          </div>

          {/* Student Info */}
          <div className="mb-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-3 text-lg">Informations de l'élève</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{payment.students?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matricule</p>
                <p className="font-medium font-mono">{payment.students?.matricule}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classe</p>
                <p className="font-medium">{payment.students?.class}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3 text-lg">Détails du paiement</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Type de paiement</span>
                <span className="font-medium">{PAYMENT_TYPE_LABELS[payment.payment_type]}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Méthode de paiement</span>
                <span className="font-medium">{PAYMENT_METHOD_LABELS[payment.payment_method]}</span>
              </div>
              {payment.payment_period && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Période concernée</span>
                  <span className="font-medium">{payment.payment_period}</span>
                </div>
              )}
              {payment.transaction_reference && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Référence transaction</span>
                  <span className="font-medium font-mono">{payment.transaction_reference}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Année académique</span>
                <span className="font-medium">{payment.academic_year}</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-primary text-primary-foreground p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center">
              <span className="text-lg">Montant payé</span>
              <span className="text-3xl font-bold">{payment.amount.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="mb-8 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{payment.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Ce reçu certifie que le paiement a été effectué et enregistré dans nos systèmes.
            </p>
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-xs text-muted-foreground mb-1">Date d'émission</p>
                <p className="text-sm font-medium">
                  {format(new Date(payment.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-8">Signature et cachet</p>
                <div className="border-t border-foreground/20 w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
