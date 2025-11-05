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
import { Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import eduKashLogo from "@/assets/edukash-logo.png";

const schoolSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

// Function to check if email exists
const checkEmailExists = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  const { data, error } = await supabase
    .from('schools')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking email:', error);
    return false;
  }
  
  return !!data;
};

type SchoolFormData = z.infer<typeof schoolSchema>;

const Onboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { school, isLoading: schoolLoading } = useSchool();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailValue, setEmailValue] = useState("");

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

  // Email availability check with debounce
  useEffect(() => {
    const checkEmail = async () => {
      if (!emailValue || emailValue.trim() === '') {
        setEmailCheckStatus('idle');
        return;
      }

      // Validate email format first
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        setEmailCheckStatus('idle');
        return;
      }

      setEmailCheckStatus('checking');
      
      const exists = await checkEmailExists(emailValue.trim());
      setEmailCheckStatus(exists ? 'taken' : 'available');
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [emailValue]);

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

    // Validate email uniqueness if provided
    if (data.email && data.email.trim()) {
      const emailExists = await checkEmailExists(data.email.trim());
      if (emailExists) {
        form.setError('email', {
          type: 'manual',
          message: 'Cet email est déjà utilisé par un autre établissement'
        });
        return;
      }
    }

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

      if (functionError) {
        console.error('Function invocation error:', functionError);
        throw new Error(functionError.message || 'Erreur lors de la création de l\'école');
      }

      // Check if the response contains an error (e.g., 409 conflict)
      if (result?.error) {
        console.error('School creation error:', result.error);
        throw new Error(result.error);
      }

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
                          <div className="relative">
                            <Input
                              type="email"
                              placeholder="contact@ecole.fr"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setEmailValue(e.target.value);
                              }}
                            />
                            {emailValue && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {emailCheckStatus === 'checking' && (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                                {emailCheckStatus === 'available' && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {emailCheckStatus === 'taken' && (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        {emailCheckStatus === 'taken' && (
                          <p className="text-sm text-destructive">
                            Cet email est déjà utilisé
                          </p>
                        )}
                        {emailCheckStatus === 'available' && (
                          <p className="text-sm text-green-600">
                            Email disponible
                          </p>
                        )}
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
