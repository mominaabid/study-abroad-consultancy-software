import { getSupabaseClient } from './supabaseClient';

export const HUMAN_FIELD_NAMES = {
  // Programs & Degrees
  program_name: 'Program Name',
  degree_level: 'Degree Level',
  degree_duration: 'Duration (e.g. 18 months)',
  degree_intakes: 'Intakes (e.g. Sept, Feb)',
  institute_name: 'University Name',
  institute_type: 'Institute Type',
  country_name: 'Country Name',
  program_active: 'Program Active?',
  institute_active: 'Institute Active?',
  
  // Fees & Financials
  tuition_fee: 'Tuition Fee',
  initial_deposit: 'Initial Deposit',
  application_fee: 'Application Fee',
  fee_currency: 'Currency (EUR / GBP / USD)',
  pathway_foundation: 'Pathway Foundation',
  scholarship_available: 'Scholarship Available?',
  scholarship_title: 'Scholarship Title',
  scholarship_name: 'Scholarship Name',
  scholarship_min: 'Min. Scholarship Value / %',
  scholarship_max: 'Max. Scholarship Value / %',
  scholarship_type: 'Scholarship Type',
  coverage_percentage: 'Scholarship Coverage (%)',
  
  // Requirements & Test Scores
  doc_category: 'Document Category',
  doc_name: 'Document Name',
  is_mandatory: 'Mandatory Document?',
  ielts_score: 'IELTS Min. Score',
  toefl_score: 'TOEFL Min. Score',
  pte_score: 'PTE Min. Score',
  duolingo_score: 'Duolingo Min. Score',
  other: 'Other Test (MOI / Cambridge / Other)',
  note: 'Additional Notes / Criteria',
  study_requirements: 'Country Info',
  
  // Rankings & Visa
  university_ranking_int: 'Global Ranking (#)',
  university_ranking_local: 'National Ranking (#)',
  admission_processing_days: 'Processing Days',
  special_instructions: 'Special Instructions',
  admission_intakes: 'Admission Intakes',
  spouse_dependants: 'Spouse / Dependant Allowed?',
  psw_duration: 'Post-Study Work Visa Duration',
  visa_approval_ratio: 'Visa Approval Rate (%)',
  website: 'Website / Portal',
  institute_location: 'Location / Address',
  campus_location: 'Campus Location / Address',
  is_active: 'Active Status?',
  
  // Foreign Key Links
  institute_id: 'University / Institute',
  campus_id: 'Campus / Location',
  program_id: 'Degree Program / Course',
  country_id: 'Country',
  state_id: 'State / Province',
  city_id: 'City',
  doc_id: 'Required Document',
  pathway_id: 'Admission Pathway',
  pathway_type: 'Pathway Type',
  marks_required_min: 'Min. Required Marks / GPA (%)',
  marks_required_max: 'Max. Required Marks / GPA (%)',
  english_language_requirement: 'English Language Requirement',
  notes: 'Pathway Notes / Details',

  // Business Info & Office
  organization_name: 'Organization Name',
  address: 'Office Address',
  city: 'City',
  state: 'State / Province',
  country: 'Country',
  phone_number: 'Phone Number',
  whatsapp_number: 'WhatsApp Number',
  email: 'Email Address',
  office_timing: 'Office Hours',
  
  // Leads & Sessions
  student_name: 'Student Name',
  interested_country: 'Target Country',
  interested_institute: 'Target University',
  interested_program: 'Target Program',
  lead_source: 'Lead Source',
  last_message_snippet: 'Latest Student Query',
  status: 'Status',
  role: 'Role',
  content: 'Message Text',
  session_id: 'Session ID',
  user_ip: 'IP Address',
  user_agent: 'Device Info',

  // Users Table
  full_name: 'Full Name',
  username: 'Username',
  password: 'Password',
  created_at: 'Created Date'
};

