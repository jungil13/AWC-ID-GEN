import { supabase } from '@/lib/supabase'
import { Employee } from '@/types/database.types'
import {
  Users,
  UserCheck,
  Building2,
  BadgeCheck,
  UserPlus,
  CreditCard,
  ArrowRight,
  Activity,
} from 'lucide-react'

export const revalidate = 0 // Disable page caching to ensure stats are always fresh

export default async function DashboardPage() {
  const { data: employees } = await supabase.from('employees').select('*')
  const { data: employmentDetails } = await supabase.from('employment_details').select('*')

  const employeeCount = employees?.length || 0
  const activeEmployees = employmentDetails?.filter((e: any) => e.employment_status === 'Active').length || 0

  // Dynamically calculate departments from database
  const departments = Array.from(new Set(employmentDetails?.map((e: any) => e.department).filter(Boolean)))
  const departmentCount = departments.length || 0

  // Dynamically calculate IDs generated (employees with both photo and signature)
  const idCardsGenerated = employees?.filter((e: any) => e.photo_url && e.signature_url).length || 0

  const stats = [
    {
      name: 'Total Employees',
      value: employeeCount,
      icon: Users,
      color: 'from-blue-600 to-cyan-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    {
      name: 'Active Employees',
      value: activeEmployees,
      icon: UserCheck,
      color: 'from-emerald-600 to-green-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    {
      name: 'Departments',
      value: departmentCount,
      icon: Building2,
      color: 'from-violet-600 to-purple-600',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
    },
    {
      name: 'IDs Generated',
      value: idCardsGenerated,
      icon: BadgeCheck,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
    },
  ]

  // Get recent 3 additions
  const recentEmployees = employees
    ? [...employees]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
    : []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900 p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white">
              AWC Employee Management System
            </h1>

            <p className="mt-3 text-slate-300 max-w-2xl">
              Manage employees, departments, and professional ID cards from a
              centralized administrative dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-medium">
              System Status: Operational
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.name}
              className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.name}
                  </p>

                  <h3 className="mt-2 text-4xl font-bold text-slate-900">
                    {stat.value}
                  </h3>
                </div>

                <div
                  className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-7 h-7 ${stat.text}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Activity className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <a
              href="/dashboard/employees"
              className="group flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Employee Management
                  </p>

                  <p className="text-sm text-slate-500">
                    Add, edit and manage employee records
                  </p>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
            </a>

            <a
              href="/dashboard/id-generator"
              className="group flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    ID Card Generator
                  </p>

                  <p className="text-sm text-slate-500">
                    Generate and print professional employee IDs
                  </p>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
            </a>
          </div>
        </div>

        {/* Recent Activity / Recently Registered */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-3 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Recently Registered Employees
          </h2>
          <div className="space-y-4">
            {recentEmployees.length > 0 ? (
              recentEmployees.map((emp) => {
                const dept = employmentDetails?.find((d: any) => d.employee_id === emp.id)?.department || 'Unassigned'
                const design = employmentDetails?.find((d: any) => d.employee_id === emp.id)?.designation || 'Staff'
                return (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 shadow-inner">
                        {emp.photo_url ? (
                          <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-slate-500 font-bold text-sm uppercase">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {design} &bull; <span className="text-slate-500 font-medium">{dept}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full inline-block leading-none">
                        {emp.employee_no}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                No employees registered yet. Go to "Quick Actions" to add some!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
