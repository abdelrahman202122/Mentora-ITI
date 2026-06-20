import { AuthGuard } from "@/components/auth/AuthGuard";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["tutor"]}>{children}</AuthGuard>;
}
