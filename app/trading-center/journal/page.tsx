import JournalClient from "./JournalClient";

export const metadata = {
  title: "Journal de performance — Trading Center",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <JournalClient />;
}
