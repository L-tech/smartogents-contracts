import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label: string;
  isActive?: boolean;
};

export const NavButton = ({ href, label, isActive }: Props) => {
  return (
    <Button
      asChild
      size="sm"
      variant="ghost"
      className={cn(isActive ? "text-black" : "text-black/50")}
    >
      <Link to={href}>{label}</Link>
    </Button>
  );
};
