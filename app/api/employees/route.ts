import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('employees')
    .select('*, emergency_contacts(*), employment_details(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ── 1. Insert core employee record ──────────────────────────────────────
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        employee_no: body.employee_no,
        first_name: body.first_name,
        last_name: body.last_name,
        middle_name: body.middle_name || null,
        date_of_birth: body.date_of_birth || null,
        contact_no: body.contact_no || null,
        sss_no: body.sss_no || null,
        phic_no: body.phic_no || null,
        hdmf_no: body.hdmf_no || null,
        tin_no: body.tin_no || null,
        photo_url: body.photo_url || null,
        signature_url: body.signature_url || null,
      })
      .select()
      .single()

    if (employeeError) {
      return NextResponse.json({ error: employeeError.message }, { status: 500 })
    }

    const employeeId = employee.id
    const errors: string[] = []

    // ── 2. Insert employment_details ─────────────────────────────────────────
    // The frontend sends a single object; never include `id` on INSERT.
    if (body.employment_details) {
      // Accept both object and array from any future callers
      const raw = body.employment_details
      const detail = Array.isArray(raw) ? raw[0] : raw

      const { error: empError } = await supabase
        .from('employment_details')
        .insert({
          employee_id: employeeId,
          company: detail.company || null,
          department: detail.department || null,
          designation: detail.designation || null,
          date_hired: detail.date_hired || null,
          employment_status: detail.employment_status || 'Active',
          // NOTE: never pass `id` here — let Supabase generate it
        })

      if (empError) errors.push(`employment_details: ${empError.message}`)
    }

    // ── 3. Insert emergency_contacts ─────────────────────────────────────────
    if (body.emergency_contacts) {
      const raw = body.emergency_contacts
      const contact = Array.isArray(raw) ? raw[0] : raw

      // Only insert if there's at least a contact person name
      if (contact.contact_person) {
        const { error: emgError } = await supabase
          .from('emergency_contacts')
          .insert({
            employee_id: employeeId,
            contact_person: contact.contact_person,
            contact_address: contact.contact_address || null,
            contact_number: contact.contact_number || null,
          })

        if (emgError) errors.push(`emergency_contacts: ${emgError.message}`)
      }
    }

    // ── 4. Return the fully-joined record ────────────────────────────────────
    const { data: fullEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('*, emergency_contacts(*), employment_details(*)')
      .eq('id', employeeId)
      .single()

    if (fetchError) {
      // Still a partial success — return the base employee
      return NextResponse.json(
        { ...employee, _warnings: errors },
        { status: 201 }
      )
    }

    // Surface any child-table errors as warnings without blocking the response
    return NextResponse.json(
      errors.length ? { ...fullEmployee, _warnings: errors } : fullEmployee,
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid request body' },
      { status: 400 }
    )
  }
}