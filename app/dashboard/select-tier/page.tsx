import { redirect } from "next/navigation";

export default function SelectTierRedirect() {
  redirect("/dashboard/select-package");
}
