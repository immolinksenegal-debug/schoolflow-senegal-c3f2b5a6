import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ReminderConfiguration } from "@/hooks/useReminders";

const reminderConfigSchema = z.object({
  trigger_days: z.number().min(1, "Minimum 1 jour").max(365, "Maximum 365 jours"),
  message_template: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  channels: z.array(z.string()).min(1, "Sélectionnez au moins un canal"),
  is_active: z.boolean(),
  send_to_parent: z.boolean(),
});

type FormData = z.infer<typeof reminderConfigSchema>;

interface ReminderConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  config?: ReminderConfiguration;
  isLoading: boolean;
}

export function ReminderConfigDialog({
  open,
  onOpenChange,
  onSubmit,
  config,
  isLoading,
}: ReminderConfigDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(reminderConfigSchema),
    defaultValues: config
      ? {
          trigger_days: config.trigger_days,
          message_template: config.message_template,
          channels: config.channels,
          is_active: config.is_active,
          send_to_parent: config.send_to_parent,
        }
      : {
          trigger_days: 7,
          message_template: "",
          channels: ["sms"],
          is_active: true,
          send_to_parent: true,
        },
  });

  const availableChannels = [
    { value: "sms", label: "SMS" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {config ? "Modifier" : "Ajouter"} une configuration de relance
          </DialogTitle>
          <DialogDescription>
            Configurez les relances automatiques pour les retards de paiement
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="trigger_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de jours de retard *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Après combien de jours de retard envoyer la relance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message_template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message personnalisé *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Cher parent, nous vous rappelons que le paiement de scolarité de [NOM_ELEVE] pour le mois de [MOIS] d'un montant de [MONTANT] FCFA est en retard depuis [JOURS] jours..."
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription className="space-y-1">
                    <p>Variables disponibles :</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">[NOM_ELEVE]</Badge>
                      <Badge variant="outline" className="text-xs">[CLASSE]</Badge>
                      <Badge variant="outline" className="text-xs">[MATRICULE]</Badge>
                      <Badge variant="outline" className="text-xs">[MONTANT]</Badge>
                      <Badge variant="outline" className="text-xs">[JOURS]</Badge>
                      <Badge variant="outline" className="text-xs">[DATE]</Badge>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="channels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canaux de communication *</FormLabel>
                  <div className="space-y-2">
                    {availableChannels.map((channel) => (
                      <div key={channel.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={field.value.includes(channel.value)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, channel.value]
                              : field.value.filter((v) => v !== channel.value);
                            field.onChange(newValue);
                          }}
                        />
                        <Label className="font-normal">{channel.label}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="send_to_parent"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal !mt-0">
                      Envoyer également au numéro du parent/tuteur
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal !mt-0">
                      Activer cette configuration
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {config ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}