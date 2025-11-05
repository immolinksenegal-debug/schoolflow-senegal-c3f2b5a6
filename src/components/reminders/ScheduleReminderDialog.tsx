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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useStudents } from "@/hooks/useStudents";

const scheduleReminderSchema = z.object({
  student_id: z.string().min(1, "Sélectionnez un élève"),
  scheduled_date: z.string().min(1, "Sélectionnez une date"),
  scheduled_time: z.string().optional(),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  channels: z.array(z.string()).min(1, "Sélectionnez au moins un canal"),
  send_to_parent: z.boolean(),
});

type FormData = z.infer<typeof scheduleReminderSchema>;

interface ScheduleReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  preselectedStudents?: string[];
}

export function ScheduleReminderDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  preselectedStudents = [],
}: ScheduleReminderDialogProps) {
  const { students } = useStudents();
  
  const form = useForm<FormData>({
    resolver: zodResolver(scheduleReminderSchema),
    defaultValues: {
      student_id: preselectedStudents[0] || "",
      scheduled_date: "",
      scheduled_time: "09:00",
      message: "Cher parent, nous vous rappelons que le paiement de scolarité de [NOM_ELEVE] est en retard. Veuillez régulariser votre situation dans les plus brefs délais. Merci.",
      channels: ["sms"],
      send_to_parent: true,
    },
  });

  const availableChannels = [
    { value: "sms", label: "SMS" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "email", label: "Email" },
  ];

  // Filtrer les élèves en retard
  const lateStudents = students.filter(s => 
    s.payment_status === 'pending' || s.payment_status === 'partial'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Planifier une relance</DialogTitle>
          <DialogDescription>
            Planifiez une relance pour un élève en retard de paiement
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Élève *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un élève" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lateStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.matricule}) - {student.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {lateStudents.length} élève(s) en retard de paiement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'envoi *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduled_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure d'envoi</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Optionnel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Votre message personnalisé..."
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription className="space-y-1">
                    <p>Variables disponibles :</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">[NOM_ELEVE]</Badge>
                      <Badge variant="outline" className="text-xs">[CLASSE]</Badge>
                      <Badge variant="outline" className="text-xs">[MATRICULE]</Badge>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                Planifier
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}