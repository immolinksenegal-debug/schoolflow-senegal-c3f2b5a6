import { useState } from "react";
import { Plus, Trash2, Edit2, Clock, Calendar as CalendarIcon, Power, PowerOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useReminders, CreateReminderConfigData, CreateScheduledReminderData } from "@/hooks/useReminders";
import { ReminderConfigDialog } from "@/components/reminders/ReminderConfigDialog";
import { ScheduleReminderDialog } from "@/components/reminders/ScheduleReminderDialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function RemindersSettings() {
  const {
    configurations,
    scheduledReminders,
    isLoadingConfigs,
    isLoadingScheduled,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    createScheduledReminder,
    cancelScheduledReminder,
  } = useReminders();

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);

  const handleCreateConfig = (data: CreateReminderConfigData) => {
    createConfiguration.mutate(
      { ...data, reminder_type: 'automatic' },
      {
        onSuccess: () => setConfigDialogOpen(false),
      }
    );
  };

  const handleUpdateConfig = (data: CreateReminderConfigData) => {
    if (!editingConfig) return;
    updateConfiguration.mutate(
      { id: editingConfig.id, ...data },
      {
        onSuccess: () => {
          setConfigDialogOpen(false);
          setEditingConfig(null);
        },
      }
    );
  };

  const handleEditClick = (config: any) => {
    setEditingConfig(config);
    setConfigDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setConfigToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (configToDelete) {
      deleteConfiguration.mutate(configToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setConfigToDelete(null);
        },
      });
    }
  };

  const handleSchedule = (data: CreateScheduledReminderData) => {
    createScheduledReminder.mutate(data, {
      onSuccess: () => setScheduleDialogOpen(false),
    });
  };

  const handleToggleActive = (config: any) => {
    updateConfiguration.mutate({
      id: config.id,
      is_active: !config.is_active,
    });
  };

  const handleCancelReminder = (id: string) => {
    cancelScheduledReminder.mutate(id);
  };

  const getChannelBadges = (channels: string[]) => {
    return channels.map((channel) => {
      const label = channel === 'sms' ? 'SMS' : channel === 'whatsapp' ? 'WhatsApp' : 'Email';
      return (
        <Badge key={channel} variant="outline" className="text-xs">
          {label}
        </Badge>
      );
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'sent') {
      return <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">Envoyé</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">En attente</Badge>;
    } else if (status === 'failed') {
      return <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">Échec</Badge>;
    } else {
      return <Badge className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300">Annulé</Badge>;
    }
  };

  if (isLoadingConfigs || isLoadingScheduled) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configurations automatiques */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Relances automatiques</CardTitle>
              <CardDescription>
                Configurez les relances automatiques selon les jours de retard
              </CardDescription>
            </div>
            <Button
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => {
                setEditingConfig(null);
                setConfigDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {configurations.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucune configuration de relance</p>
              <Button
                variant="outline"
                onClick={() => setConfigDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une première configuration
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Jours de retard</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Canaux</TableHead>
                    <TableHead>Parent/Tuteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configurations.map((config) => (
                    <TableRow key={config.id} className="hover:bg-muted/50">
                      <TableCell className="font-semibold">
                        <Badge variant="outline" className="text-base">
                          {config.trigger_days} jours
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm line-clamp-2">{config.message_template}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getChannelBadges(config.channels)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {config.send_to_parent ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="outline">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(config)}
                          className="gap-2"
                        >
                          {config.is_active ? (
                            <>
                              <Power className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">Actif</span>
                            </>
                          ) : (
                            <>
                              <PowerOff className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Inactif</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(config)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(config.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relances planifiées */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Relances planifiées</CardTitle>
              <CardDescription>
                Relances programmées pour des élèves spécifiques
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Planifier une relance
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scheduledReminders.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucune relance planifiée</p>
              <Button
                variant="outline"
                onClick={() => setScheduleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Planifier une première relance
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Élève</TableHead>
                    <TableHead>Date prévue</TableHead>
                    <TableHead>Heure</TableHead>
                    <TableHead>Canaux</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReminders.map((reminder) => (
                    <TableRow key={reminder.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{reminder.students?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reminder.students?.matricule} - {reminder.students?.class}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(reminder.scheduled_date), "dd MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        {reminder.scheduled_time || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {getChannelBadges(reminder.channels)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                      <TableCell className="text-right">
                        {reminder.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelReminder(reminder.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Annuler
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ReminderConfigDialog
        open={configDialogOpen}
        onOpenChange={(open) => {
          setConfigDialogOpen(open);
          if (!open) setEditingConfig(null);
        }}
        onSubmit={editingConfig ? handleUpdateConfig : handleCreateConfig}
        config={editingConfig}
        isLoading={createConfiguration.isPending || updateConfiguration.isPending}
      />

      <ScheduleReminderDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSubmit={handleSchedule}
        isLoading={createScheduledReminder.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette configuration de relance ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}