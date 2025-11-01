import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchool } from "@/hooks/useSchool";
import { Building2, Loader2 } from "lucide-react";

const schoolSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

export const SchoolSettings = () => {
  const { school, isLoading, updateSchool } = useSchool();

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    values: {
      name: school?.name || "",
      address: school?.address || "",
      phone: school?.phone || "",
      email: school?.email || "",
    },
  });

  const onSubmit = (data: SchoolFormData) => {
    updateSchool.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Informations de l'école</CardTitle>
        </div>
        <CardDescription>
          Gérez les informations générales de votre établissement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'établissement *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lycée Moderne" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Avenue Cheikh Anta Diop, Dakar" {...field} />
                  </FormControl>
                  <FormDescription>
                    L'adresse complète de l'établissement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="33 123 45 67" {...field} />
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
                      <Input type="email" placeholder="contact@ecole.sn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={updateSchool.isPending || !form.formState.isDirty}
                className="bg-gradient-primary hover:opacity-90"
              >
                {updateSchool.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
