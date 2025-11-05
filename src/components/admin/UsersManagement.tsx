import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserCog, Shield, X } from "lucide-react";
import { toast } from "sonner";

export const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (
            role,
            school_id
          ),
          schools (
            name
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: schools = [] } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const assignRole = useMutation({
    mutationFn: async ({ userId, role, schoolId }: { userId: string; role: string; schoolId?: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert([{
          user_id: userId,
          role: role as "super_admin" | "school_admin" | "teacher" | "accountant",
          school_id: schoolId || null,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Rôle attribué avec succès");
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole("");
      setSelectedSchool("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'attribution du rôle");
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as "super_admin" | "school_admin" | "teacher" | "accountant");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Rôle retiré");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur");
    },
  });

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Veuillez sélectionner un rôle");
      return;
    }

    if (selectedRole === "school_admin" && !selectedSchool) {
      toast.error("Veuillez sélectionner un établissement");
      return;
    }

    assignRole.mutate({
      userId: selectedUser.user_id,
      role: selectedRole,
      schoolId: selectedRole === "school_admin" ? selectedSchool : undefined,
    });
  };

  const handleOpenRoleDialog = (user: any) => {
    setSelectedUser(user);
    setSelectedSchool(user.school_id || "");
    setIsRoleDialogOpen(true);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: "Super Admin",
      school_admin: "Admin École",
      teacher: "Enseignant",
      accountant: "Comptable",
      none: "Aucun rôle",
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "school_admin":
        return "default";
      case "teacher":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const userRoles = Array.isArray(user.user_roles) ? user.user_roles : [];
    const userRole = userRoles.length > 0 ? userRoles[0].role : "none";
    const matchesRole = roleFilter === "all" || userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h2>
        <p className="text-muted-foreground">Gérez les utilisateurs et leurs rôles</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Utilisateurs de la plateforme</CardTitle>
              <CardDescription>{users.length} comptes enregistrés</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="school_admin">Admin École</SelectItem>
                <SelectItem value="teacher">Enseignant</SelectItem>
                <SelectItem value="accountant">Comptable</SelectItem>
                <SelectItem value="none">Sans rôle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>École</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const userRoles = Array.isArray(user.user_roles) ? user.user_roles : [];
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.schools?.name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {userRoles.length > 0 ? (
                              userRoles.map((roleObj: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <Badge variant={getRoleBadgeVariant(roleObj.role)}>
                                    {getRoleLabel(roleObj.role)}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 hover:bg-destructive/20"
                                    onClick={() => removeRole.mutate({ userId: user.user_id, role: roleObj.role })}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <Badge variant="outline">Aucun rôle</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.phone || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRoleDialog(user)}
                          >
                            <Shield className="h-3 w-3 mr-2" />
                            Gérer
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Attribuer un rôle</DialogTitle>
            <DialogDescription>
              {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sélectionner un rôle</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="school_admin">Admin École</SelectItem>
                  <SelectItem value="teacher">Enseignant</SelectItem>
                  <SelectItem value="accountant">Comptable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === "school_admin" && (
              <div className="space-y-2">
                <Label>Établissement</Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un établissement" />
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
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssignRole} disabled={assignRole.isPending}>
              {assignRole.isPending ? "Attribution..." : "Attribuer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
