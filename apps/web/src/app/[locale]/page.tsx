import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <Button variant="outline">Welcome to Mentora</Button>
    </AuthGuard>
  );
}
