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
import { useClasses } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const enrollmentSchema = z.object({
  enrollment_type: z.enum(['new', 're-enrollment']),
  student_id: z.string().optional(),
  use_existing_parent: z.boolean().optional(),
  existing_parent_phone: z.string().optional(),
  // New student fields
  full_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  parent_email: z.string().email("Email invalide").optional().or(z.literal("")),
  // Enrollment fields
  previous_class: z.string().optional(),
  requested_class: z.string().min(1, "Veuillez sélectionner une classe"),
  enrollment_fee: z.number().min(0).optional(),
  payment_status: z.enum(['pending', 'partial', 'paid']).default('pending'),
  notes: z.string().max(500).optional(),
}).refine((data) => {
  // Pour les nouvelles inscriptions, valider les champs requis
  if (data.enrollment_type === 'new') {
    if (!data.full_name || data.full_name.length < 2) {
      return false;
    }
    if (!data.date_of_birth) {
      return false;
    }
    if (!data.parent_name || data.parent_name.length < 2) {
      return false;
    }
    if (!data.parent_phone || data.parent_phone.length < 2) {
      return false;
    }
  }
  // Pour les réinscriptions, valider que student_id est présent
  if (data.enrollment_type === 're-enrollment' && !data.student_id) {
    return false;
  }
  return true;
}, {
  message: "Veuillez remplir tous les champs obligatoires",
  path: ["enrollment_type"],
});

interface ParentInfo {
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  student_count: number;
}

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const EnrollmentForm = ({ open, onOpenChange, onSubmit, loading }: EnrollmentFormProps) => {
  const { classes, isLoading: loadingClasses } = useClasses();
  const { students } = useStudents();
  const [existingParents, setExistingParents] = useState<ParentInfo[]>([]);
  const [searchParentPhone, setSearchParentPhone] = useState("");
  const [foundParents, setFoundParents] = useState<ParentInfo[]>([]);
  const [showParentSelector, setShowParentSelector] = useState(false);
  
  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      enrollment_type: 'new',
      requested_class: "",
      payment_status: 'pending',
      enrollment_fee: 0,
      use_existing_parent: false,
    },
  });

  const enrollmentType = form.watch('enrollment_type');
  const isNewEnrollment = enrollmentType === 'new';
  const useExistingParent = form.watch('use_existing_parent');
  const parentPhone = form.watch('parent_phone');

  // Extract unique parents from existing students
  useEffect(() => {
    if (students.length > 0) {
      const parentsMap = new Map<string, ParentInfo>();
      
      students.forEach(student => {
        const key = student.parent_phone;
        if (parentsMap.has(key)) {
          const existing = parentsMap.get(key)!;
          parentsMap.set(key, { ...existing, student_count: existing.student_count + 1 });
        } else {
          parentsMap.set(key, {
            parent_name: student.parent_name,
            parent_phone: student.parent_phone,
            parent_email: student.parent_email || "",
            student_count: 1,
          });
        }
      });
      
      setExistingParents(Array.from(parentsMap.values()));
    }
  }, [students]);

  // Auto-detect existing parent when typing phone
  useEffect(() => {
    if (parentPhone && parentPhone.length >= 8 && !useExistingParent) {
      const matches = existingParents.filter(p => 
        p.parent_phone.includes(parentPhone)
      );
      setFoundParents(matches);
    } else {
      setFoundParents([]);
    }
  }, [parentPhone, existingParents, useExistingParent]);

  const handleSelectExistingParent = (parent: ParentInfo) => {
    form.setValue('parent_name', parent.parent_name);
    form.setValue('parent_phone', parent.parent_phone);
    form.setValue('parent_email', parent.parent_email);
    form.setValue('use_existing_parent', true);
    setFoundParents([]);
    setShowParentSelector(false);
    setSearchParentPhone("");
  };

  const handleSearchParent = () => {
    if (searchParentPhone.length >= 8) {
      const matches = existingParents.filter(p => 
        p.parent_phone.includes(searchParentPhone)
      );
      setFoundParents(matches);
    }
  };

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

        {!loadingClasses && classes.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              Aucune classe n'a été créée. Veuillez d'abord créer des classes dans le menu "Classes" avant d'enregistrer des inscriptions.
            </AlertDescription>
          </Alert>
        )}
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Informations parent/tuteur</h4>
                    <div className="flex gap-2">
                      {useExistingParent && (
                        <Badge variant="secondary" className="gap-1">
                          <Search className="h-3 w-3" />
                          Parent existant
                        </Badge>
                      )}
                      {!useExistingParent && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowParentSelector(!showParentSelector)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          {showParentSelector ? "Annuler" : "Sélectionner parent existant"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {showParentSelector && !useExistingParent && (
                    <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Rechercher par téléphone..."
                          value={searchParentPhone}
                          onChange={(e) => setSearchParentPhone(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchParent())}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleSearchParent}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {foundParents.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            {foundParents.length} parent(s) trouvé(s)
                          </p>
                          {foundParents.map((parent, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectExistingParent(parent)}
                              className="w-full text-left p-3 text-sm bg-background hover:bg-accent rounded border border-border transition-colors"
                            >
                              <div className="font-medium">{parent.parent_name}</div>
                              <div className="text-muted-foreground">{parent.parent_phone}</div>
                              {parent.parent_email && (
                                <div className="text-muted-foreground">{parent.parent_email}</div>
                              )}
                              <div className="text-xs text-primary mt-1">
                                {parent.student_count} élève{parent.student_count > 1 ? 's' : ''} inscrit{parent.student_count > 1 ? 's' : ''}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {searchParentPhone.length >= 8 && foundParents.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Aucun parent trouvé avec ce numéro
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="parent_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone parent *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="77 987 65 43" 
                              {...field}
                              disabled={useExistingParent}
                            />
                          </FormControl>
                          <FormMessage />
                          
                          {foundParents.length > 0 && !useExistingParent && (
                            <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Parent(s) existant(s) trouvé(s)
                              </p>
                              <div className="space-y-2">
                                {foundParents.map((parent, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectExistingParent(parent)}
                                    className="w-full text-left p-2 text-xs bg-background hover:bg-accent rounded border border-border transition-colors"
                                  >
                                    <div className="font-medium">{parent.parent_name}</div>
                                    <div className="text-muted-foreground">{parent.parent_phone}</div>
                                    <div className="text-muted-foreground">
                                      {parent.student_count} élève{parent.student_count > 1 ? 's' : ''} déjà inscrit{parent.student_count > 1 ? 's' : ''}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parent_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du parent/tuteur *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="M. ou Mme..." 
                              {...field}
                              disabled={useExistingParent}
                            />
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
                            <Input 
                              type="email" 
                              placeholder="parent@email.com" 
                              {...field}
                              disabled={useExistingParent}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {useExistingParent && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue('use_existing_parent', false);
                        form.setValue('parent_name', '');
                        form.setValue('parent_phone', '');
                        form.setValue('parent_email', '');
                      }}
                    >
                      Saisir un nouveau parent
                    </Button>
                  )}
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={loadingClasses || classes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            loadingClasses 
                              ? "Chargement..." 
                              : classes.length === 0 
                                ? "Aucune classe disponible" 
                                : "Sélectionner"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.name}>
                            {cls.name} ({cls.level})
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
              <Button type="submit" disabled={loading || classes.length === 0}>
                {loading ? "Enregistrement..." : "Enregistrer l'inscription"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
