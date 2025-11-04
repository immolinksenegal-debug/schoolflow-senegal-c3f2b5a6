import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";

const enrollmentSchema = z.object({
  enrollment_type: z.enum(['new', 're-enrollment']),
  student_id: z.string().optional(),
  // New student fields
  full_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100).optional(),
  date_of_birth: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  parent_name: z.string().min(2).max(100).optional(),
  parent_phone: z.string().min(2).max(20).optional(),
  parent_email: z.string().email("Email invalide").optional().or(z.literal("")),
  // Enrollment fields
  previous_class: z.string().optional(),
  requested_class: z.string().min(1, "Veuillez sélectionner une classe"),
  enrollment_fee: z.number().min(0).optional(),
  payment_status: z.enum(['pending', 'partial', 'paid']).default('pending'),
  notes: z.string().max(500).optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const EnrollmentForm = ({ open, onOpenChange, onSubmit, loading }: EnrollmentFormProps) => {
  const { classes } = useClasses();
  const { students } = useStudents();
  
  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      enrollment_type: 'new',
      requested_class: "",
      payment_status: 'pending',
      enrollment_fee: 0,
    },
  });

  const enrollmentType = form.watch('enrollment_type');
  const isNewEnrollment = enrollmentType === 'new';

  const handleSubmit = (data: EnrollmentFormData) => {
    const { enrollment_type, student_id, full_name, date_of_birth, phone, email, 
            address, parent_name, parent_phone, parent_email, ...enrollmentData } = data;

    if (isNewEnrollment && full_name && date_of_birth && parent_name && parent_phone) {
      onSubmit({
        enrollment_type,
        ...enrollmentData,
        student_data: {
          full_name,
          date_of_birth,
          phone: phone || "",
          email: email || "",
          address: address || "",
          parent_name,
          parent_phone,
          parent_email: parent_email || "",
          class: data.requested_class,
        },
      });
    } else if (!isNewEnrollment && student_id) {
      onSubmit({
        enrollment_type,
        student_id,
        ...enrollmentData,
      });
    } else {
      // Error handling
      return;
    }
    
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle inscription</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle inscription ou une réinscription
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="enrollment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'inscription *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new">Nouvelle inscription</SelectItem>
                      <SelectItem value="re-enrollment">Réinscription</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isNewEnrollment && (
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Élève *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un élève" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.filter(s => s.status === 'active').map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name} - {student.class}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isNewEnrollment && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone élève</FormLabel>
                        <FormControl>
                          <Input placeholder="77 123 45 67" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email élève</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="eleve@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="Quartier, Ville" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="parent_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du parent/tuteur *</FormLabel>
                        <FormControl>
                          <Input placeholder="M. ou Mme..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parent_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone parent *</FormLabel>
                        <FormControl>
                          <Input placeholder="77 987 65 43" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parent_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email parent</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="parent@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {!isNewEnrollment && (
                <FormField
                  control={form.control}
                  name="previous_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe actuelle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.name}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="requested_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isNewEnrollment ? "Classe demandée" : "Nouvelle classe"} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.name}>
                            {cls.name}
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
                    <FormLabel>Frais d'inscription (FCFA)</FormLabel>
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
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut paiement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
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
            </div>

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
                {loading ? "Enregistrement..." : "Enregistrer l'inscription"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
