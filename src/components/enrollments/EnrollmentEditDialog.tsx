import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClasses } from "@/hooks/useClasses";
import { Enrollment } from "@/hooks/useEnrollments";

const enrollmentEditSchema = z.object({
  requested_class: z.string().min(1, "Veuillez sélectionner une classe"),
  enrollment_fee: z.number().min(0).optional(),
  payment_status: z.enum(['pending', 'partial', 'paid']),
  notes: z.string().max(500).optional(),
});

type EnrollmentEditData = z.infer<typeof enrollmentEditSchema>;

interface EnrollmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: Enrollment | null;
  onSubmit: (data: EnrollmentEditData) => void;
  loading?: boolean;
}

export const EnrollmentEditDialog = ({ open, onOpenChange, enrollment, onSubmit, loading }: EnrollmentEditDialogProps) => {
  const { classes } = useClasses();
  
  const form = useForm<EnrollmentEditData>({
    resolver: zodResolver(enrollmentEditSchema),
    defaultValues: {
      requested_class: "",
      payment_status: 'pending',
      enrollment_fee: 0,
      notes: "",
    },
  });

  // Remplir le formulaire avec les données de l'inscription
  useEffect(() => {
    if (enrollment) {
      form.reset({
        requested_class: enrollment.requested_class,
        payment_status: enrollment.payment_status,
        enrollment_fee: enrollment.enrollment_fee || 0,
        notes: enrollment.notes || "",
      });
    }
  }, [enrollment, form]);

  const handleSubmit = (data: EnrollmentEditData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'inscription</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'inscription de {enrollment?.students?.full_name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requested_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe demandée *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.name}>
                          {classItem.name} - {classItem.level}
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
              name="enrollment_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant payé (FCFA)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
              name="payment_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut de paiement *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="partial">Partiel</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Remarques ou informations complémentaires..."
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
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
