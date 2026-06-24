export type Employee = {
    id: string
    employee_no: string
    last_name: string
    first_name: string
    middle_name: string | null
    date_of_birth: string | null
    contact_no: string | null
    sss_no: string | null
    phic_no: string | null
    hdmf_no: string | null
    tin_no: string | null
    photo_url: string | null
    signature_url: string | null
    created_at: string
  }
  
  export type EmergencyContact = {
    id: string
    employee_id: string
    contact_person: string
    contact_address: string | null
    contact_number: string | null
    created_at: string
  }
  
  export type EmploymentDetails = {
    id: string
    employee_id: string
    company: string | null
    department: string | null
    designation: string | null
    date_hired: string | null
    employment_status: string
    created_at: string
  }
  
  // Combined type when fetching employee with all relations
  export type EmployeeWithDetails = Employee & {
    emergency_contacts: EmergencyContact[]
    employment_details: EmploymentDetails[]
  }