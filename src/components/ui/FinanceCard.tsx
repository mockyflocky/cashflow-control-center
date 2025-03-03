
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinanceCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
  title,
  value,
  icon,
  className,
  valueClassName
}) => {
  return (
    <Card className={cn("hover-scale card-transition", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          {title}
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceCard;
