import { RegistrationLayout } from '@/components/registration-layout';

export default function RegistrationRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RegistrationLayout>{children}</RegistrationLayout>;
} 