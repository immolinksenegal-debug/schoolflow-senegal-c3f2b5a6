import { useState } from "react";
import { useSchools } from "@/hooks/useSchools";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Power, PowerOff, Infinity } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface SchoolFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  isUnlimited: boolean;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export const SchoolsManagement = () => {
  const { schools, isLoading, createSchool, updateSchool, toggleSchoolStatus, deleteSchool } = useSchools();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [deleteSchoolId, setDeleteSchoolId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    isUnlimited: false,
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      isUnlimited: false,
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de l'école est requis");
      return;
    }

    if (!formData.adminName.trim() || !formData.adminEmail.trim() || !formData.adminPassword.trim()) {
      toast.error("Les informations de l'administrateur sont requises");
      return;
    }

    const schoolData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      max_students: formData.isUnlimited ? -1 : 30,
    };

    createSchool.mutate(schoolData, {
      onSuccess: async (data: any) => {
        // Create admin user after school creation
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`,
              },
              body: JSON.stringify({
                email: formData.adminEmail,
                password: formData.adminPassword,
                full_name: formData.adminName,
                role: "school_admin",
                school_id: data.id,
              }),
            }
          );

          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.error || "Erreur lors de la création de l'administrateur");
          }
          
          toast.success("École et administrateur créés avec succès");
        } catch (error: any) {
          toast.error(error.message || "École créée mais erreur lors de la création de l'administrateur");
        }
        
        setIsCreateDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleEdit = (school: any) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      email: school.email || "",
      phone: school.phone || "",
      address: school.address || "",
      isUnlimited: school.max_students === -1,
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de l'école est requis");
      return;
    }

    const schoolData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      max_students: formData.isUnlimited ? -1 : (selectedSchool.max_students === -1 ? 30 : selectedSchool.max_students),
    };

    updateSchool.mutate(
      { id: selectedSchool.id, data: schoolData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedSchool(null);
          resetForm();
        },
      }
    );
  };

  const handleToggleStatus = (school: any) => {
    toggleSchoolStatus.mutate(
      { id: school.id, isActive: !school.is_active },
      {
        onSuccess: () => {
          toast.success(`École ${!school.is_active ? "activée" : "désactivée"}`);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteSchoolId) return;
    
    deleteSchool.mutate(deleteSchoolId, {
      onSuccess: () => {
        setDeleteSchoolId(null);
      },
    });
  };

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des établissements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion des établissements</h2>
        <p className="text-muted-foreground">Créez et gérez les écoles de la plateforme</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Établissements scolaires</CardTitle>
              <CardDescription>Liste complète des écoles enregistrées</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle école
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Créer un établissement</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouvel établissement scolaire à la plateforme
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom de l'établissement *</Label>
                    <Input
                      id="name"
                      placeholder="Lycée Blaise Pascal"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@lycee.fr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="+221 33 123 45 67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      placeholder="123 Avenue de la République, Dakar"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Infinity className="h-4 w-4 text-primary" />
                        <Label htmlFor="unlimited" className="font-semibold cursor-pointer">
                          Compte Illimité
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Permettre un nombre illimité d'élèves
                      </p>
                    </div>
                    <Switch
                      id="unlimited"
                      checked={formData.isUnlimited}
                      onCheckedChange={(checked) => setFormData({ ...formData, isUnlimited: checked })}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">Compte administrateur</h4>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="adminName">Nom de l'administrateur *</Label>
                      <Input
                        id="adminName"
                        placeholder="Jean Dupont"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="adminEmail">Email de l'administrateur *</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@lycee.fr"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="adminPassword">Mot de passe *</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreate} disabled={createSchool.isPending}>
                    {createSchool.isPending ? "Création..." : "Créer l'école"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Limite élèves</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">
                          {searchQuery ? "Aucun résultat trouvé" : "Aucune école enregistrée"}
                        </p>
                        {!searchQuery && (
                          <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer la première école
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell className="text-muted-foreground">{school.email || "-"}</TableCell>
                      <TableCell>
                        {school.max_students === -1 ? (
                          <Badge variant="default" className="gap-1">
                            <Infinity className="h-3 w-3" />
                            Illimité
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{school.max_students} élèves</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={school.is_active ? "default" : "secondary"}>
                          {school.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(school.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(school)}
                            title={school.is_active ? "Désactiver" : "Activer"}
                          >
                            {school.is_active ? (
                              <PowerOff className="h-3 w-3" />
                            ) : (
                              <Power className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(school)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteSchoolId(school.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Modifier l'établissement</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'établissement scolaire
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom de l'établissement *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Infinity className="h-4 w-4 text-primary" />
                  <Label htmlFor="edit-unlimited" className="font-semibold cursor-pointer">
                    Compte Illimité
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Permettre un nombre illimité d'élèves
                </p>
              </div>
              <Switch
                id="edit-unlimited"
                checked={formData.isUnlimited}
                onCheckedChange={(checked) => setFormData({ ...formData, isUnlimited: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedSchool(null); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={updateSchool.isPending}>
              {updateSchool.isPending ? "Mise à jour..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deleteSchoolId} onOpenChange={(open) => !open && setDeleteSchoolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données liées à cet établissement (classes, élèves, paiements) seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
