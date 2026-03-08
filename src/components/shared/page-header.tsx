import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  className?: string;
};

export function PageHeader({ title, className }: PageHeaderProps) {
  return <h1 className={cn("text-3xl font-bold", className)}>{title}</h1>;
}
