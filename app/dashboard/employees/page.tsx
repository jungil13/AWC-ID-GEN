'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Search, Plus, Pencil, Trash2, ChevronDown, User, Briefcase,
  FileText, Phone, Camera, X, Loader2, AlertCircle, Users
} from 'lucide-react'
import { EmployeeWithDetails } from '@/types/database.types'
import { supabase } from '@/lib/supabase'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithDetails | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const departments = Array.from(
    new Set(
      employees
        .map((emp) => emp.employment_details?.[0]?.department)
        .filter((dept): dept is string => Boolean(dept))
    )
  )

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      emp.employee_no.toLowerCase().includes(searchTerm.toLowerCase())
    const empDetails = emp.employment_details?.[0]
    const matchesDept = filterDepartment ? empDetails?.department === filterDepartment : true
    const matchesStatus = filterStatus ? empDetails?.employment_status === filterStatus : true
    return matchesSearch && matchesDept && matchesStatus
  })

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setShowModal(true)
  }

  const handleEditEmployee = (employee: EmployeeWithDetails) => {
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Delete this employee? This will also remove their employment details and emergency contacts.')) return
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-14 bg-slate-200 rounded w-full" />
          <div className="h-96 bg-slate-200 rounded w-full" />
        </div>
      </div>
    )
  }

  const statusConfig: Record<string, { label: string; classes: string }> = {
    Active:     { label: 'Active',     classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    Terminated: { label: 'Terminated', classes: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
    Resigned:   { label: 'Resigned',   classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    Suspended:  { label: 'Suspended',  classes: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200' },
    Unassigned: { label: 'Unassigned', classes: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Users size={18} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {employees.length} total staff &mdash; manage profiles, credentials, and contacts
            </p>
          </div>
        </div>
        <button
          onClick={handleAddEmployee}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-md shadow-blue-500/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Employee
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="relative">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Terminated">Terminated</option>
              <option value="Resigned">Resigned</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Position</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((employee) => {
                const empDetails = employee.employment_details?.[0] || {}
                const statusKey = empDetails.employment_status || 'Unassigned'
                const status = statusConfig[statusKey] || statusConfig.Unassigned

                return (
                  <tr key={employee.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {employee.photo_url ? (
                            <img src={employee.photo_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blue-600 font-bold text-sm uppercase">
                              {employee.first_name[0]}{employee.last_name[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{employee.employee_no}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-slate-700 font-medium">{empDetails.designation || <span className="text-slate-400">—</span>}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {empDetails.department || '—'}{empDetails.company ? ` · ${empDetails.company}` : ''}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-slate-700">{employee.contact_no || <span className="text-slate-400">—</span>}</div>
                      {employee.date_of_birth && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          DOB: {new Date(employee.date_of_birth).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${status.classes}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition flex items-center justify-center"
                          title="Edit employee"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition flex items-center justify-center"
                          title="Delete employee"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <AlertCircle size={32} strokeWidth={1.5} className="text-slate-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-500">No records found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            fetchEmployees()
          }}
        />
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function EmployeeModal({
  employee,
  onClose,
  onSave,
}: {
  employee: EmployeeWithDetails | null
  onClose: () => void
  onSave: () => void
}) {
  const [activeTab, setActiveTab] = useState<'personal' | 'work' | 'gov' | 'emergency' | 'assets'>('personal')
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [sigPreview, setSigPreview] = useState<string | null>(null)
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const [formData, setFormData] = useState({
    employee_no: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    contact_no: '',
    sss_no: '',
    phic_no: '',
    hdmf_no: '',
    tin_no: '',
    photo_url: '',
    signature_url: '',
    company: '',
    department: '',
    designation: '',
    date_hired: '',
    employment_status: 'Active',
    contact_person: '',
    contact_address: '',
    contact_number: '',
  })

  useEffect(() => {
    if (employee) {
      const empDetails = employee.employment_details?.[0] || {}
      const emgContacts = employee.emergency_contacts?.[0] || {}
      setFormData({
        employee_no: employee.employee_no || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        middle_name: employee.middle_name || '',
        date_of_birth: employee.date_of_birth || '',
        contact_no: employee.contact_no || '',
        sss_no: employee.sss_no || '',
        phic_no: employee.phic_no || '',
        hdmf_no: employee.hdmf_no || '',
        tin_no: employee.tin_no || '',
        photo_url: employee.photo_url || '',
        signature_url: employee.signature_url || '',
        company: empDetails.company || '',
        department: empDetails.department || '',
        designation: empDetails.designation || '',
        date_hired: empDetails.date_hired || '',
        employment_status: empDetails.employment_status || 'Active',
        contact_person: emgContacts.contact_person || '',
        contact_address: emgContacts.contact_address || '',
        contact_number: emgContacts.contact_number || '',
      })
      setPhotoPreview(employee.photo_url || null)
      setSigPreview(employee.signature_url || null)
    }
  }, [employee])

  useEffect(() => {
    if (activeTab === 'assets' && signatureMode === 'draw') {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.strokeStyle = '#1e293b'
          ctx.lineWidth = 2.5
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
        }
      }
    }
  }, [activeTab, signatureMode])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
    if ('touches' in e) e.preventDefault()
  }

  const stopDrawing = () => setIsDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
    try {
      const fileName = `${formData.employee_no || 'profile'}-${Date.now()}.png`
      const { data, error } = await supabase.storage.from('employee-assets').upload(`photos/${fileName}`, file, { cacheControl: '3600', upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('employee-assets').getPublicUrl(data.path)
      setFormData(prev => ({ ...prev, photo_url: publicUrl }))
    } catch {
      const base64 = await new Promise<string>((resolve) => {
        const fr = new FileReader()
        fr.onloadend = () => resolve(fr.result as string)
        fr.readAsDataURL(file)
      })
      setFormData(prev => ({ ...prev, photo_url: base64 }))
    }
  }

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setSigPreview(reader.result as string)
    reader.readAsDataURL(file)
    try {
      const fileName = `${formData.employee_no || 'signature'}-${Date.now()}.png`
      const { data, error } = await supabase.storage.from('employee-assets').upload(`signatures/${fileName}`, file, { cacheControl: '3600', upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('employee-assets').getPublicUrl(data.path)
      setFormData(prev => ({ ...prev, signature_url: publicUrl }))
    } catch {
      const base64 = await new Promise<string>((resolve) => {
        const fr = new FileReader()
        fr.onloadend = () => resolve(fr.result as string)
        fr.readAsDataURL(file)
      })
      setFormData(prev => ({ ...prev, signature_url: base64 }))
    }
  }

  const saveSignatureFromCanvas = async () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const dataUrl = canvas.toDataURL('image/png')
    const blank = document.createElement('canvas')
    blank.width = canvas.width
    blank.height = canvas.height
    if (dataUrl === blank.toDataURL('image/png') && !sigPreview) return null
    if (dataUrl === blank.toDataURL('image/png') && sigPreview) return formData.signature_url
    setSigPreview(dataUrl)
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'signature.png', { type: 'image/png' })
      const fileName = `${formData.employee_no || 'signature'}-${Date.now()}.png`
      const { data, error } = await supabase.storage.from('employee-assets').upload(`signatures/${fileName}`, file, { cacheControl: '3600', upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('employee-assets').getPublicUrl(data.path)
      return publicUrl
    } catch {
      return dataUrl
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
 
    try {
      // 1. Process canvas signature if in draw mode
      let finalSignatureUrl = formData.signature_url
      if (signatureMode === 'draw') {
        const canvasUrl = await saveSignatureFromCanvas()
        if (canvasUrl) finalSignatureUrl = canvasUrl
      }
 
      // 2. Build payload — employment_details and emergency_contacts are
      //    plain objects. The API routes handle both object and array shapes,
      //    but sending objects is cleaner and avoids the Array.isArray branch.
      const payload = {
        // Core employee fields
        employee_no: formData.employee_no,
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name || null,
        date_of_birth: formData.date_of_birth || null,
        contact_no: formData.contact_no || null,
        sss_no: formData.sss_no || null,
        phic_no: formData.phic_no || null,
        hdmf_no: formData.hdmf_no || null,
        tin_no: formData.tin_no || null,
        photo_url: formData.photo_url || null,
        signature_url: finalSignatureUrl || null,
 
        // Single object — route does upsert logic internally
        employment_details: {
          // Pass the existing row id so the PUT route can UPDATE directly
          // instead of falling back to a lookup SELECT. On POST (new employee)
          // this will be undefined and is intentionally omitted from the INSERT.
          id: employee?.employment_details?.[0]?.id ?? undefined,
          company: formData.company || null,
          department: formData.department || null,
          designation: formData.designation || null,
          date_hired: formData.date_hired || null,
          employment_status: formData.employment_status || 'Active',
        },
 
        // Single object — same upsert pattern
        emergency_contacts: {
          id: employee?.emergency_contacts?.[0]?.id ?? undefined,
          contact_person: formData.contact_person || null,
          contact_address: formData.contact_address || null,
          contact_number: formData.contact_number || null,
        },
      }
 
      // 3. POST for new employees, PUT for existing ones
      const url = employee ? `/api/employees/${employee.id}` : '/api/employees'
      const method = employee ? 'PUT' : 'POST'
 
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
 
      const result = await response.json()
 
      if (!response.ok) {
        // API returned a 4xx/5xx — show the server error message
        throw new Error(result.error || `Server error ${response.status}`)
      }
 
      // 4. Surface any partial warnings (child table failures that didn't
      //    block the main record from saving)
      if (result._warnings?.length) {
        console.warn('Saved with warnings:', result._warnings)
        alert(
          `Employee saved, but some details could not be stored:\n\n` +
          result._warnings.join('\n') +
          `\n\nPlease re-open the record and re-save the affected tab.`
        )
      }
 
      onSave()
    } catch (error: any) {
      console.error('Error saving employee:', error)
      alert(`Save failed: ${error.message || 'Unknown error. Please try again.'}`)
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition'

  const labelClass = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

  const tabs = [
    { id: 'personal',   label: 'Profile',    Icon: User },
    { id: 'work',       label: 'Employment', Icon: Briefcase },
    { id: 'gov',        label: 'Gov. IDs',   Icon: FileText },
    { id: 'emergency',  label: 'Emergency',  Icon: Phone },
    { id: 'assets',     label: 'Media',      Icon: Camera },
  ] as const

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              {employee ? <Pencil size={14} className="text-white" /> : <Plus size={14} className="text-white" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {employee ? 'Edit Employee' : 'New Employee'}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Complete all relevant sections before saving.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-100 bg-white px-2 overflow-x-auto">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
              }`}
            >
              <Icon size={13} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Personal */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Employee No <span className="text-blue-500">*</span></label>
                <input type="text" required placeholder="e.g. EMP-2026-0001" value={formData.employee_no}
                  onChange={(e) => setFormData({ ...formData, employee_no: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact Number</label>
                <input type="text" placeholder="+63 917 123 4567" value={formData.contact_no}
                  onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>First Name <span className="text-blue-500">*</span></label>
                <input type="text" required value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name <span className="text-blue-500">*</span></label>
                <input type="text" required value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Middle Name</label>
                <input type="text" value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className={inputClass} />
              </div>
            </div>
          )}

          {/* Employment */}
          {activeTab === 'work' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Company / Organization</label>
                <input type="text" placeholder="e.g. Globex Corporation" value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input type="text" placeholder="e.g. Human Resources" value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Designation / Role</label>
                <input type="text" placeholder="e.g. Lead Coordinator" value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date Hired</label>
                <input type="date" value={formData.date_hired}
                  onChange={(e) => setFormData({ ...formData, date_hired: e.target.value })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Employment Status</label>
                <div className="relative">
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                    className={`${inputClass} appearance-none`}>
                    <option value="Active">Active</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Gov IDs */}
          {activeTab === 'gov' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>SSS No.</label>
                <input type="text" placeholder="XX-XXXXXXX-X" value={formData.sss_no}
                  onChange={(e) => setFormData({ ...formData, sss_no: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>PhilHealth No. (PHIC)</label>
                <input type="text" placeholder="XX-XXXXXXXXX-X" value={formData.phic_no}
                  onChange={(e) => setFormData({ ...formData, phic_no: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pag-IBIG No. (HDMF)</label>
                <input type="text" placeholder="XXXX-XXXX-XXXX" value={formData.hdmf_no}
                  onChange={(e) => setFormData({ ...formData, hdmf_no: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>TIN No.</label>
                <input type="text" placeholder="XXX-XXX-XXX-000" value={formData.tin_no}
                  onChange={(e) => setFormData({ ...formData, tin_no: e.target.value })} className={inputClass} />
              </div>
            </div>
          )}

          {/* Emergency */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contact Person</label>
                  <input type="text" placeholder="e.g. Jane Doe (Spouse)" value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact Number</label>
                  <input type="text" placeholder="+63 917 111 2222" value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <textarea rows={3} placeholder="e.g. 456 Oak Avenue, Springfield" value={formData.contact_address}
                  onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                  className={inputClass + ' resize-none'} />
              </div>
            </div>
          )}

          {/* Assets */}
          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Photo */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/30">
                <h3 className="text-sm font-semibold text-slate-700">Portrait Photo</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-28 h-32 border border-slate-200 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-inner">
                    {photoPreview
                      ? <img src={photoPreview} alt="Portrait" className="w-full h-full object-cover" />
                      : <User size={32} className="text-slate-300" />}
                  </div>
                  <label className="w-full cursor-pointer bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg px-4 py-2.5 text-center block text-xs font-semibold text-slate-600 transition">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Passport-size portrait, cropped to head and chest.
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/30 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Signature</h3>
                  <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5">
                    {(['draw', 'upload'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSignatureMode(mode)}
                        className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-colors capitalize ${
                          signatureMode === mode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {signatureMode === 'draw' ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
                      <canvas
                        ref={canvasRef} width={280} height={120}
                        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                        className="cursor-crosshair block w-full"
                      />
                    </div>
                    <button type="button" onClick={clearCanvas}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition">
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="h-16 w-full border border-slate-200 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-inner p-2">
                      {sigPreview
                        ? <img src={sigPreview} alt="Signature" className="h-full object-contain" />
                        : <span className="text-[10px] text-slate-400">No file uploaded</span>}
                    </div>
                    <label className="w-full cursor-pointer bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg px-4 py-2.5 text-center block text-xs font-semibold text-slate-600 transition">
                      Upload Signature
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                    </label>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Printed on the reverse of the ID card for verification.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
            <p className="text-[11px] text-slate-400">Fields marked <span className="text-blue-500 font-semibold">*</span> are required</p>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} disabled={saving}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-semibold transition disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-md shadow-blue-500/20 disabled:opacity-50">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Employee'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}