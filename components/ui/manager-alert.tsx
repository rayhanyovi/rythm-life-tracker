import { Check, CircleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ManagerErrorAlert({
  message,
  title = "Update failed",
}: {
  message: string;
  title?: string;
}) {
  return (
    <div className="px-5 pt-4">
      <Alert variant="destructive">
        <CircleAlert className="size-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

export function ManagerStatusAlert({ message }: { message: string }) {
  return (
    <div className="px-5 pt-4">
      <Alert>
        <Check className="size-4" />
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
