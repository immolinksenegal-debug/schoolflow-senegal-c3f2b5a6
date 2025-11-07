import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useClasses } from "@/hooks/useClasses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const studentSchema = z.object({
  matricule: z.string().min(1, "Le matricule est requis").max(50),
  full_name: z.string().min(1, "Le nom est requis").max(200),
  date_of_birth: z.string().min(1, "La date de naissance est requise"),
  class: z.string().min(1, "La classe est requise"),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  parent_name: z.string().min(1, "Le nom du parent est requis").max(200),
  parent_phone: z.string().min(1, "Le téléphone du parent est requis").max(20),
  parent_email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void;
  defaultValues?: Partial<StudentFormData>;
  isLoading?: boolean;
}

export const StudentForm = ({ onSubmit, defaultValues, isLoading }: StudentFormProps) => {
  const { classes, isLoading: loadingClasses } = useClasses();
  
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: defaultValues || {
      matricule: "",
      full_name: "",
      date_of_birth: "",
      class: "",
      phone: "",
      email: "",
      address: "",
      parent_name: "",
      parent_phone: "",
      parent_email: "",
    },
  });

  // Si aucune classe n'existe et qu'on n'est pas en mode édition
  if (!loadingClasses && classes.length === 0 && !defaultValues) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          Aucune classe n'a été créée. Veuillez d'abord créer des classes dans le menu "Classes" avant d'ajouter des élèves.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="matricule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matricule *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: MAT001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Aminata Diop" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingClasses}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingClasses ? "Chargement..." : "Sélectionner une classe"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.name}>
                        {classItem.name} ({classItem.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone de l'élève</FormLabel>
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
                <FormLabel>Email</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <FormField
          control={form.control}
          name="parent_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email du parent</FormLabel>
              <FormControl>
                <Input type="email" placeholder="parent@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
            {isLoading ? "Enregistrement..." : "Enregistrer l'élève"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