export function getHumanFieldName(col) {
  if (!col) return '';
  if (HUMAN_FIELD_NAMES[col]) return HUMAN_FIELD_NAMES[col];
  return col.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function formatUserFriendlyError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const rawMsg = typeof error === 'string' ? error : (error.message || String(error));
  const lower = rawMsg.toLowerCase();

  // 1. Null constraint / Missing required field
  if (lower.includes('null value in column') || lower.includes('violates not-null constraint') || lower.includes('not-null')) {
    const match = rawMsg.match(/column "([^"]+)"/i) || rawMsg.match(/column '([^']+)'/i);
    const rawCol = match ? match[1] : '';
    const humanField = rawCol ? getHumanFieldName(rawCol) : 'a required field';
    return `Please fill in required field: ${humanField}`;
  }

  // 2. Foreign key constraint
  if (lower.includes('violates foreign key constraint') || lower.includes('foreign key constraint') || lower.includes('fkey')) {
    const match = rawMsg.match(/column "([^"]+)"/i) || rawMsg.match(/Key \(([^)]+)\)=/i);
    const rawCol = match ? match[1] : '';
    const humanField = rawCol ? getHumanFieldName(rawCol) : 'Linked Record (such as University or Program)';
    return `Please select a valid ${humanField}`;
  }

  // 3. Unique constraint / Duplicate entry
  if (lower.includes('duplicate key') || lower.includes('violates unique constraint')) {
    const match = rawMsg.match(/Key \(([^)]+)\)=/i) || rawMsg.match(/constraint "([^"]+)"/i);
    const rawCol = match ? match[1] : '';
    const humanField = rawCol ? getHumanFieldName(rawCol) : 'entry';
    return `A record with this ${humanField} already exists. Please use a unique value.`;
  }

  // 4. Enum constraint error
  if (lower.includes('invalid input value for enum') || lower.includes('doc_category_enum')) {
    return 'Invalid selection: Please choose a valid category from the dropdown options.';
  }

  // 5. RLS / Access Permission
  if (lower.includes('row-level security') || lower.includes('permission denied')) {
    return 'Access restricted: You do not have permission to alter this database record.';
  }

  // 6. Network / Connection Error
  if (lower.includes('fetch') || lower.includes('network error') || lower.includes('failed to fetch')) {
    return 'Connection issue. Please check your internet connection and try again.';
  }

  return rawMsg;
}

// List of all Supabase tables and views with metadata
export const SUPABASE_TABLES = [
  {
    category: 'Locations',
    tables: [
      { id: 'countries', label: 'Countries', primaryKey: 'country_id', canModify: true, description: 'Study destinations, visa ratio & PSW' },
      { id: 'states', label: 'States', primaryKey: 'state_id', canModify: true, description: 'States and regions' },
      { id: 'cities', label: 'Cities', primaryKey: 'city_id', canModify: true, description: 'Cities master list' },
      { id: 'v_chatbot_bot_details', label: 'Bot Config', primaryKey: 'id', canModify: false, description: 'Read-only chatbot configuration view' },
    ]
  },
  {
    category: 'Academics',
    tables: [
      { id: 'institutes', label: 'Universities', primaryKey: 'institute_id', canModify: true, description: 'Partner universities and rankings' },
      { id: 'campuses', label: 'Campuses', primaryKey: 'campus_id', canModify: true, description: 'University campuses and locations' },
      { id: 'programs', label: 'Programs', primaryKey: 'program_id', canModify: true, description: 'Degree programs offered' },
      { id: 'program_fees', label: 'Fees', primaryKey: 'fee_id', canModify: true, description: 'Tuition fees, initial deposit & currencies' },
      { id: 'scholarships', label: 'Scholarships', primaryKey: 'scholarship_id', canModify: true, description: 'Available scholarships & coverage' },
    ]
  },
  {
    category: 'Admissions',
    tables: [
      { id: 'admission_pathways', label: 'Pathways', primaryKey: 'pathway_id', canModify: true, description: 'Pathway programs & criteria' },
      { id: 'required_docs', label: 'Master Docs', primaryKey: 'doc_id', canModify: true, description: 'Master catalog of admission documents' },
      { id: 'english_requirements', label: 'English Requirements', primaryKey: 'requirement_id', canModify: true, description: 'IELTS, PTE & TOEFL score criteria' },
      { id: 'program_required_documents', label: 'Program Docs', primaryKey: 'id', canModify: true, description: 'Mapped required docs per program' },
    ]
  },
  {
    category: 'Chatbot Leads & Logs',
    tables: [
      { id: 'student_leads', label: 'Chatbot Leads', primaryKey: 'lead_id', canModify: true, canAdd: false, description: 'Inquiries captured from chatbot students' },
      { id: 'chat_sessions', label: 'Sessions', primaryKey: 'id', canModify: true, canAdd: false, description: 'Recorded student chat sessions' },
      { id: 'chat_messages', label: 'Messages', primaryKey: 'id', canModify: true, canAdd: false, description: 'Individual message logs per chat session' },
    ]
  },
  {
    category: 'Office Info',
    tables: [
      { id: 'business_info', label: 'Office Contact', primaryKey: 'id', canModify: true, description: 'Educatia office contact, timing & address' },
    ]
  }
];

