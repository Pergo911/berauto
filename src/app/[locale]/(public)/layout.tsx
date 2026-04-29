import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EmailVerificationBanner />
      {children}
    </>
  );
}
