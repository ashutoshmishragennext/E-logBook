import { TriangleAlert } from "lucide-react";

interface Props {
  message?: string;
}

export function FormError({ message }: Props) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-red-700/15 p-3 text-sm text-white">
      <TriangleAlert className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}