// Helper to get flat table definition
export function getTableConfig(tableName) {
  if (tableName === 'dashboard') {
    return { id: 'dashboard', label: 'Dashboard', primaryKey: 'id', canModify: false, description: 'Analytics, lead metrics, and system overview' };
  }
  for (const cat of SUPABASE_TABLES) {
    const found = cat.tables.find(t => t.id === tableName);
    if (found) return found;
  }
  return { id: tableName, label: tableName, primaryKey: 'id', canModify: true };
}

/**
 * Authenticate Admin User strictly against Supabase users table
 */
export async function authenticateAdminUser(username, password) {
  const client = getSupabaseClient();
  const u = (username || '').trim();
  const p = (password || '').trim();

  if (!u || !p) {
    return { success: false, error: 'Please enter both username and password.' };
  }

  if (client) {
    try {
      const { data, error } = await client
        .from('users')
        .select('id, full_name, username, role, email, is_active')
        .eq('username', u)
        .eq('password', p)
        .limit(1);

      if (!error && data && data.length > 0) {
        const user = data[0];
        if (user.is_active === false || user.status === 'inactive') {
          return { success: false, error: 'This user account has been deactivated.' };
        }
        return { success: true, user };
      }
    } catch (e) {
      console.warn('users table query notice:', e);
    }
  }

  return { success: false, error: 'Invalid username or password.' };
}

/**
 * Fetch rows from a specified Supabase table with search and pagination
 */
export async function fetchTableRows(tableName, { page = 1, limit = 10, searchQuery = '' } = {}) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not configured.');

  const fromIndex = (page - 1) * limit;
  const toIndex = fromIndex + limit - 1;

  let query = client
    .from(tableName)
    .select('*', { count: 'exact' });

  // Default sorting for sessions, messages, leads & users
  if (tableName === 'chat_sessions' || tableName === 'chat_messages' || tableName === 'student_leads' || tableName === 'users') {
    const sortCol = tableName === 'chat_sessions' ? 'updated_at' : 'created_at';
    query = query.order(sortCol, { ascending: false });
  }

  // Add search if query string is provided
  if (searchQuery.trim()) {
    const term = `%${searchQuery.trim()}%`;
    if (tableName === 'chat_sessions') {
      query = query.or(`id.ilike.${term},last_message_snippet.ilike.${term}`);
    } else if (tableName === 'chat_messages') {
      query = query.or(`content.ilike.${term},session_id.ilike.${term},role.ilike.${term}`);
    } else if (tableName === 'student_leads') {
      query = query.or(`student_name.ilike.${term},phone_number.ilike.${term},interested_country.ilike.${term},last_message_snippet.ilike.${term}`);
    } else if (tableName === 'users') {
      query = query.or(`full_name.ilike.${term},username.ilike.${term},role.ilike.${term},email.ilike.${term}`);
    } else if (tableName === 'institutes') {
      query = query.or(`institute_name.ilike.${term},institute_location.ilike.${term},website.ilike.${term}`);
    } else if (tableName === 'programs') {
      query = query.or(`program_name.ilike.${term},degree_level.ilike.${term},degree_duration.ilike.${term}`);
    } else if (tableName === 'program_fees') {
      query = query.or(`fee_currency.ilike.${term}`);
    } else if (tableName === 'scholarships') {
      query = query.or(`scholarship_title.ilike.${term},description.ilike.${term}`);
    } else if (tableName === 'required_docs') {
      query = query.or(`doc_name.ilike.${term},description.ilike.${term}`);
    } else if (tableName === 'countries') {
      query = query.or(`country_name.ilike.${term},currency.ilike.${term}`);
    } else if (tableName === 'states') {
      query = query.or(`state_name.ilike.${term}`);
    } else if (tableName === 'cities') {
      query = query.or(`city_name.ilike.${term}`);
    } else if (tableName === 'business_info') {
      query = query.or(`organization_name.ilike.${term},address.ilike.${term},phone_number.ilike.${term},email.ilike.${term}`);
    }
  }

  // Execute paginated query with fallback if server column mismatch occurs
  let { data, count, error } = await query.range(fromIndex, toIndex);

  if (error && searchQuery.trim()) {
    console.warn(`Server search filter fallback for '${tableName}':`, error.message);
    // Retry without server filter; client-side grid will filter rows safely across all fields
    let fallbackQuery = client.from(tableName).select('*', { count: 'exact' });
    if (tableName === 'chat_sessions' || tableName === 'chat_messages' || tableName === 'student_leads' || tableName === 'users') {
      const sortCol = tableName === 'chat_sessions' ? 'updated_at' : 'created_at';
      fallbackQuery = fallbackQuery.order(sortCol, { ascending: false });
    }
    const fallbackRes = await fallbackQuery.range(fromIndex, toIndex);
    data = fallbackRes.data;
    count = fallbackRes.count;
    error = fallbackRes.error;
  }

  if (error) {
    console.error(`Error fetching table '${tableName}':`, error);
    throw new Error(error.message);
  }

  return {
    data: data || [],
    totalCount: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1
  };
}

