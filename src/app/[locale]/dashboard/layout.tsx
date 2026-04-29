import { Navbar } from "@/components/shared/navbar";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar panel="dashboard" />
      <EmailVerificationBanner />
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
