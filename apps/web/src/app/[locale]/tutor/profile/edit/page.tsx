import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { getTutorProfile } from '@/services/tutor/tutor-profile-service'
import { getCurrentUserServer } from '@/services/auth/auth-server-service'
import EditProfileForm from '@/components/tutor/editTutorProfileForm'
import { getLocalePath } from '@/utils/i18n/locale-path'
import { LocalePageProps } from '@/types/local/page-props'

export default async function EditProfile({ params }: LocalePageProps) {
  const user = await getCurrentUserServer()
  const { locale } = await params
  if (!user) {
    redirect(getLocalePath(locale, '/login'))
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