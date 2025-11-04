import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStudents } from "@/hooks/useStudents";
import { Payment } from "@/hooks/usePayments";

const paymentSchema = z.object({
  student_id: z.string().min(1, "Veuillez sélectionner un élève"),
  amount: z.number().min(1, "Le montant doit être supérieur à 0"),
  payment_method: z.enum(['cash', 'mobile_money', 'bank_transfer', 'check', 'other']),
  payment_type: z.enum(['tuition', 'registration', 'exam', 'transport', 'canteen', 'uniform', 'books', 'other']),
  payment_period: z.string().optional(),
  payment_date: z.string().optional(),
  transaction_reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PaymentFormData) => void;
  paymentData?: Payment;
  loading?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'check', label: 'Chèque' },
  { value: 'other', label: 'Autre' },
];

const PAYMENT_TYPES = [
  { value: 'tuition', label: 'Scolarité' },
  { value: 'registration', label: 'Inscription' },
  { value: 'exam', label: 'Examens' },
  { value: 'transport', label: 'Transport' },
  { value: 'canteen', label: 'Cantine' },
  { value: 'uniform', label: 'Uniforme' },
  { value: 'books', label: 'Manuels' },
  { value: 'other', label: 'Autre' },
];

export const PaymentForm = ({ open, onOpenChange, onSubmit, paymentData, loading }: PaymentFormProps) => {
  const { students } = useStudents();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      student_id: paymentData?.student_id || "",
      amount: paymentData?.amount || 0,
      payment_method: paymentData?.payment_method || 'cash',
      payment_type: paymentData?.payment_type || 'tuition',
      payment_period: paymentData?.payment_period || "",
      payment_date: paymentData?.payment_date || new Date().toISOString().split('T')[0],
      transaction_reference: paymentData?.transaction_reference || "",
      notes: paymentData?.notes || "",
    },
  });

  const handleSubmit = (data: PaymentFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{paymentData ? "Modifier le paiement" : "Enregistrer un paiement"}</DialogTitle>
          <DialogDescription>
            {paymentData ? "Modifiez les informations du paiement" : "Saisir les informations du paiement de scolarité"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Élève *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Rechercher un élève..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.filter(s => s.status === 'active').map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.matricule} - {student.full_name} ({student.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (FCFA) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du paiement *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Méthode de paiement *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de paiement *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Période concernée</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Janvier 2025, 1er Trimestre 2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transaction_reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence de transaction</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: TRX123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations complémentaires..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enregistrement..." : paymentData ? "Mettre à jour" : "Enregistrer et générer le reçu"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
