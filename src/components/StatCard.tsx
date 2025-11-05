import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ title, value, icon: Icon, description, trend }: StatCardProps) => {
  return (
    <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group">
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full inline-block">
            {description}
          </p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium px-2 py-1 rounded-full inline-flex ${
            trend.isPositive 
              ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
          }`}>
            {trend.isPositive ? '↑' : '↓'} 
            <span>{Math.abs(trend.value)}% ce mois</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
