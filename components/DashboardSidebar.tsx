'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  LogOut,
  Building2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Employees',
    href: '/dashboard/employees',
    icon: Users,
  },
  {
    name: 'ID Generator',
    href: '/dashboard/id-generator',
    icon: BadgeCheck,
  },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/login')
        return
      }

      setUserEmail(session.user.email ?? null)
      setLoading(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login')
        return
      }

      setUserEmail(session.user.email ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-slate-200 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </aside>
    )
  }

  const initials = userEmail
    ? userEmail.substring(0, 2).toUpperCase()
    : 'AD'

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] bg-white border border-slate-200 shadow-lg rounded-xl p-2"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-slate-200 shadow-sm
          transition-all duration-300 z-50

          ${collapsed ? 'w-20' : 'w-72'}

          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >
        {/* Header */}
       <div
  className={`border-b border-slate-200 flex-col transition-all${
    collapsed ? 'h-24 py-3' : 'h-40 py-5'
  }`}
>

  {/* Title */}
  {!collapsed && (
    <>
      <h2 className="mt-2 text-base font-bold text-blue-600 text-center">
        AWC ID Generator
      </h2>
      <p className="text-xs text-slate-500 text-center">
        Employee Management System
      </p>
    </>
  )}

  {/* Mobile Close Button */}
  <button
    onClick={() => setMobileOpen(false)}
    className="lg:hidden absolute top-4 right-4 text-slate-500"
  >
    <X size={20} />
  </button>
</div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          {!collapsed && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
              Main Menu
            </p>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center ${
                    collapsed
                      ? 'justify-center'
                      : 'justify-between'
                  } rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />

                    {!collapsed && (
                      <span className="font-medium text-sm">
                        {item.name}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <ChevronRight
                      size={16}
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-blue-600'
                      }
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <div
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'gap-3'
            } p-3 rounded-xl bg-slate-50`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center text-white font-semibold">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 truncate">
                  Administrator
                </h3>

                <p className="text-xs text-slate-500 truncate">
                  {userEmail}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}