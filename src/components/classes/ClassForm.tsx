import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Class } from "@/hooks/useClasses";

const classSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Maximum 100 caractères"),
  level: z.string().min(1, "Le niveau est requis"),
  capacity: z.coerce.number().min(1, "La capacité doit être au moins 1").max(100, "Maximum 100 élèves"),
  teacher_name: z.string().max(100, "Maximum 100 caractères").optional(),
  room_number: z.string().max(50, "Maximum 50 caractères").optional(),
  schedule: z.string().max(500, "Maximum 500 caractères").optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClassFormData) => void;
  initialData?: Class;
  isLoading?: boolean;
}

const LEVELS = [
  "Terminale",
  "Première",
  "Seconde",
  "Troisième",
  "Quatrième",
  "Cinquième",
  "Sixième",
  "CM2",
  "CM1",
  "CE2",
  "CE1",
  "CP",
];

export const ClassForm = ({ open, onOpenChange, onSubmit, initialData, isLoading }: ClassFormProps) => {
  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: initialData || {
      name: "",
      level: "",
      capacity: 30,
      teacher_name: "",
      room_number: "",
      schedule: "",
    },
  });

  const handleSubmit = (data: ClassFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier la classe" : "Nouvelle classe"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Modifiez les informations de la classe"
              : "Ajoutez une nouvelle classe à votre établissement"}
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
                      <Input placeholder="Ex: Terminale S1" {...field} />
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

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacité *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="100" {...field} />
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
                      <Input placeholder="Ex: A101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="teacher_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professeur principal</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du professeur" {...field} />
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
                      placeholder="Informations sur l'emploi du temps..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : initialData ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};