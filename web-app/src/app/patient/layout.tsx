import PortalLayout from '@/components/layout/PortalLayout';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}
