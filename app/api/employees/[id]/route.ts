import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params
    const body = await request.json()
    const errors: string[] = []

    // ── 1. Update core employee record ───────────────────────────────────────
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .update({
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
      .eq('id', employeeId)
      .select()
      .single()

    if (employeeError) {
      return NextResponse.json({ error: employeeError.message }, { status: 500 })
    }

    // ── 2. Upsert employment_details ─────────────────────────────────────────
    // The frontend sends a single object with an optional `id` field.
    if (body.employment_details) {
      const raw = body.employment_details
      const detail = Array.isArray(raw) ? raw[0] : raw

      const detailPayload = {
        employee_id: employeeId,
        company: detail.company || null,
        department: detail.department || null,
        designation: detail.designation || null,
        date_hired: detail.date_hired || null,
        employment_status: detail.employment_status || 'Active',
      }

      if (detail.id) {
        // Row exists — UPDATE by its primary key
        const { error } = await supabase
          .from('employment_details')
          .update(detailPayload)
          .eq('id', detail.id)

        if (error) errors.push(`employment_details: ${error.message}`)
      } else {
        // No id — try UPDATE by employee_id first; INSERT if nothing matched
        const { data: existing } = await supabase
          .from('employment_details')
          .select('id')
          .eq('employee_id', employeeId)
          .maybeSingle()           // returns null instead of error when no row found

        if (existing?.id) {
          const { error } = await supabase
            .from('employment_details')
            .update(detailPayload)
            .eq('id', existing.id)

          if (error) errors.push(`employment_details: ${error.message}`)
        } else {
          const { error } = await supabase
            .from('employment_details')
            .insert(detailPayload)

          if (error) errors.push(`employment_details: ${error.message}`)
        }
      }
    }

    // ── 3. Upsert emergency_contacts ─────────────────────────────────────────
    if (body.emergency_contacts) {
      const raw = body.emergency_contacts
      const contact = Array.isArray(raw) ? raw[0] : raw

      const contactPayload = {
        employee_id: employeeId,
        contact_person: contact.contact_person || null,
        contact_address: contact.contact_address || null,
        contact_number: contact.contact_number || null,
      }

      if (contact.id) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update(contactPayload)
          .eq('id', contact.id)

        if (error) errors.push(`emergency_contacts: ${error.message}`)
      } else {
        const { data: existing } = await supabase
          .from('emergency_contacts')
          .select('id')
          .eq('employee_id', employeeId)
          .maybeSingle()

        if (existing?.id) {
          const { error } = await supabase
            .from('emergency_contacts')
            .update(contactPayload)
            .eq('id', existing.id)

          if (error) errors.push(`emergency_contacts: ${error.message}`)
        } else if (contact.contact_person) {
          // Only insert if there's at least a name — avoid empty orphan rows
          const { error } = await supabase
            .from('emergency_contacts')
            .insert(contactPayload)

          if (error) errors.push(`emergency_contacts: ${error.message}`)
        }
      }
    }

    // ── 4. Return the fully-joined record ────────────────────────────────────
    const { data: fullEmployee, error: fetchError } = await supabase
      .from('employees')
      .select('*, emergency_contacts(*), employment_details(*)')
      .eq('id', employeeId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { ...employee, _warnings: errors },
        { status: 200 }
      )
    }

    return NextResponse.json(
      errors.length ? { ...fullEmployee, _warnings: errors } : fullEmployee,
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid request body' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params

    // Delete child records first to respect foreign key constraints.
    // Run in parallel — order doesn't matter between the two child tables.
    const [empDetailsResult, emgContactsResult] = await Promise.all([
      supabase.from('employment_details').delete().eq('employee_id', employeeId),
      supabase.from('emergency_contacts').delete().eq('employee_id', employeeId),
    ])

    if (empDetailsResult.error) {
      console.error('Error deleting employment_details:', empDetailsResult.error.message)
    }
    if (emgContactsResult.error) {
      console.error('Error deleting emergency_contacts:', emgContactsResult.error.message)
    }

    // Now delete the parent row
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}