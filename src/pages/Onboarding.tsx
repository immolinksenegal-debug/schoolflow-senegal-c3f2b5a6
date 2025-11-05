import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSchool } from "@/hooks/useSchool";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import eduKashLogo from "@/assets/edukash-logo.png";

const schoolSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

const Onboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { school, isLoading: schoolLoading } = useSchool();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Redirect to dashboard if school already exists
  useEffect(() => {
    if (!authLoading && !schoolLoading && school) {
      navigate("/dashboard");
    }
  }, [school, authLoading, schoolLoading, navigate]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 Mo");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: SchoolFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      let logoUrl: string | undefined;

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("school-logos")
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("school-logos")
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Call edge function to create school (bypasses RLS)
      const { data: result, error: functionError } = await supabase.functions.invoke(
        'create-school',
        {
          body: {
            name: data.name,
            address: data.address || null,
            phone: data.phone || null,
            email: data.email || null,
            logo_url: logoUrl || null,
          }
        }
      );

      if (functionError) throw functionError;

      // Invalider les caches pour forcer le rechargement des données
      await queryClient.invalidateQueries({ queryKey: ["school"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast.success("École créée avec succès");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating school:", error);
      toast.error(error.message || "Erreur lors de la création de l'école");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex flex-col items-center gap-4 mb-2">
            <img 
              src={eduKashLogo} 
              alt="EduKash" 
              className="h-24 w-auto object-contain"
            />
            <CardTitle className="text-2xl">Créez votre établissement</CardTitle>
          </div>
          <CardDescription className="text-center">
            Commencez par ajouter les informations de votre école ou établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo de l'établissement</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Aperçu du logo"
                        className="h-20 w-20 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG ou WEBP (max. 5 Mo)
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'établissement *</FormLabel>
                      <FormControl>
                        <Input placeholder="Lycée Victor Hugo" {...field} />
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
                        <Textarea
                          placeholder="123 Rue de l'École, 75000 Paris"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+33 1 23 45 67 89" {...field} />
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
                          <Input
                            type="email"
                            placeholder="contact@ecole.fr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Création en cours..." : "Créer mon établissement"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
