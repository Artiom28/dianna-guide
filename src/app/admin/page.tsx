import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getButtons, getRulesText, getServicesText } from "@/lib/content";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "DiAnna Guide — Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Middleware вже відсіює запити без cookie на рівні Edge, але строгу
  // (криптографічну) перевірку робимо тут, у Node-шарі.
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  const [buttons, servicesText, rulesText] = await Promise.all([
    getButtons(),
    getServicesText(),
    getRulesText(),
  ]);

  return (
    <AdminDashboard
      initialButtons={buttons}
      initialServicesText={servicesText}
      initialRulesText={rulesText}
    />
  );
}
