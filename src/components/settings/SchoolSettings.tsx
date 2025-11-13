import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchool } from "@/hooks/useSchool";
import { useSchools } from "@/hooks/useSchools";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Loader2, X } from "lucide-react";

const schoolSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal("")),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

export const SchoolSettings = () => {
  const { school, isLoading, updateSchool } = useSchool();
  const { schools } = useSchools();
  const { isSuperAdmin } = useUserRole();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // For super_admin, use selected school; for others, use their school
  const currentSchool = isSuperAdmin && selectedSchoolId
    ? schools.find(s => s.id === selectedSchoolId)
    : school;

  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    values: {
      name: currentSchool?.name || "",
      address: currentSchool?.address || "",
      phone: currentSchool?.phone || "",
      email: currentSchool?.email || "",
    },
  });

  useEffect(() => {
    if (currentSchool?.logo_url) {
      setLogoPreview(currentSchool.logo_url);
    }
  }, [currentSchool]);

  useEffect(() => {
    // Initialize selected school for super_admin
    if (isSuperAdmin && !selectedSchoolId && school?.id) {
      setSelectedSchoolId(school.id);
    }
  }, [isSuperAdmin, selectedSchoolId, school]);

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

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(currentSchool?.logo_url || null);
  };

  const onSubmit = async (data: SchoolFormData) => {
    try {
      setUploading(true);
      let logoUrl = currentSchool?.logo_url;

      // Upload new logo if selected
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `${currentSchool?.id}-${Date.now()}.${fileExt}`;
        
        // Delete old logo if exists
        if (currentSchool?.logo_url) {
          const oldFileName = currentSchool.logo_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from("school-logos")
              .remove([oldFileName]);
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("school-logos")
          .upload(fileName, logoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("school-logos")
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
        setLogoFile(null);
      }

      // Update school with all data (pass schoolId for super_admin)
      await updateSchool.mutateAsync({
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        logo_url: logoUrl || null,
        schoolId: isSuperAdmin ? selectedSchoolId || undefined : undefined,
      });

      setLogoPreview(logoUrl || null);
    } catch (error: any) {
      console.error("Error in submit:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setUploading(false);
    }
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
      {isSuperAdmin && (
        <CardContent className="border-b pb-6">
          <div className="space-y-2">
            <Label htmlFor="school-select">Sélectionner une école à modifier</Label>
            <Select
              value={selectedSchoolId || ""}
              onValueChange={setSelectedSchoolId}
            >
              <SelectTrigger id="school-select">
                <SelectValue placeholder="Choisir une école..." />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo de l'établissement</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-24 w-24 object-cover rounded-lg border"
                    />
                    {logoFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                disabled={updateSchool.isPending || uploading}
                className="bg-primary hover:bg-primary/90"
              >
                {updateSchool.isPending || uploading ? (
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
