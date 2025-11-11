import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { Payment } from "@/hooks/usePayments";

const paymentSchema = z.object({
  student_id: z.string().min(1, "Veuillez sélectionner un élève"),
  amount: z.number().min(1, "Le montant doit être supérieur à 0"),
  payment_method: z.enum(['cash', 'mobile_money', 'bank_transfer', 'check', 'other']),
  payment_type: z.enum(['tuition', 'registration', 'exam', 'transport', 'canteen', 'uniform', 'books', 'other', 'monthly_tuition']),
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
  { value: 'monthly_tuition', label: 'Scolarité mensuelle' },
  { value: 'tuition', label: 'Scolarité (autre)' },
  { value: 'registration', label: 'Inscription' },
  { value: 'exam', label: 'Examens' },
  { value: 'transport', label: 'Transport' },
  { value: 'canteen', label: 'Cantine' },
  { value: 'uniform', label: 'Uniforme' },
  { value: 'books', label: 'Manuels' },
  { value: 'other', label: 'Autre' },
];

const MONTHS = [
  { value: 'Janvier', label: 'Janvier' },
  { value: 'Février', label: 'Février' },
  { value: 'Mars', label: 'Mars' },
  { value: 'Avril', label: 'Avril' },
  { value: 'Mai', label: 'Mai' },
  { value: 'Juin', label: 'Juin' },
  { value: 'Juillet', label: 'Juillet' },
  { value: 'Août', label: 'Août' },
  { value: 'Septembre', label: 'Septembre' },
  { value: 'Octobre', label: 'Octobre' },
  { value: 'Novembre', label: 'Novembre' },
  { value: 'Décembre', label: 'Décembre' },
];

export const PaymentForm = ({ open, onOpenChange, onSubmit, paymentData, loading }: PaymentFormProps) => {
  const { students } = useStudents();
  const { classes } = useClasses();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [studentSearch, setStudentSearch] = useState<string>("");

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      student_id: paymentData?.student_id || "",
      amount: paymentData?.amount || 0,
      payment_method: paymentData?.payment_method || 'cash',
      payment_type: paymentData?.payment_type || 'monthly_tuition',
      payment_period: paymentData?.payment_period || "",
      payment_date: paymentData?.payment_date || new Date().toISOString().split('T')[0],
      transaction_reference: paymentData?.transaction_reference || "",
      notes: paymentData?.notes || "",
    },
  });

  const paymentType = form.watch('payment_type');
  const showMonthSelector = paymentType === 'monthly_tuition';

  // Auto-fill form when editing payment
  useEffect(() => {
    if (paymentData) {
      // Set class
      if (paymentData.students?.class) {
        setSelectedClass(paymentData.students.class);
      }
      
      // Set all form values
      form.reset({
        student_id: paymentData.student_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method as any,
        payment_type: paymentData.payment_type as any,
        payment_period: paymentData.payment_period || "",
        payment_date: paymentData.payment_date,
        transaction_reference: paymentData.transaction_reference || "",
        notes: paymentData.notes || "",
      });
    }
  }, [paymentData, form]);

  // Auto-fill amount when student is selected
  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const studentClass = classes.find(c => c.name === student.class);
      if (studentClass?.monthly_tuition) {
        form.setValue('amount', studentClass.monthly_tuition);
      }
    }
  };

  const handleSubmit = (data: PaymentFormData) => {
    onSubmit(data);
    form.reset();
    setSelectedClass("");
    setStudentSearch("");
  };

  // Filter students by selected class and search query
  const filteredStudents = students
    .filter(s => s.status === 'active')
    .filter(s => !selectedClass || s.class === selectedClass)
    .filter(s => {
      if (!studentSearch) return true;
      const search = studentSearch.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(search) ||
        s.matricule.toLowerCase().includes(search)
      );
    });

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
            {/* Student Info Display when editing */}
            {paymentData?.students && (
              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Informations de l&apos;élève
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom complet</p>
                    <p className="font-semibold text-foreground">{paymentData.students.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Matricule</p>
                    <p className="font-semibold text-foreground">{paymentData.students.matricule}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Classe</p>
                    <p className="font-semibold text-foreground">{paymentData.students.class}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">N° Reçu</p>
                    <p className="font-semibold text-primary">{paymentData.receipt_number}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Auto-generated reference display for new payments */}
            {!paymentData && (
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Référence de paiement (générée automatiquement)
                </p>
                <p className="text-lg font-mono font-bold text-primary">
                  REC{new Date().getFullYear().toString().slice(-2)}XXXXXX
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Le numéro sera généré lors de l'enregistrement
                </p>
              </div>
            )}

            {/* Class Selection First */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Classe sélectionnée *</label>
              <Select 
                value={selectedClass} 
                onValueChange={setSelectedClass}
                disabled={!!paymentData?.students?.class}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une classe..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name} ({cls.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedClass && !paymentData?.students?.class && (
                <p className="text-xs text-muted-foreground">
                  Sélectionnez d&apos;abord une classe pour afficher les élèves
                </p>
              )}
              {paymentData?.students?.class && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Classe pré-sélectionnée pour cet élève
                </p>
              )}
            </div>

            {/* Student Search Field - Show if class is selected */}
            {selectedClass && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rechercher un élève</label>
                <div className="relative">
                  <Input
                    placeholder="Rechercher par nom ou matricule..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pr-10"
                  />
                  {studentSearch && (
                    <button
                      type="button"
                      onClick={() => setStudentSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredStudents.length} élève(s) trouvé(s)
                </p>
              </div>
            )}

            {/* Student Selection */}
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Élève *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleStudentChange(value);
                    }}
                    value={field.value}
                    disabled={!selectedClass || !!paymentData?.students?.full_name}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          paymentData?.students?.full_name 
                            ? `${paymentData.students.full_name} (${paymentData.students.matricule})`
                            : selectedClass 
                              ? "Sélectionner un élève..." 
                              : "Sélectionnez d'abord une classe"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {paymentData?.students?.full_name ? (
                        <SelectItem value={paymentData.student_id}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{paymentData.students.matricule}</span>
                            <span className="font-medium">{paymentData.students.full_name}</span>
                          </div>
                        </SelectItem>
                      ) : filteredStudents.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          {studentSearch ? "Aucun élève trouvé pour cette recherche" : "Aucun élève trouvé dans cette classe"}
                        </div>
                      ) : (
                        filteredStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{student.matricule}</span>
                              <span className="font-medium">{student.full_name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {paymentData?.students?.full_name && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ Élève pré-sélectionné
                    </p>
                  )}
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

            {showMonthSelector && (
              <FormField
                control={form.control}
                name="payment_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mois concerné *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un mois" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label} {new Date().getFullYear()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chaque mois ne peut être payé qu&apos;une seule fois
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
