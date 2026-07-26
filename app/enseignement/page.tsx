import { redirect } from "next/navigation";

// La partie « Enseignement » a été intégrée à l'Académie (parcours « Enseignements »).
export default function EnseignementPage() {
  redirect("/etude?parcours=enseignements");
}
