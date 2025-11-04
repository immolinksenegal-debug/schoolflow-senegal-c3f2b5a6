import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Receipt, AlertCircle } from "lucide-react";

interface EnrollmentApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentData?: {
    student_name: string;
    requested_class: string;
    amount_paid: number;
    total_amount: number;
    remaining: number;
    receipt_number?: string;
  };
}

export const EnrollmentApprovalDialog = ({
  open,
  onOpenChange,
  enrollmentData,
}: EnrollmentApprovalDialogProps) => {
  if (!enrollmentData) return null;

  const hasPayment = enrollmentData.amount_paid > 0;
  const hasRemaining = enrollmentData.remaining > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Inscription approuvée
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Élève</p>
                <p className="font-semibold text-lg">{enrollmentData.student_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classe</p>
                <p className="font-semibold">{enrollmentData.requested_class}</p>
              </div>
            </CardContent>
          </Card>

          {hasPayment && (
            <>
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Receipt className="h-4 w-4" />
                  <h3 className="font-semibold">Reçu de paiement généré</h3>
                </div>
                
                {enrollmentData.receipt_number && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Numéro de reçu</p>
                    <p className="font-mono font-semibold">{enrollmentData.receipt_number}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Montant total</span>
                    <span className="font-semibold">{enrollmentData.total_amount.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Montant payé</span>
                    <span className="font-semibold">{enrollmentData.amount_paid.toLocaleString()} FCFA</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Restant à payer</span>
                    <span className={`font-bold ${hasRemaining ? 'text-orange-600' : 'text-green-600'}`}>
                      {enrollmentData.remaining.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {hasRemaining && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-orange-600">Paiement incomplet</p>
                <p className="text-muted-foreground">
                  L'élève doit encore payer {enrollmentData.remaining.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
