import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Class } from "@/hooks/useClasses";

const classSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  level: z.string().min(1, "Veuillez sélectionner un niveau"),
  academic_year: z.string().min(1, "Veuillez sélectionner une année académique"),
  capacity: z.number().min(1, "La capacité doit être au moins 1").max(100),
  teacher_name: z.string().max(100).optional(),
  room_number: z.string().max(50).optional(),
  schedule: z.string().max(500).optional(),
  registration_fee: z.number().min(0, "Le montant doit être positif").optional(),
  monthly_tuition: z.number().min(0, "Le montant doit être positif").optional(),
  study_months: z.number().min(1, "Le nombre de mois doit être au moins 1").max(12, "Maximum 12 mois").optional(),
  annual_tuition: z.number().min(0, "Le montant doit être positif").optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClassFormData) => void;
  classData?: Class;
  loading?: boolean;
}

const LEVELS = [
  // Universitaire
  "Doctorat",
  "Master 2 (M2)",
  "Master 1 (M1)",
  "Licence 3 (L3)",
  "Licence 2 (L2)",
  "Licence 1 (L1)",
  // Lycée
  "Terminale",
  "Première",
  "Seconde",
  // Collège
  "Troisième (3ème)",
  "Quatrième (4ème)",
  "Cinquième (5ème)",
  "Sixième (6ème)",
  // Primaire
  "CM2",
  "CM1",
  "CE2",
  "CE1",
  "CP",
  // Garderie/Maternelle
  "Grande Section (GS)",
  "Moyenne Section (MS)",
  "Petite Section (PS)",
  "Crèche",
];

// Generate academic years (current and next 2 years)
const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = -1; i <= 2; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    years.push(`${startYear}-${endYear}`);
  }
  return years;
};

const ACADEMIC_YEARS = generateAcademicYears();


export const ClassForm = ({ open, onOpenChange, onSubmit, classData, loading }: ClassFormProps) => {
  const currentAcademicYear = ACADEMIC_YEARS.find(year => {
    const [startYear] = year.split('-');
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // Si on est entre septembre et décembre, l'année académique commence cette année
    // Si on est entre janvier et août, l'année académique a commencé l'année dernière
    return currentMonth >= 8 ? parseInt(startYear) === currentYear : parseInt(startYear) === currentYear - 1;
  }) || ACADEMIC_YEARS[1];

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: classData?.name || "",
      level: classData?.level || "",
      academic_year: classData?.academic_year || currentAcademicYear,
      capacity: classData?.capacity || 30,
      teacher_name: classData?.teacher_name || "",
      room_number: classData?.room_number || "",
      schedule: classData?.schedule || "",
      registration_fee: classData?.registration_fee || 0,
      monthly_tuition: classData?.monthly_tuition || 0,
      study_months: classData?.study_months || 9,
      annual_tuition: classData?.annual_tuition || 0,
    },
  });

  // Reset du formulaire quand classData change (pour l'édition)
  React.useEffect(() => {
    if (classData) {
      form.reset({
        name: classData.name,
        level: classData.level,
        academic_year: classData.academic_year,
        capacity: classData.capacity,
        teacher_name: classData.teacher_name || "",
        room_number: classData.room_number || "",
        schedule: classData.schedule || "",
        registration_fee: classData.registration_fee || 0,
        monthly_tuition: classData.monthly_tuition || 0,
        study_months: classData.study_months || 9,
        annual_tuition: classData.annual_tuition || 0,
      });
    }
  }, [classData, form]);

  // Calculer automatiquement la scolarité annuelle
  const calculateAnnualTuition = () => {
    const monthlyTuition = form.watch("monthly_tuition") || 0;
    const studyMonths = form.watch("study_months") || 9;
    const registrationFee = form.watch("registration_fee") || 0;
    
    const calculated = (monthlyTuition * studyMonths) + registrationFee;
    form.setValue("annual_tuition", calculated);
  };

  const handleSubmit = (data: ClassFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{classData ? "Modifier la classe" : "Nouvelle classe"}</DialogTitle>
          <DialogDescription>
            {classData ? "Modifiez les informations de la classe" : "Ajoutez une nouvelle classe à votre établissement"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la classe *</FormLabel>
                    <FormControl>
                      <Input placeholder="Terminale S1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
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
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année académique *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
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
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacité *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salle</FormLabel>
                    <FormControl>
                      <Input placeholder="A101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="registration_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frais d'inscription (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                          calculateAnnualTuition();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_tuition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scolarité mensuelle (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25000"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                          calculateAnnualTuition();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="study_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de mois</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="9"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value) || 9);
                          calculateAnnualTuition();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="annual_tuition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scolarité annuelle totale (FCFA)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Calculé automatiquement: (Mensualité × Nombre de mois) + Frais d'inscription
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacher_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professeur principal</FormLabel>
                  <FormControl>
                    <Input placeholder="M. Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emploi du temps</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lundi-Vendredi: 8h-17h"
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
                {loading ? "Enregistrement..." : classData ? "Mettre à jour" : "Créer la classe"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
