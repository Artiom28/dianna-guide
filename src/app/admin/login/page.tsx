import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Вхід — DiAnna Guide Admin",
};

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-sky-100 via-sky-50 to-white px-5">
      <LoginForm />
    </div>
  );
}
