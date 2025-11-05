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
        <div ref={receiptRef} className="bg-white p-8 border-2 border-gray-800 rounded-lg print:border-2 print:bg-white">
          {/* Header with Logo */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-800">
            <div className="flex-1">
              {schoolInfo.logo_url && (
                <img 
                  src={schoolInfo.logo_url} 
                  alt="Logo" 
                  className="h-16 mb-4 object-contain"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{schoolInfo.name}</h1>
              {schoolInfo.address && (
                <p className="text-sm text-gray-600">{schoolInfo.address}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                {schoolInfo.phone && <span>Tél: {schoolInfo.phone}</span>}
                {schoolInfo.email && <span>Email: {schoolInfo.email}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="border-2 border-gray-800 px-4 py-2 rounded-lg bg-white">
                <p className="text-xs text-gray-600 mb-1">N° Reçu</p>
                <p className="text-lg font-bold font-mono text-gray-900">{payment.receipt_number}</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {format(new Date(payment.payment_date), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">REÇU DE PAIEMENT</h2>
          </div>

          {/* Student Info */}
          <div className="mb-8 p-4 border-2 border-gray-300 rounded-lg bg-white">
            <h3 className="font-semibold mb-3 text-lg text-gray-900">Informations de l'élève</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium text-gray-900">{payment.students?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Matricule</p>
                <p className="font-medium font-mono text-gray-900">{payment.students?.matricule}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Classe</p>
                <p className="font-medium text-gray-900">{payment.students?.class}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3 text-lg text-gray-900">Détails du paiement</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-gray-600">Type de paiement</span>
                <span className="font-medium text-gray-900">{PAYMENT_TYPE_LABELS[payment.payment_type]}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-gray-600">Méthode de paiement</span>
                <span className="font-medium text-gray-900">{PAYMENT_METHOD_LABELS[payment.payment_method]}</span>
              </div>
              {payment.payment_period && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-gray-600">Période concernée</span>
                  <span className="font-medium text-gray-900">{payment.payment_period}</span>
                </div>
              )}
              {payment.transaction_reference && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-gray-600">Référence transaction</span>
                  <span className="font-medium font-mono text-gray-900">{payment.transaction_reference}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-gray-600">Année académique</span>
                <span className="font-medium text-gray-900">{payment.academic_year}</span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="border-4 border-gray-900 p-6 rounded-lg mb-8 bg-white">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-900 font-semibold">Montant payé</span>
              <span className="text-3xl font-bold text-gray-900">{payment.amount.toLocaleString()} FCFA</span>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="mb-8 p-4 border border-gray-300 rounded-lg bg-white">
              <p className="text-sm text-gray-600 mb-1">Notes</p>
              <p className="text-sm text-gray-900">{payment.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-gray-800 text-center">
            <p className="text-sm text-gray-600 mb-6">
              Ce reçu certifie que le paiement a été effectué et enregistré dans nos systèmes.
            </p>
            <div className="flex justify-between items-end">
              <div className="text-left">
                <p className="text-xs text-gray-600 mb-1">Date d'émission</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(payment.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-8">Signature et cachet</p>
                <div className="border-t-2 border-gray-900 w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
