import StatsCard from '@/components/admin/StatsCard'
import PlatformHealth from '@/components/admin/PlatformHealth'
import FinancialChart from '@/components/admin/FinancialChart'

import {
  Users,
  UserCircle,
  Calendar,
  DollarSign,
  Activity,
  GraduationCap,
  FileCheck,
  Wallet

} from 'lucide-react'
import { statsData } from '@/mocks/mock-data'

const iconMap = {
  'Total Users': <Users />,
  'Total Tutors': <UserCircle />,
  'Total Bookings': <Calendar />,
  'Total Revenue': <DollarSign />,
}


export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          System Overview
        </h1>

        <p className="text-gray-500">
          Real-time platform metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <StatsCard
        title="Total Learners"
        value="12,840"
        change={12}
        changeLabel="this month"
        icon={<Users  className="h-5 w-5" />}
        trend="up"
        />

        <StatsCard
        title="Total Tutors"
        value="1,204"
        changeLabel="Steady growth"
        icon={<GraduationCap className="h-5 w-5" />}
        trend="neutral"
        />

        <StatsCard
        title="Total Bookings"
        value="45,921"
        change={8}
        changeLabel="vs last week"
        icon={<Calendar className="h-5 w-5" />}
        trend="up"
        />

        <StatsCard
        title="Revenue"
        value="$48,290"
        change={-3.2}
        changeLabel="vs last month"
        icon={<DollarSign className="h-5 w-5" />}
        trend="down"
        />

        <StatsCard
        title="Pending Approvals"
        value="28"
        change={0}
        changeLabel="require attention"
        icon={<FileCheck className="h-5 w-5 " />}
        trend="up"
        />

        <StatsCard
        title="Withdrawal Requests"
        value="14"
        change={0}
        changeLabel="in progress"
        icon={<Wallet className="h-5 w-5" />}
        trend="neutral"
        />






      </div>
      

      {/* Performance + Health */}
      <div className="grid grid-cols-1 gap-6">

          <PlatformHealth />
      </div>

      {/* Financial Chart */}
      <FinancialChart />
    </div>
  )
}