/**
 * Fetch full chat transcript messages for a given session ID
 */
export async function fetchSessionMessages(sessionId) {
  const client = getSupabaseClient();
  if (!client || !sessionId) return [];

  const sidStr = String(sessionId).trim();

  // Try exact match first
  const { data, error } = await client
    .from('chat_messages')
    .select('*')
    .eq('session_id', sidStr)
    .order('created_at', { ascending: true });

  if (data && data.length > 0) {
    return data;
  }

  // Fallback: try case-insensitive or broad session ID matching
  try {
    const { data: fallbackData } = await client
      .from('chat_messages')
      .select('*')
      .or(`session_id.eq.${sidStr},session_id.ilike.%${sidStr}%`)
      .order('created_at', { ascending: true });

    if (fallbackData && fallbackData.length > 0) {
      return fallbackData;
    }
  } catch (_e) {
    // Ignore fallback failure
  }

  if (error) {
    console.error(`Error fetching messages for session '${sessionId}':`, error);
  }

  return [];
}

/**
 * Delete a row from a table by primary key
 */
export async function deleteTableRow(tableName, primaryKeyField, primaryKeyValue) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not configured.');

  const { error } = await client
    .from(tableName)
    .delete()
    .eq(primaryKeyField, primaryKeyValue);

  if (error) {
    console.error(`Error deleting row from '${tableName}':`, error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Insert a new row in a table
 */
export async function insertTableRow(tableName, recordData) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not configured.');

  let currentPayload = { ...recordData };
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    const { data, error } = await client
      .from(tableName)
      .insert(currentPayload)
      .select();

    if (!error) return data;

    const rawMsg = error.message || String(error);
    const lower = rawMsg.toLowerCase();

    // If Postgres complains about an unknown/missing column in table schema
    if (lower.includes('column') && (lower.includes('does not exist') || lower.includes('could not find') || lower.includes('schema') || lower.includes('pgrst204'))) {
      const match = rawMsg.match(/column "?([a-zA-Z0-9_]+)"?/i) || rawMsg.match(/'([a-zA-Z0-9_]+)'/i);
      const invalidCol = match ? match[1] : null;

      if (invalidCol && Object.prototype.hasOwnProperty.call(currentPayload, invalidCol)) {
        console.warn(`Stripping column '${invalidCol}' not present in Supabase '${tableName}' schema and retrying insert.`);
        delete currentPayload[invalidCol];
        continue;
      }
    }

    console.error(`Error inserting row into '${tableName}':`, error);
    throw new Error(error.message);
  }

  throw new Error(`Failed to insert row into '${tableName}'.`);
}

/**
 * Update an existing row in a table by primary key
 */
export async function updateTableRow(tableName, primaryKeyField, primaryKeyValue, recordData) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not configured.');

  if (!primaryKeyField || primaryKeyValue === undefined || primaryKeyValue === null) {
    throw new Error(`Cannot update record in '${tableName}': missing primary key ${primaryKeyField}`);
  }

  let currentPayload = { ...recordData };
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    const { data, error } = await client
      .from(tableName)
      .update(currentPayload)
      .eq(primaryKeyField, primaryKeyValue)
      .select();

    if (!error) return data;

    const rawMsg = error.message || String(error);
    const lower = rawMsg.toLowerCase();

    if (lower.includes('column') && (lower.includes('does not exist') || lower.includes('could not find') || lower.includes('schema') || lower.includes('pgrst204'))) {
      const match = rawMsg.match(/column "?([a-zA-Z0-9_]+)"?/i) || rawMsg.match(/'([a-zA-Z0-9_]+)'/i);
      const invalidCol = match ? match[1] : null;

      if (invalidCol && Object.prototype.hasOwnProperty.call(currentPayload, invalidCol)) {
        console.warn(`Stripping column '${invalidCol}' not present in Supabase '${tableName}' schema and retrying update.`);
        delete currentPayload[invalidCol];
        continue;
      }
    }

    console.error(`Error updating row in '${tableName}' where ${primaryKeyField}=${primaryKeyValue}:`, error);
    throw new Error(error.message);
  }

  throw new Error(`Failed to update row in '${tableName}'.`);
}

/**
 * Upsert a row in a table
 */
export async function upsertTableRow(tableName, recordData) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client is not configured.');

  const { data, error } = await client
    .from(tableName)
    .upsert(recordData)
    .select();

  if (error) {
    console.error(`Error upserting row in '${tableName}':`, error);
    throw new Error(error.message);
  }

  return data;
}
