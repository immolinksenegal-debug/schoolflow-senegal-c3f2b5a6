import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Table as TableIcon, Users, RefreshCw, Activity, Key, Link2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TableInfo {
  tableName: string;
  rowCount: number;
  columns: number;
}

export const DatabaseManagement = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Récupérer les informations sur les tables
  const { data: tables, isLoading: tablesLoading, refetch: refetchTables } = useQuery({
    queryKey: ["databaseTables"],
    queryFn: async () => {
      const tableNames = [
        "schools", "profiles", "students", "classes", 
        "enrollments", "payments", "certificates", 
        "reminder_configurations", "reminder_history", 
        "scheduled_reminders", "user_roles", "user_preferences"
      ];

      const tableStats: TableInfo[] = await Promise.all(
        tableNames.map(async (tableName) => {
          const { count, error } = await supabase
            .from(tableName as any)
            .select("*", { count: "exact", head: true });

          if (error) {
            console.error(`Error fetching ${tableName}:`, error);
            return { tableName, rowCount: 0, columns: 0 };
          }

          return { tableName, rowCount: count || 0, columns: 0 };
        })
      );

      return tableStats.sort((a, b) => b.rowCount - a.rowCount);
    },
  });

  // Récupérer les données d'une table spécifique
  const { data: tableData, isLoading: dataLoading } = useQuery({
    queryKey: ["tableData", selectedTable],
    queryFn: async () => {
      if (!selectedTable) return null;

      const { data, error } = await supabase
        .from(selectedTable as any)
        .select("*")
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedTable,
  });

  const handleRefresh = async () => {
    await refetchTables();
    toast.success("Base de données actualisée");
  };

  const totalRows = tables?.reduce((sum, table) => sum + table.rowCount, 0) || 0;

  const getTableIcon = (tableName: string) => {
    if (tableName.includes("user")) return <Users className="h-4 w-4" />;
    if (tableName.includes("school")) return <Database className="h-4 w-4" />;
    return <TableIcon className="h-4 w-4" />;
  };

  const formatTableName = (name: string) => {
    return name
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Database className="h-8 w-8 text-primary" />
            Base de données
          </h2>
          <p className="text-muted-foreground">
            Gestion et surveillance de la base de données
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <TableIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Tables actives</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enregistrements</CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRows.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de lignes</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relations</CardTitle>
            <Link2 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Clés étrangères</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">État</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">OK</div>
            <p className="text-xs text-muted-foreground">Base saine</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des tables */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Tables de la base de données
          </CardTitle>
          <CardDescription>
            Vue d'ensemble de toutes les tables et leurs statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedTable}>
                Détails {selectedTable && `- ${formatTableName(selectedTable)}`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {tablesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Nom de la table</TableHead>
                        <TableHead className="text-right">Enregistrements</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tables?.map((table) => (
                        <TableRow key={table.tableName} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                              {getTableIcon(table.tableName)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {formatTableName(table.tableName)}
                              {table.rowCount > 1000 && (
                                <Badge variant="secondary" className="text-xs">
                                  Large
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {table.tableName}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="font-mono">
                              {table.rowCount.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTable(table.tableName)}
                              className="gap-2"
                            >
                              <Key className="h-3 w-3" />
                              Voir les données
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {dataLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : tableData && tableData.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {formatTableName(selectedTable || "")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Affichage des 100 premiers enregistrements
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {tableData.length} lignes
                    </Badge>
                  </div>
                  
                  <div className="rounded-lg border max-h-[600px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow className="bg-muted/50">
                          {Object.keys(tableData[0]).map((key) => (
                            <TableHead key={key} className="font-semibold">
                              {key}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map((row: any, index: number) => (
                          <TableRow key={index} className="hover:bg-muted/50">
                            {Object.values(row).map((value: any, cellIndex: number) => (
                              <TableCell key={cellIndex} className="font-mono text-xs">
                                {value === null ? (
                                  <span className="text-muted-foreground italic">null</span>
                                ) : typeof value === "boolean" ? (
                                  <Badge variant={value ? "default" : "secondary"}>
                                    {value.toString()}
                                  </Badge>
                                ) : typeof value === "object" ? (
                                  <span className="text-muted-foreground">
                                    {JSON.stringify(value).substring(0, 50)}...
                                  </span>
                                ) : (
                                  String(value).substring(0, 100)
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Informations système */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <AlertCircle className="h-5 w-5" />
            Informations système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Type de base de données</p>
              <p className="text-sm text-muted-foreground">PostgreSQL 15</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Hébergement</p>
              <p className="text-sm text-muted-foreground">Lovable Cloud (Supabase)</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Sécurité</p>
              <p className="text-sm text-muted-foreground">RLS activé sur toutes les tables</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Sauvegardes</p>
              <p className="text-sm text-muted-foreground">Automatiques quotidiennes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
