import { AuthGuard } from "@/components/auth/auth-guard";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["tutor"]}>{children}</AuthGuard>;
}
