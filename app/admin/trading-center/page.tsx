import AdminTradingClient from "./AdminTradingClient";

export const metadata = {
  title: "Trading Center — Administration",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminTradingClient />;
}
