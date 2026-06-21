import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { getTutorProfile } from '@/services/tutor/tutor-profile-service'
import { getCurrentUserServer } from '@/services/auth/auth-server-service'
import EditProfileForm from '@/components/tutor/editTutorProfileForm'

export default async function EditProfile() {
  const user = await getCurrentUserServer()

  if (!user) {
    redirect('/login')
  }

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['tutorProfile', user.id],
    queryFn: () => getTutorProfile(user.id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditProfileForm tutorId={user.id} />
    </HydrationBoundary>
  )
}