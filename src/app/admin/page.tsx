import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getButtons, getRulesText, getSocials } from "@/lib/content";
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

  const [buttons, rulesText, socials] = await Promise.all([
    getButtons(),
    getRulesText(),
    getSocials(),
  ]);

  return (
    <AdminDashboard
      initialButtons={buttons}
      initialRulesText={rulesText}
      initialSocials={socials}
    />
  );
}
