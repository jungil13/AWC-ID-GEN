'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CreditCard, Download, RotateCcw, Building2, User, ChevronDown,
  Upload, Shield, Wifi, BadgeCheck, AlertTriangle, Loader2, Shuffle,
  Phone, Mail, MapPin, Globe
} from 'lucide-react'
import { EmployeeWithDetails } from '@/types/database.types'
import html2canvas from 'html2canvas'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customization {
  primaryColor: string
  accentColor: string
  nameColor: string
  roleColor: string
  metaColor: string
  showLogo: boolean
  codeStyle: 'barcode' | 'qrcode'
  companyName: string
  companyShort: string
  companyAddress: string
  companyPhone: string
  companyWebsite: string
  companyEmail: string
  officerName: string
  officerTitle: string
  officerSignatureUrl: string
  expirationYears: number
  logoUrl: string
}

// ─── Random Themes ────────────────────────────────────────────────────────────

const THEMES: Array<Pick<Customization, 'primaryColor' | 'accentColor' | 'nameColor' | 'roleColor' | 'metaColor'>> = [
  { primaryColor: '#1c3ba0', accentColor: '#6ab04c', nameColor: '#1c3ba0', roleColor: '#6ab04c', metaColor: '#222222' },
  { primaryColor: '#8B1A1A', accentColor: '#D4A017', nameColor: '#8B1A1A', roleColor: '#c8860d', metaColor: '#222222' },
  { primaryColor: '#0d5c63', accentColor: '#f77f00', nameColor: '#0d5c63', roleColor: '#f77f00', metaColor: '#222222' },
  { primaryColor: '#2d1b69', accentColor: '#e040fb', nameColor: '#2d1b69', roleColor: '#b71c8e', metaColor: '#222222' },
  { primaryColor: '#004d40', accentColor: '#ff6f00', nameColor: '#004d40', roleColor: '#e65100', metaColor: '#1a1a1a' },
  { primaryColor: '#1a237e', accentColor: '#00bcd4', nameColor: '#1a237e', roleColor: '#007c91', metaColor: '#222222' },
  { primaryColor: '#263238', accentColor: '#f44336', nameColor: '#263238', roleColor: '#c62828', metaColor: '#333333' },
  { primaryColor: '#4a0072', accentColor: '#00e676', nameColor: '#4a0072', roleColor: '#00a152', metaColor: '#111111' },
  { primaryColor: '#bf360c', accentColor: '#1565c0', nameColor: '#bf360c', roleColor: '#0d47a1', metaColor: '#222222' },
  { primaryColor: '#006064', accentColor: '#ffd600', nameColor: '#006064', roleColor: '#c79a00', metaColor: '#222222' },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IDGeneratorPage() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null)
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [loading, setLoading] = useState(true)
  const [isFlipped, setIsFlipped] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Hidden refs for download (always rendered, never flipped, no transform)
  const hiddenFrontRef = useRef<HTMLDivElement>(null)
  const hiddenBackRef = useRef<HTMLDivElement>(null)

  const [customization, setCustomization] = useState<Customization>({
    primaryColor: '#1c3ba0',
    accentColor: '#6ab04c',
    nameColor: '#1c3ba0',
    roleColor: '#6ab04c',
    metaColor: '#222222',
    showLogo: true,
    codeStyle: 'qrcode',
    companyName: 'ABEJO WATERS CORPORATION',
    companyShort: 'AWC',
    companyAddress: '100 Innovation Way, Silicon Valley',
    companyPhone: '(032) 123-4567',
    companyWebsite: 'www.abejowaters.com',
    companyEmail: 'info@abejowaters.com',
    officerName: 'Gabino M. Abejo Jr.',
    officerTitle: 'President',
    officerSignatureUrl: '',
    expirationYears: 3,
    logoUrl: '',
  })

  useEffect(() => { fetchEmployees() }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      setEmployees(data)
      if (data.length > 0) setSelectedEmployee(data[0])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setCustomization(prev => ({ ...prev, logoUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const handleOfficerSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setCustomization(prev => ({ ...prev, officerSignatureUrl: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const applyRandomTheme = () => {
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)]
    setCustomization(prev => ({ ...prev, ...theme }))
  }

  // Download uses hidden refs so there is no 3D transform applied — fixes mirroring bug
  const downloadCard = async (side: 'front' | 'back') => {
    const element = side === 'front' ? hiddenFrontRef.current : hiddenBackRef.current
    if (!element) return
    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
      })
      const link = document.createElement('a')
      link.download = `ID_${side.toUpperCase()}_${selectedEmployee?.employee_no || 'CARD'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const downloadBoth = async () => {
    setDownloading(true)
    await downloadCard('front')
    await new Promise(r => setTimeout(r, 400))
    await downloadCard('back')
    setDownloading(false)
  }

  const inputClass = 'w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition'
  const labelClass = 'block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-14 bg-slate-200 rounded-xl w-1/3" />
          <div className="h-96 bg-slate-200 rounded-xl w-full" />
        </div>
      </div>
    )
  }

  const missingAssets = selectedEmployee && (!selectedEmployee.photo_url || !selectedEmployee.signature_url)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
          <CreditCard size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ID Card Generator</h1>
          <p className="text-xs text-slate-500 mt-0.5">Design and export staff ID badges synced to employee records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT PANEL ──────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">

          {/* Random Theme */}
          <button
            onClick={applyRandomTheme}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-sm font-semibold text-slate-600 hover:text-blue-700 transition shadow-sm"
          >
            <Shuffle size={14} />
            Generate Random Theme
          </button>

          {/* Employee Select */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User size={13} /> Select Employee
            </h2>
            <div className="relative">
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => setSelectedEmployee(employees.find(emp => emp.id === e.target.value) || null)}
                className={inputClass + ' appearance-none'}
              >
                <option value="">Choose an employee...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_no} — {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orientation */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={13} /> Card Orientation
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(['vertical', 'horizontal'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={`py-2.5 rounded-lg text-xs font-semibold border transition capitalize ${
                    orientation === o
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {o} Badge
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Shield size={13} /> Card Colors
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'primaryColor', label: 'Header BG' },
                { key: 'accentColor', label: 'Wave Accent' },
                { key: 'nameColor', label: 'Name Color' },
                { key: 'roleColor', label: 'Role Color' },
                { key: 'metaColor', label: 'ID / Web Color' },
              ] as const).map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customization[key]}
                      onChange={(e) => setCustomization({ ...customization, [key]: e.target.value })}
                      className="w-10 h-9 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                    />
                    <span className="text-xs text-slate-500 font-mono">{customization[key]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={13} /> Organization Details
            </h2>
            <div>
              <label className={labelClass}>Full Company Name</label>
              <input type="text" value={customization.companyName}
                onChange={(e) => setCustomization({ ...customization, companyName: e.target.value.toUpperCase() })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Short Name / Acronym</label>
              <input type="text" value={customization.companyShort}
                onChange={(e) => setCustomization({ ...customization, companyShort: e.target.value.toUpperCase() })}
                className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" value={customization.companyPhone}
                  onChange={(e) => setCustomization({ ...customization, companyPhone: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input type="text" value={customization.companyWebsite}
                  onChange={(e) => setCustomization({ ...customization, companyWebsite: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="text" value={customization.companyEmail}
                onChange={(e) => setCustomization({ ...customization, companyEmail: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" value={customization.companyAddress}
                onChange={(e) => setCustomization({ ...customization, companyAddress: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Brand Logo</label>
              <label className="w-full cursor-pointer flex items-center justify-center gap-2 bg-white border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-500 transition">
                <Upload size={13} />
                {customization.logoUrl ? 'Replace Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Code Style & Expiry */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Wifi size={13} /> Security Code
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Code Style</label>
                <div className="relative">
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select value={customization.codeStyle}
                    onChange={(e) => setCustomization({ ...customization, codeStyle: e.target.value as any })}
                    className={inputClass + ' appearance-none text-xs'}>
                    <option value="qrcode">QR Code</option>
                    <option value="barcode">Barcode</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Valid (Years)</label>
                <input type="number" min="1" max="10" value={customization.expirationYears}
                  onChange={(e) => setCustomization({ ...customization, expirationYears: parseInt(e.target.value) || 3 })}
                  className={inputClass + ' text-xs'} />
              </div>
            </div>
          </div>

          {/* Signing Authority */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <BadgeCheck size={13} /> Signing Authority
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Officer Name</label>
                <input type="text" value={customization.officerName}
                  onChange={(e) => setCustomization({ ...customization, officerName: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input type="text" value={customization.officerTitle}
                  onChange={(e) => setCustomization({ ...customization, officerTitle: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Officer Signature</label>
              <label className="w-full cursor-pointer flex items-center justify-center gap-2 bg-white border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-500 transition">
                <Upload size={13} />
                {customization.officerSignatureUrl ? 'Replace Signature' : 'Upload Signature'}
                <input type="file" accept="image/*" onChange={handleOfficerSigUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Preview ──────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          <div className="bg-slate-100 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {selectedEmployee ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-semibold uppercase tracking-widest">
                  <span className={!isFlipped ? 'text-slate-800' : 'text-slate-400'}>Front</span>
                  <span>/</span>
                  <span className={isFlipped ? 'text-slate-800' : 'text-slate-400'}>Back</span>
                </div>

                {/* 3D Flip Card — preview only, NOT used for download */}
                <div
                  className="cursor-pointer select-none"
                  onClick={() => setIsFlipped(f => !f)}
                  style={{ perspective: '1200px' }}
                >
                  <div
                    style={{
                      transition: 'transform 0.65s cubic-bezier(0.4,0.2,0.2,1)',
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      position: 'relative',
                      width: orientation === 'vertical' ? '260px' : '410px',
                      height: orientation === 'vertical' ? '410px' : '260px',
                    }}
                  >
                    {/* Front face */}
                    <div style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'
                    }}>
                      <IDCardFront employee={selectedEmployee} customization={customization} orientation={orientation} />
                    </div>
                    {/* Back face — rotated 180deg for flip effect, content itself is NOT mirrored */}
                    <div style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'
                    }}>
                      <IDCardBack employee={selectedEmployee} customization={customization} orientation={orientation} />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsFlipped(f => !f)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition text-xs font-medium"
                >
                  <RotateCcw size={13} />
                  Click card or tap to flip
                </button>

                {missingAssets && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 max-w-sm text-left">
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Missing portrait or signature. Update in the{' '}
                      <a href="/dashboard/employees" className="underline font-semibold">Employees panel</a>.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <CreditCard size={48} strokeWidth={1} />
                <p className="text-sm font-semibold">No employee selected</p>
                <p className="text-xs text-center max-w-xs">Select a registered staff member from the left panel to preview their ID card.</p>
              </div>
            )}
          </div>

          {/* Download Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-3 gap-2">
            <button
              onClick={() => downloadCard('front')}
              disabled={!selectedEmployee || downloading}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} /> Front
            </button>
            <button
              onClick={() => downloadCard('back')}
              disabled={!selectedEmployee || downloading}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} /> Back
            </button>
            <button
              onClick={downloadBoth}
              disabled={!selectedEmployee || downloading}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {downloading ? 'Exporting...' : 'Download Both'}
            </button>
          </div>
        </div>
      </div>

      {/* ── HIDDEN RENDER TARGETS for html2canvas (off-screen, no transforms) ── */}
      {selectedEmployee && (
        <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none', zIndex: -1 }}>
          <div ref={hiddenFrontRef}>
            <IDCardFront employee={selectedEmployee} customization={customization} orientation={orientation} />
          </div>
          <div ref={hiddenBackRef} style={{ marginTop: 20 }}>
            <IDCardBack employee={selectedEmployee} customization={customization} orientation={orientation} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function QRCodeSVG({ value, size = 44 }: { value: string; size?: number }) {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = value.charCodeAt(i) + ((hash << 5) - hash)
  const grid = 17
  const cells: boolean[][] = Array(grid).fill(null).map(() => Array(grid).fill(false))
  const finder = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++) for (let dc = 0; dc < 7; dc++) {
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4))
        if (r + dr < grid && c + dc < grid) cells[r + dr][c + dc] = true
    }
  }
  finder(0, 0); finder(0, grid - 7); finder(grid - 7, 0)
  for (let r = 0; r < grid; r++) for (let c = 0; c < grid; c++) {
    const tl = r < 9 && c < 9, tr = r < 9 && c >= grid - 8, bl = r >= grid - 8 && c < 9
    if (tl || tr || bl) continue
    cells[r][c] = ((hash >> ((r * grid + c) % 32)) & 1) === 1
  }
  return (
    <div style={{ background: '#fff', padding: 3, borderRadius: 6 }}>
      <svg width={size} height={size} viewBox="0 0 17 17">
        {cells.map((row, r) => row.map((on, c) => on
          ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" />
          : null))}
      </svg>
    </div>
  )
}

function BarcodeSVG({ value, width = 100 }: { value: string; width?: number }) {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = value.charCodeAt(i) + ((hash << 5) - hash)
  const bars: { x: number; w: number }[] = []
  let x = 4
  for (let i = 0; i < 40; i++) {
    const w = ((hash >> (i % 10)) & 1) ? 2 : 1
    bars.push({ x, w })
    x += w + (((hash >> ((i + 5) % 10)) & 1) ? 2 : 1)
    if (x > 120) break
  }
  return (
    <div style={{ background: '#fff', padding: '4px 6px', borderRadius: 6 }}>
      <svg width={width} height={28} viewBox="0 0 130 28" preserveAspectRatio="none">
        {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={20} fill="#0f172a" />)}
        <text x="65" y="27" fontSize="5" fontFamily="monospace" textAnchor="middle" fill="#0f172a">{value}</text>
      </svg>
    </div>
  )
}

// ─── Lucide icon renderer for inline SVG (html2canvas compatible) ─────────────
// We render SVG paths directly instead of React components for print safety

function InlineIcon({ path, color = '#fff', size = 12 }: { path: string; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  mapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
}

// ─── ID Card Front ─────────────────────────────────────────────────────────────

function IDCardFront({ employee, customization, orientation }: {
  employee: EmployeeWithDetails
  customization: Customization
  orientation: 'vertical' | 'horizontal'
}) {
  const empDetails = employee.employment_details?.[0] || {}
  const designation = empDetails.designation || 'EMPLOYEE'
  const w = orientation === 'vertical' ? 260 : 410
  const h = orientation === 'vertical' ? 410 : 260
  const { primaryColor, accentColor, nameColor, roleColor, metaColor } = customization

  // Header takes ~45% of card height for vertical
  const headerH = orientation === 'vertical' ? 185 : 120
  const photoSize = orientation === 'vertical' ? 100 : 72

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 14,
        background: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      {/* ── Blue header background ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerH, backgroundColor: primaryColor }} />

      {/* ── Swooping S-curve on the left side of header (matches reference) ── */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: h, pointerEvents: 'none' }}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        {/* Main blue swooping shape — left side curve that goes down */}
        <path
          d={orientation === 'vertical'
            ? `M0,0 L${w},0 L${w},${headerH - 50} C${w * 0.7},${headerH + 10} ${w * 0.5},${headerH - 30} ${w * 0.35},${headerH - 10} C${w * 0.15},${headerH + 15} 0,${headerH - 25} 0,${headerH + 20} Z`
            : `M0,0 L${w},0 L${w},${headerH - 30} C${w * 0.7},${headerH + 5} ${w * 0.45},${headerH - 20} ${w * 0.3},${headerH - 5} C${w * 0.12},${headerH + 12} 0,${headerH - 10} 0,${headerH + 15} Z`
          }
          fill={primaryColor}
        />
      </svg>

      {/* ── Green accent curve at bottom-right corner ── */}
      <svg
        style={{ position: 'absolute', bottom: 0, right: 0, width: '100%', height: orientation === 'vertical' ? 70 : 50, pointerEvents: 'none' }}
        viewBox={`0 0 ${w} ${orientation === 'vertical' ? 70 : 50}`}
        preserveAspectRatio="none"
      >
        <path
          d={orientation === 'vertical'
            ? `M${w * 0.4},70 C${w * 0.55},35 ${w * 0.7},55 ${w},25 L${w},70 Z`
            : `M${w * 0.5},50 C${w * 0.65},20 ${w * 0.8},40 ${w},15 L${w},50 Z`
          }
          fill={accentColor}
          opacity="0.9"
        />
        <path
          d={orientation === 'vertical'
            ? `M${w * 0.55},70 C${w * 0.65},50 ${w * 0.8},65 ${w},40 L${w},70 Z`
            : `M${w * 0.6},50 C${w * 0.72},30 ${w * 0.85},45 ${w},25 L${w},50 Z`
          }
          fill={primaryColor}
          opacity="0.85"
        />
      </svg>

      {/* ── Logo / company in header ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerH - (orientation === 'vertical' ? 20 : 10),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '0 20px',
        zIndex: 5,
      }}>
        {customization.showLogo && customization.logoUrl ? (
          <img
            src={customization.logoUrl}
            alt="Logo"
            style={{ maxHeight: orientation === 'vertical' ? 80 : 56, maxWidth: '70%', objectFit: 'contain', marginTop: 8 }}
          />
        ) : (
          <>
            <div style={{ fontSize: orientation === 'vertical' ? 30 : 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {customization.companyShort}
            </div>
            <div style={{ fontSize: orientation === 'vertical' ? 7 : 6, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em', textAlign: 'center', textTransform: 'uppercase' }}>
              {customization.companyName}
            </div>
          </>
        )}
      </div>

      {/* ── VERTICAL LAYOUT ── */}
      {orientation === 'vertical' ? (
        <>
          {/* Circular photo — overlaps header/white boundary */}
          <div style={{
            position: 'absolute',
            top: headerH - photoSize / 2 - 15,
            left: '50%',
            marginLeft: -(photoSize / 2),
            width: photoSize,
            height: photoSize,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${primaryColor}`,
            boxShadow: `0 0 0 4px #fff, 0 4px 16px rgba(0,0,0,0.18)`,
            backgroundColor: '#e8eaf6',
            zIndex: 15,
          }}>
            {employee.photo_url
              ? (
                <img
                  src={employee.photo_url}
                  alt="Portrait"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                  crossOrigin="anonymous"
                />
              )
              : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: primaryColor, backgroundColor: '#e8eaf6' }}>
                  {employee.first_name[0]}{employee.last_name[0]}
                </div>
              )
            }
          </div>

          {/* Info below photo */}
          <div style={{
            position: 'absolute',
            top: headerH + photoSize / 2 - 6,
            left: 16,
            right: 16,
            bottom: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            zIndex: 10,
          }}>
            {/* Name */}
            <div style={{ fontSize: 15, fontWeight: 800, color: nameColor, letterSpacing: '-0.01em', textAlign: 'center', lineHeight: 1.2 }}>
              {employee.first_name.toUpperCase()} {employee.last_name.toUpperCase()}
            </div>
            {/* Role */}
            <div style={{ fontSize: 10.5, fontWeight: 600, color: roleColor, textAlign: 'center', fontStyle: 'italic' }}>
              {designation}
            </div>
            {/* Green divider */}
            <div style={{ width: 80, height: 2, backgroundColor: accentColor, borderRadius: 1, margin: '3px 0' }} />
            {/* ID No */}
            <div style={{ fontSize: 11, fontWeight: 700, color: metaColor, letterSpacing: '0.04em' }}>
              ID No. {employee.employee_no}
            </div>
            {/* Website */}
            <div style={{ fontSize: 9, color: metaColor, opacity: 0.7 }}>
              {customization.companyWebsite}
            </div>
            {/* QR / Barcode — pushed to bottom */}
            <div style={{ marginTop: 'auto' }}>
              {customization.codeStyle === 'qrcode'
                ? <QRCodeSVG value={employee.employee_no} size={48} />
                : <BarcodeSVG value={employee.employee_no} width={110} />
              }
            </div>
          </div>
        </>
      ) : (
        /* ── HORIZONTAL LAYOUT ── */
        <>
          {/* Photo */}
          <div style={{
            position: 'absolute',
            top: headerH - photoSize / 2,
            left: 20,
            width: photoSize,
            height: photoSize,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `3px solid ${primaryColor}`,
            boxShadow: `0 0 0 3px #fff, 0 4px 12px rgba(0,0,0,0.16)`,
            backgroundColor: '#e8eaf6',
            zIndex: 15,
          }}>
            {employee.photo_url
              ? <img src={employee.photo_url} alt="Portrait" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: primaryColor, backgroundColor: '#e8eaf6' }}>{employee.first_name[0]}{employee.last_name[0]}</div>
            }
          </div>

          {/* Name / role / ID */}
          <div style={{
            position: 'absolute',
            top: headerH + 8,
            left: 106,
            right: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            zIndex: 10,
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: nameColor, lineHeight: 1.2 }}>
              {employee.first_name.toUpperCase()} {employee.last_name.toUpperCase()}
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: roleColor, fontStyle: 'italic' }}>{designation}</div>
            <div style={{ width: 60, height: 2, backgroundColor: accentColor, borderRadius: 1 }} />
            <div style={{ fontSize: 9.5, fontWeight: 700, color: metaColor }}>ID No. {employee.employee_no}</div>
            <div style={{ fontSize: 8.5, color: metaColor, opacity: 0.78 }}>{customization.companyWebsite}</div>
          </div>

          {/* QR / Barcode */}
          <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 10 }}>
            {customization.codeStyle === 'qrcode'
              ? <QRCodeSVG value={employee.employee_no} size={42} />
              : <BarcodeSVG value={employee.employee_no} width={90} />
            }
          </div>
        </>
      )}
    </div>
  )
}

// ─── ID Card Back ──────────────────────────────────────────────────────────────

function IDCardBack({ employee, customization, orientation }: {
  employee: EmployeeWithDetails
  customization: Customization
  orientation: 'vertical' | 'horizontal'
}) {
  // Schema-accurate destructuring
  // employees table: sss_no, phic_no (PhilHealth), hdmf_no (Pag-IBIG), tin_no
  // emergency_contacts table: contact_person, contact_address, contact_number
  // employment_details table: designation, date_hired, department, company
  const emg = employee.emergency_contacts?.[0] || {} as any
  const emp = employee.employment_details?.[0] || {} as any
  const w = orientation === 'vertical' ? 260 : 410
  const h = orientation === 'vertical' ? 410 : 260
  const { primaryColor, accentColor } = customization
  const topH = orientation === 'vertical' ? 100 : 90

  const hireDate = emp.date_hired ? new Date(emp.date_hired) : new Date()
  const expDate = new Date(hireDate.getFullYear() + (customization.expirationYears || 3), hireDate.getMonth(), hireDate.getDate())

  // Government IDs — stored directly on employees row
  const sss       = employee.sss_no   || '—'
  const tin       = employee.tin_no   || '—'
  const pagIbig   = employee.hdmf_no  || '—'   // hdmf_no = Pag-IBIG / Home Development Mutual Fund
  const philHealth = employee.phic_no || '—'   // phic_no = Philippine Health Insurance Corporation

  // Emergency contact — emergency_contacts columns
  const emgName  = emg.contact_person  || '—'
  const emgPhone = emg.contact_number  || '—'
  const emgAddr  = emg.contact_address || ''

  const fieldLabelStyle: React.CSSProperties = {
    fontSize: 6.5,
    fontWeight: 700,
    color: '#999',
    letterSpacing: '0.09em',
    textTransform: 'uppercase' as const,
    lineHeight: 1,
    marginBottom: 1,
  }
  const fieldValueStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 600,
    color: '#222',
    lineHeight: 1.2,
  }

  const IconCircle = ({ iconPath }: { iconPath: string }) => (
    <div style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      backgroundColor: primaryColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <InlineIcon path={iconPath} color="#fff" size={11} />
    </div>
  )

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 14,
        background: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      {/* ── Blue header background ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: topH, backgroundColor: primaryColor }} />

      {/* Simplified header: solid primary color, no decorative curves */}



      {/* ── Logo / company in header (centered, matching front) ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: topH,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '0 20px',
        zIndex: 5,
      }}>
        {customization.showLogo && customization.logoUrl ? (
          <img src={customization.logoUrl} alt="Logo" style={{ maxHeight: orientation === 'vertical' ? 56 : 40, maxWidth: '65%', objectFit: 'contain' }} />
        ) : (
          <>
            <div style={{ fontSize: orientation === 'vertical' ? 24 : 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {customization.companyShort}
            </div>
            <div style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em', textAlign: 'center', textTransform: 'uppercase' }}>
              {customization.companyName}
            </div>
          </>
        )}
      </div>

      {/* ── VERTICAL BACK CONTENT ── */}
      {orientation === 'vertical' ? (
        <div style={{
          position: 'absolute',
          top: topH + 12, // moved up to give more space for signatures
          left: 16,
          right: 16,
          bottom: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}>
          {/* Property notice */}
          <p style={{ fontSize: 7.5, color: '#555', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            This ID is the property of{' '}
            <strong style={{ color: primaryColor }}>{customization.companyName}.</strong>{' '}
            It is non-transferable and must be surrendered upon request or termination of employment.
          </p>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: primaryColor, opacity: 0.15 }} />

          {/* Government IDs — 2-column grid */}
          <div>
            <div style={{ ...fieldLabelStyle, color: primaryColor, fontSize: 7, marginBottom: 4, letterSpacing: '0.1em' }}>
              GOVERNMENT IDs
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
              {[
                { label: 'SSS No.', value: sss },
                { label: 'TIN No.', value: tin },
                { label: 'Pag-IBIG No.', value: pagIbig },
                { label: 'PhilHealth No.', value: philHealth },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={fieldLabelStyle}>{label}</div>
                  <div style={fieldValueStyle}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: primaryColor, opacity: 0.15 }} />

          {/* Emergency Contact */}
          <div>
            <div style={{ ...fieldLabelStyle, color: primaryColor, fontSize: 7, marginBottom: 3, letterSpacing: '0.1em' }}>
              IN CASE OF EMERGENCY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div>
                <div style={fieldLabelStyle}>Contact Person</div>
                <div style={fieldValueStyle}>{emgName}</div>
                {emgAddr ? <div style={{ fontSize: 7.5, color: '#888', marginTop: 1 }}>{emgAddr}</div> : null}
              </div>
              <div>
                <div style={fieldLabelStyle}>Contact No.</div>
                <div style={fieldValueStyle}>{emgPhone}</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: primaryColor, opacity: 0.15 }} />

          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCircle iconPath={ICONS.phone} />
              <div style={{ fontSize: 8.5, color: '#333', fontWeight: 500 }}>{customization.companyPhone}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCircle iconPath={ICONS.mail} />
              <div style={{ fontSize: 8.5, color: '#333', fontWeight: 500 }}>{customization.companyEmail}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCircle iconPath={ICONS.globe} />
              <div style={{ fontSize: 8.5, color: '#333', fontWeight: 500 }}>{customization.companyWebsite}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: primaryColor, opacity: 0.15 }} />

          {/* Signatures — Name and Signature format */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 'auto' }}>
            {/* Cardholder signature */}
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
              <div style={{
                height: 26,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginBottom: 2,
              }}>
                {employee.signature_url
                  ? <img src={employee.signature_url} alt="Sig" crossOrigin="anonymous" style={{ maxHeight: 22, objectFit: 'contain' }} />
                  : <div style={{ fontSize: 6, color: '#ccc', fontStyle: 'italic' }}>signature</div>
                }
              </div>
              <div style={{ borderTop: `1.5px solid ${primaryColor}`, paddingTop: 3 }}>
                <div style={{ fontSize: 8, color: '#333', fontWeight: 700 }}>
                  {employee.first_name} {employee.last_name}
                </div>
                <div style={{ fontSize: 6.5, color: '#999', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Cardholder&apos;s Signature
                </div>
              </div>
            </div>

            {/* President / Officer signature */}
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
              <div style={{
                height: 26,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                marginBottom: 2,
              }}>
                {customization.officerSignatureUrl
                  ? <img src={customization.officerSignatureUrl} alt="Officer Sig" crossOrigin="anonymous" style={{ maxHeight: 22, objectFit: 'contain' }} />
                  : <div style={{ fontSize: 6, color: '#ccc', fontStyle: 'italic' }}>signature</div>
                }
              </div>
              <div style={{ borderTop: `1.5px solid ${primaryColor}`, paddingTop: 3 }}>
                <div style={{ fontSize: 8, color: '#333', fontWeight: 700 }}>
                  {customization.officerName}
                </div>
                <div style={{ fontSize: 6.5, color: '#999', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {customization.officerTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Expiry */}
          <div style={{ fontSize: 7, color: '#bbb', textAlign: 'center', letterSpacing: '0.08em', paddingTop: 2 }}>
            VALID UNTIL {expDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      ) : (
        /* ── HORIZONTAL BACK CONTENT ── */
        <div style={{
          position: 'absolute',
          top: topH + 14,
          left: 14,
          right: 14,
          bottom: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}>
          <p style={{ fontSize: 7.5, color: '#555', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
            This ID is the property of <strong style={{ color: primaryColor }}>{customization.companyName}.</strong>{' '}
            Non-transferable. Must be surrendered upon request or termination.
          </p>

          <div style={{ height: 1, backgroundColor: primaryColor, opacity: 0.15 }} />

          {/* Gov IDs — 4 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px 8px' }}>
            {[
              { label: 'SSS No.', value: sss },
              { label: 'TIN No.', value: tin },
              { label: 'Pag-IBIG', value: pagIbig },
              { label: 'PhilHealth', value: philHealth },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={fieldLabelStyle}>{label}</div>
                <div style={{ ...fieldValueStyle, fontSize: 8 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, backgroundColor: primaryColor, opacity: 0.15 }} />

          {/* Emergency + contact in one row */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...fieldLabelStyle, color: primaryColor, fontSize: 6.5, marginBottom: 2 }}>IN CASE OF EMERGENCY</div>
              <div style={{ fontSize: 8.5, fontWeight: 600, color: '#222' }}>{emgName}</div>
              {emgAddr ? <div style={{ fontSize: 7, color: '#888' }}>{emgAddr}</div> : null}
              <div style={{ fontSize: 8, color: '#333', marginTop: 1 }}>{emgPhone}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...fieldLabelStyle, color: primaryColor, fontSize: 6.5, marginBottom: 2 }}>CONTACT US</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconCircle iconPath={ICONS.phone} />
                  <span style={{ fontSize: 7.5, color: '#333' }}>{customization.companyPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconCircle iconPath={ICONS.mail} />
                  <span style={{ fontSize: 7.5, color: '#333' }}>{customization.companyEmail}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: primaryColor, opacity: 0.15 }} />

          {/* Signatures — Name and Signature format */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 'auto' }}>
            {/* Cardholder */}
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ height: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 2 }}>
                {employee.signature_url
                  ? <img src={employee.signature_url} crossOrigin="anonymous" style={{ maxHeight: 18, objectFit: 'contain' }} />
                  : <div style={{ fontSize: 5.5, color: '#ccc', fontStyle: 'italic' }}>signature</div>
                }
              </div>
              <div style={{ borderTop: `1.5px solid ${primaryColor}`, paddingTop: 2 }}>
                <div style={{ fontSize: 7, color: '#333', fontWeight: 700 }}>{employee.first_name} {employee.last_name}</div>
                <div style={{ fontSize: 5.5, color: '#999', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cardholder&apos;s Signature</div>
              </div>
            </div>
            {/* Officer / President */}
            <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ height: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 2 }}>
                {customization.officerSignatureUrl
                  ? <img src={customization.officerSignatureUrl} crossOrigin="anonymous" style={{ maxHeight: 18, objectFit: 'contain' }} />
                  : <div style={{ fontSize: 5.5, color: '#ccc', fontStyle: 'italic' }}>signature</div>
                }
              </div>
              <div style={{ borderTop: `1.5px solid ${primaryColor}`, paddingTop: 2 }}>
                <div style={{ fontSize: 7, color: '#333', fontWeight: 700 }}>{customization.officerName}</div>
                <div style={{ fontSize: 5.5, color: '#999', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{customization.officerTitle}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 6, color: '#bbb', textAlign: 'center', letterSpacing: '0.08em' }}>
            VALID UNTIL {expDate.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} &bull; {customization.companyWebsite}
          </div>
        </div>
      )}
    </div>
  )
}