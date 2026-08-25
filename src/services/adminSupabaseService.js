import { getSupabaseClient } from './supabaseClient';

export const HUMAN_FIELD_NAMES = {
  // Programs & Degrees
  program_name: 'Program',
  degree_level: 'Level',
  degree_duration: 'Duration',
  degree_intakes: 'Intakes',
  institute_name: 'Institute',
  institute_type: 'Type',
  country_name: 'Country',
  state_name: 'State',
  city_name: 'City',
  campus_name: 'Campus',
  campuses: 'Campuses',
  program_active: 'Active',
  institute_active: 'Active',
  
  // Fees & Financials
  tuition_fee: 'Tuition Fee',
  initial_deposit: 'Deposit',
  application_fee: 'App Fee',
  fee_currency: 'Currency',
  currency: 'Currency',
  pathway_foundation: 'Foundation',
  scholarship_available: 'Scholarship',
  scholarship_title: 'Scholarship',
  scholarship_name: 'Scholarship',
  scholarship_min: 'Min Sch.',
  scholarship_max: 'Max Sch.',
  scholarship_type: 'Sch. Type',
  scholarship_description: 'Sch. Details',
  coverage_percentage: 'Coverage (%)',
  
  // Requirements & Test Scores
  doc_category: 'Category',
  doc_name: 'Document',
  applicable_degree_level: 'Degree Level',
  programs_required: 'Programs',
  is_mandatory: 'Mandatory',
  ielts_score: 'IELTS',
  toefl_score: 'TOEFL',
  pte_score: 'PTE',
  duolingo_score: 'Duolingo',
  other: 'Other Criteria',
  note: 'Notes',
  notes: 'Notes',
  study_requirements: 'Country Info',
  country_info: 'Country Info',
  
  // Rankings & Visa
  university_ranking_int: 'Global Rank',
  university_ranking_local: 'National Rank',
  admission_processing_days: 'Proc. Days',
  special_instructions: 'Instructions',
  admission_intakes: 'Intakes',
  spouse_dependants: 'Spouse Allowed',
  psw_duration: 'PSW Duration',
  visa_approval_ratio: 'Visa Rate (%)',
  website: 'Website',
  institute_location: 'Main Address',
  campus_location: 'Campus Address',
  is_active: 'Active',
  active: 'Active',
  
  // Foreign Key Links
  institute_id: 'Institute',
  campus_id: 'Campus',
  program_id: 'Program',
  country_id: 'Country',
  state_id: 'State',
  city_id: 'City',
  doc_id: 'Document',
  pathway_id: 'Pathway',
  pathway_name: 'Pathway',
  pathway_type: 'Pathway Type',
  marks_required_min: 'Min Marks',
  marks_required_max: 'Max Marks',
  english_language_requirement: 'English Req.',
  english_language_requirements: 'English Req.',

  // Business Info & Office
  organization_name: 'Organization',
  address: 'Office Address',
  city: 'City',
  state: 'State',
  country: 'Country',
  phone_number: 'Phone',
  whatsapp_number: 'WhatsApp',
  email: 'Email',
  office_timing: 'Office Hours',
  
  // Leads & Sessions
  student_name: 'Student Name',
  interested_country: 'Target Country',
  interested_institute: 'Target Institute',
  interested_program: 'Target Program',
  lead_source: 'Lead Source',
  last_message_snippet: 'Latest Student Query',
  status: 'Status',
  role: 'Role',
  content: 'Message Text',
  session_id: 'Session ID',
  user_ip: 'IP Address',
  user_agent: 'Device Info',

  // Users & Leads Table
  full_name: 'Full Name',
  username: 'Username',
  password: 'Password',
  created_at: 'Date & Time',
  timestamp: 'Date & Time'
};

export function getHumanFieldName(col) {
  if (!col) return '';
  if (col === 'is_active' || col === 'active' || col === 'program_active' || col === 'institute_active') {
    return 'Active';
  }
  const name = HUMAN_FIELD_NAMES[col] || col.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return name.replace(/\?/g, '').trim();
}

// Convert table name/label to singular form for buttons and modals (e.g. "Add Country", "Add Institute")
export function getSingularLabel(tableNameOrConfig) {
  if (!tableNameOrConfig) return 'Record';
  const id = typeof tableNameOrConfig === 'object' ? tableNameOrConfig?.id : tableNameOrConfig;
  const label = typeof tableNameOrConfig === 'object' ? tableNameOrConfig?.label : tableNameOrConfig;

  const singularMap = {
    countries: 'Country',
    states: 'State',
    cities: 'City',
    institutes: 'Institute',
    universities: 'Institute',
    campuses: 'Campus',
    programs: 'Program',
    program_fees: 'Program Fee',
    scholarships: 'Scholarship',
    admission_pathways: 'Pathway',
    required_docs: 'Document',
    english_requirements: 'English Requirement',
    program_required_documents: 'Document',
    student_leads: 'Chatbot Lead',
    business_info: 'Office Info',
    users: 'User',
  };

  if (id && singularMap[id]) return singularMap[id];
  if (label) {
    const l = label.toLowerCase();
    if (l === 'countries') return 'Country';
    if (l === 'cities') return 'City';
    if (l === 'institutes' || l === 'universities') return 'Institute';
    if (l === 'campuses') return 'Campus';
    if (l === 'pathways') return 'Pathway';
    if (l === 'fees') return 'Fee';
    if (l === 'scholarships') return 'Scholarship';
    if (l === 'documents' || l === 'master docs' || l === 'program docs') return 'Document';
    if (l === 'english requirements') return 'English Requirement';
    if (l === 'states') return 'State';
    if (l === 'programs') return 'Program';
    if (l === 'users') return 'User';
    if (l === 'chatbot leads') return 'Chatbot Lead';
    if (l === 'office info' || l === 'office contact') return 'Office Info';
    if (l.endsWith('ies')) return label.slice(0, -3) + 'y';
    if (l.endsWith('ses')) return label.slice(0, -2);
    if (l.endsWith('s')) return label.slice(0, -1);
    return label;
  }
  return 'Record';
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
  if (lower.includes('invalid input value for enum') || lower.includes('enum')) {
    const match = rawMsg.match(/invalid input value for enum (?:[a-zA-Z0-9_]+)?:\s*"?([^"'\n]+)"?/i) ||
                  rawMsg.match(/enum [a-zA-Z0-9_]+:\s*"?([^"'\n]+)"?/i);
    const badVal = match ? match[1] : '';
    return `Invalid selection${badVal ? ` "${badVal}"` : ''}: Please choose a valid option from the dropdown options.`;
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

// Predefined table schemas for table headers and modals when 0 rows are returned
export const DEFAULT_TABLE_SCHEMAS = {
  countries: {
    country_name: '',
    visa_approval_ratio: '',
    psw_duration: '',
    spouse_dependants: true,
    currency: '',
    study_requirements: '',
    is_active: true
  },
  states: {
    country_name: '',
    state_name: '',
    is_active: true
  },
  cities: {
    country_name: '',
    state_name: '',
    city_name: '',
    is_active: true
  },
  institutes: {
    institute_name: '',
    country_id: '',
    state_id: '',
    city_id: '',
    institute_location: '',
    campuses: '',
    campus_location: '',
    institute_type: 'private',
    website: '',
    university_ranking_int: '',
    university_ranking_local: '',
    admission_processing_days: '',
    admission_intakes: '',
    english_language_requirement: '',
    special_instructions: '',
    is_active: true
  },
  programs: {
    institute_id: '',
    campus_id: '',
    program_name: '',
    degree_level: 'Bachelors',
    degree_duration: '',
    degree_intakes: '',
    tuition_fee: '',
    application_fee: '',
    initial_deposit: '',
    currency: 'USD',
    scholarship_title: '',
    scholarship_type: 'Merit-Based',
    scholarship_min: '',
    scholarship_max: '',
    scholarship_description: '',
    english_language_requirement: '',
    pathway_foundation: true,
    scholarship_available: true,
    is_active: true
  },
  campuses: {
    campus_name: '',
    institute_id: '',
    city_id: '',
    campus_location: '',
    is_active: true
  },
  program_fees: {
    program_id: '',
    campus_id: '',
    pathway_foundation: true,
    scholarship_available: true,
    application_fee: '',
    tuition_fee: '',
    initial_deposit: '',
    currency: '',
    is_active: true
  },
  scholarships: {
    scholarship_title: '',
    institute_id: '',
    program_id: '',
    scholarship_min: '',
    scholarship_max: '',
    currency: '',
    scholarship_type: '',
    description: '',
    is_active: true
  },
  admission_pathways: {
    institute_id: '',
    campus_id: '',
    program_id: '',
    pathway_name: '',
    pathway_type: 'Direct',
    marks_required_min: '',
    marks_required_max: '',
    ielts_score: '',
    pte_score: '',
    toefl_score: '',
    duolingo_score: '',
    other: '',
    english_language_requirements: '',
    notes: '',
    is_active: true
  },
  required_docs: {
    doc_name: '',
    doc_category: 'academic',
    applicable_degree_level: 'All Degree Levels',
    programs_required: 'All Programs',
    description: '',
    is_mandatory: true,
    is_active: true
  },
  english_requirements: {
    institute_name: '',
    program_name: '',
    ielts_score: '',
    toefl_score: '',
    pte_score: '',
    duolingo_score: '',
    other: '',
    note: '',
    is_active: true
  },
  program_required_documents: {
    program_name: '',
    doc_name: '',
    is_mandatory: true,
    notes: ''
  },
  student_leads: {
    created_at: '',
    student_name: '',
    phone_number: '',
    email: '',
    interested_country: '',
    interested_institute: '',
    interested_program: '',
    degree_level: 'Bachelors',
    lead_source: 'chatbot_widget',
    last_message_snippet: '',
    status: 'new'
  },
  business_info: {
    organization_name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    office_timing: ''
  },
  v_chatbot_bot_details: {
    institute_name: '',
    country_name: '',
    program_name: '',
    degree_level: '',
    tuition_fee: '',
    currency: '',
    visa_approval_ratio: '',
    is_active: true
  },
  users: {
    full_name: '',
    username: '',
    role: '',
    email: '',
    is_active: true
  }
};

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
      { id: 'institutes', label: 'Institutes', primaryKey: 'institute_id', canModify: true, description: 'Partner institutes, campuses and rankings' },
      { id: 'programs', label: 'Programs & Fees', primaryKey: 'program_id', canModify: true, description: 'Degree programs, tuition fees and scholarships' },
    ]
  },
  {
    category: 'Admissions',
    tables: [
      { id: 'admission_pathways', label: 'Pathways', primaryKey: 'pathway_id', canModify: true, description: 'Pathway entry criteria, GPA & English test score requirements' },
      { id: 'required_docs', label: 'Documents', primaryKey: 'doc_id', canModify: true, description: 'Master document catalog & program required documents' },
    ]
  },
  {
    category: 'Chatbot Leads',
    tables: [
      { id: 'student_leads', label: 'Chatbot Leads', primaryKey: 'lead_id', canModify: true, canAdd: false, description: 'Inquiries captured from chatbot students' },
    ]
  },
  {
    category: 'Office Info',
    tables: [
      { id: 'business_info', label: 'Office Info', primaryKey: 'id', canModify: true, description: 'Educatia office contact, timing & address' },
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

// In-memory cache for foreign key lookups to keep UI fast and resolve human names
let fkCache = {
  timestamp: 0,
  countries: {},
  states: {},
  cities: {},
  institutes: {},
  campuses: {},
  instCampuses: {},
  programs: {},
  programFees: {},
  scholarships: {},
  docs: {},
  pathways: {}
};

export async function preloadForeignKeyMaps(force = false) {
  const client = getSupabaseClient();
  if (!client) return fkCache;

  const now = Date.now();
  if (!force && fkCache.timestamp && (now - fkCache.timestamp < 30000)) {
    return fkCache;
  }

  try {
    const [
      countriesRes,
      statesRes,
      citiesRes,
      instRes,
      campusesRes,
      programsRes,
      feesRes,
      scholarshipsRes,
      docsRes,
      pathwaysRes,
      englishRes,
      progDocsRes
    ] = await Promise.allSettled([
      client.from('countries').select('*').limit(200),
      client.from('states').select('*').limit(200),
      client.from('cities').select('*').limit(200),
      client.from('institutes').select('*').limit(200),
      client.from('campuses').select('*').limit(200),
      client.from('programs').select('*').limit(200),
      client.from('program_fees').select('*').limit(200),
      client.from('scholarships').select('*').limit(200),
      client.from('required_docs').select('*').limit(200),
      client.from('admission_pathways').select('*').limit(200),
      client.from('english_requirements').select('*').limit(200),
      client.from('program_required_documents').select('*').limit(200)
    ]);

    const countries = {};
    if (countriesRes.status === 'fulfilled' && countriesRes.value?.data) {
      countriesRes.value.data.forEach(r => {
        const id = r.country_id !== undefined ? r.country_id : r.id;
        const name = r.country_name || r.name || r.country;
        if (id !== undefined && name) countries[id] = name;
      });
    }

    const states = {};
    if (statesRes.status === 'fulfilled' && statesRes.value?.data) {
      statesRes.value.data.forEach(r => {
        const id = r.state_id !== undefined ? r.state_id : r.id;
        const name = r.state_name || r.name || r.state;
        if (id !== undefined && name) states[id] = name;
      });
    }

    const cities = {};
    if (citiesRes.status === 'fulfilled' && citiesRes.value?.data) {
      citiesRes.value.data.forEach(r => {
        const id = r.city_id !== undefined ? r.city_id : r.id;
        const name = r.city_name || r.name || r.city;
        if (id !== undefined && name) cities[id] = name;
      });
    }

    const institutes = {};
    if (instRes.status === 'fulfilled' && instRes.value?.data) {
      instRes.value.data.forEach(r => {
        const id = r.institute_id !== undefined ? r.institute_id : r.id;
        const name = r.institute_name || r.name || r.university_name;
        if (id !== undefined && name) institutes[id] = name;
      });
    }

    const campuses = {};
    const instCampuses = {};
    const instCampusLocations = {};
    if (campusesRes.status === 'fulfilled' && campusesRes.value?.data) {
      campusesRes.value.data.forEach(r => {
        const id = r.campus_id !== undefined ? r.campus_id : r.id;
        const name = r.campus_name || r.name;
        const loc = r.campus_location || '';
        if (id !== undefined && name) campuses[id] = name;
        const instId = r.institute_id !== undefined ? r.institute_id : r.university_id;
        if (instId !== undefined) {
          if (name) {
            if (!instCampuses[instId]) instCampuses[instId] = [];
            instCampuses[instId].push(name);
          }
          if (loc) {
            if (!instCampusLocations[instId]) instCampusLocations[instId] = [];
            instCampusLocations[instId].push(loc);
          }
        }
      });
    }

    const programs = {};
    if (programsRes.status === 'fulfilled' && programsRes.value?.data) {
      programsRes.value.data.forEach(r => {
        const id = r.program_id !== undefined ? r.program_id : r.id;
        const name = r.program_name || r.name;
        if (id !== undefined && name) programs[id] = name;
      });
    }

    const programFees = {};
    if (feesRes.status === 'fulfilled' && feesRes.value?.data) {
      feesRes.value.data.forEach(r => {
        const progId = r.program_id;
        if (progId !== undefined) programFees[progId] = r;
      });
    }

    const scholarships = {};
    if (scholarshipsRes.status === 'fulfilled' && scholarshipsRes.value?.data) {
      scholarshipsRes.value.data.forEach(r => {
        const progId = r.program_id;
        if (progId !== undefined) scholarships[progId] = r;
      });
    }

    const docs = {};
    if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
      docsRes.value.data.forEach(r => {
        const id = r.doc_id !== undefined ? r.doc_id : r.id;
        const name = r.doc_name || r.name;
        if (id !== undefined && name) docs[id] = name;
      });
    }

    const pathways = {};
    if (pathwaysRes.status === 'fulfilled' && pathwaysRes.value?.data) {
      pathwaysRes.value.data.forEach(r => {
        const id = r.pathway_id !== undefined ? r.pathway_id : r.id;
        const name = r.pathway_name || r.name;
        if (id !== undefined && name) pathways[id] = name;
      });
    }

    const engReqs = {};
    if (englishRes.status === 'fulfilled' && englishRes.value?.data) {
      englishRes.value.data.forEach(r => {
        const progId = r.program_id;
        const instId = r.institute_id;
        if (progId !== undefined && progId !== null) engReqs[progId] = r;
        if (instId !== undefined && instId !== null) engReqs[`inst_${instId}`] = r;
      });
    }

    const docPrograms = {};
    if (progDocsRes.status === 'fulfilled' && progDocsRes.value?.data) {
      progDocsRes.value.data.forEach(r => {
        const dId = r.doc_id;
        const pId = r.program_id;
        const pName = (pId && programs[pId]) ? programs[pId] : (pId ? 'Selected Program' : 'All Programs');
        if (dId !== undefined && dId !== null) {
          if (!docPrograms[dId]) docPrograms[dId] = [];
          if (!docPrograms[dId].includes(pName)) docPrograms[dId].push(pName);
        }
      });
    }

    fkCache = {
      timestamp: now,
      countries,
      states,
      cities,
      institutes,
      campuses,
      instCampuses,
      instCampusLocations,
      programs,
      programFees,
      scholarships,
      docs,
      pathways,
      engReqs,
      docPrograms
    };
  } catch (err) {
    console.warn('Foreign key map preloading notice:', err);
  }

  return fkCache;
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
      query = query.or(`session_id.ilike.${term},content.ilike.${term}`);
    } else if (tableName === 'student_leads') {
      query = query.or(`student_name.ilike.${term},phone_number.ilike.${term},email.ilike.${term}`);
    } else if (tableName === 'countries') {
      query = query.or(`country_name.ilike.${term}`);
    } else if (tableName === 'states') {
      query = query.or(`state_name.ilike.${term}`);
    } else if (tableName === 'cities') {
      query = query.or(`city_name.ilike.${term}`);
    } else if (tableName === 'institutes') {
      query = query.or(`institute_name.ilike.${term},website.ilike.${term},institute_location.ilike.${term}`);
    } else if (tableName === 'programs') {
      query = query.or(`program_name.ilike.${term},degree_level.ilike.${term}`);
    } else if (tableName === 'admission_pathways') {
      query = query.or(`pathway_name.ilike.${term},pathway_type.ilike.${term}`);
    } else if (tableName === 'required_docs') {
      query = query.or(`doc_name.ilike.${term},doc_category.ilike.${term}`);
    }
  }

  query = query.range(fromIndex, toIndex);

  const { data, count, error } = await query;

  if (error) {
    console.error(`Error fetching rows from '${tableName}':`, error);
    throw new Error(error.message);
  }

  // Preload and resolve foreign key IDs to friendly display names
  const maps = await preloadForeignKeyMaps();
  const cMap = maps.countries || {};
  const sMap = maps.states || {};
  const ctMap = maps.cities || {};
  const iMap = maps.institutes || {};
  const cpMap = maps.campuses || {};
  const icMap = maps.instCampuses || {};
  const icLocMap = maps.instCampusLocations || {};
  const pMap = maps.programs || {};
  const pfMap = maps.programFees || {};
  const scMap = maps.scholarships || {};
  const dMap = maps.docs || {};
  const pwMap = maps.pathways || {};
  const engMap = maps.engReqs || {};
  const docProgMap = maps.docPrograms || {};

  const enrichedData = (data || []).map(row => {
    if (!row) return {};
    const r = { ...row };

    // Resolve Foreign Keys to Human Names
    if (r.country_id !== undefined && cMap[r.country_id]) {
      r.country_name = cMap[r.country_id];
    }
    if (r.state_id !== undefined && sMap[r.state_id]) {
      r.state_name = sMap[r.state_id];
    }
    if (r.city_id !== undefined && ctMap[r.city_id]) {
      r.city_name = ctMap[r.city_id];
    }
    if (r.institute_id !== undefined && iMap[r.institute_id]) {
      r.institute_name = iMap[r.institute_id];
    }
    if (r.campus_id !== undefined && cpMap[r.campus_id]) {
      r.campus_name = cpMap[r.campus_id];
    }
    if (r.program_id !== undefined && pMap[r.program_id]) {
      r.program_name = pMap[r.program_id];
    }
    if (r.doc_id !== undefined && dMap[r.doc_id]) {
      r.doc_name = dMap[r.doc_id];
    }
    if (r.pathway_id !== undefined && pwMap[r.pathway_id]) {
      r.pathway_name = pwMap[r.pathway_id];
    }

    // Merged Academics: Institutes + Campuses
    if (tableName === 'institutes') {
      const campusList = icMap[r.institute_id];
      r.campuses = (campusList && campusList.length > 0) ? campusList.join(', ') : (r.campuses || 'Main Campus');
      const campusLocList = icLocMap[r.institute_id];
      if (campusLocList && campusLocList.length > 0) {
        r.campus_location = campusLocList.join(', ');
      }
    }

    // Merged Academics: Programs + Fees + Scholarships
    if (tableName === 'programs') {
      const fee = pfMap[r.program_id] || {};
      r.tuition_fee = fee.tuition_fee ? (fee.currency ? `${fee.currency} ${fee.tuition_fee}` : String(fee.tuition_fee)) : '—';
      r.application_fee = fee.application_fee ? (fee.currency ? `${fee.currency} ${fee.application_fee}` : String(fee.application_fee)) : '—';
      r.initial_deposit = fee.initial_deposit ? (fee.currency ? `${fee.currency} ${fee.initial_deposit}` : String(fee.initial_deposit)) : '—';
      r.currency = fee.currency || 'USD';
      r.pathway_foundation = fee.pathway_foundation !== undefined ? fee.pathway_foundation : true;
      r.scholarship_available = fee.scholarship_available !== undefined ? fee.scholarship_available : true;

      const sch = scMap[r.program_id] || {};
      r.scholarship_title = sch.scholarship_title || '—';
      r.scholarship_type = sch.scholarship_type || 'Merit-Based';
      r.scholarship_min = sch.scholarship_min || '—';
      r.scholarship_max = sch.scholarship_max || '—';
      r.scholarship_description = sch.description || sch.scholarship_description || '—';
    }

    // Merged Admissions: Pathways + English Requirements
    if (tableName === 'admission_pathways') {
      const eng = (r.program_id && engMap[r.program_id]) || (r.institute_id && engMap[`inst_${r.institute_id}`]) || {};
      r.ielts_score = (eng.ielts_score !== undefined && eng.ielts_score !== null) ? String(eng.ielts_score) : (r.ielts_score || '—');
      r.pte_score = (eng.pte_score !== undefined && eng.pte_score !== null) ? String(eng.pte_score) : (r.pte_score || '—');
      r.toefl_score = (eng.toefl_score !== undefined && eng.toefl_score !== null) ? String(eng.toefl_score) : (r.toefl_score || '—');
      r.duolingo_score = (eng.duolingo_score !== undefined && eng.duolingo_score !== null) ? String(eng.duolingo_score) : (r.duolingo_score || '—');
      r.other = eng.other || r.other || '—';
      r.english_language_requirements = r.english_language_requirements || r.english_language_requirement || eng.note || '—';
    }

    // Merged Admissions: Master Docs + Program Required Documents
    if (tableName === 'required_docs') {
      const pList = docProgMap[r.doc_id];
      r.programs_required = (pList && pList.length > 0) ? pList.join(', ') : (r.programs_required || 'All Programs');
      if (r.applicable_degree_level === undefined || r.applicable_degree_level === null) {
        r.applicable_degree_level = 'All Degree Levels';
      }
    }

    return r;
  });

  return {
    data: enrichedData,
    totalCount: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit) || 1
  };
}

/**
 * Fetch full chat transcript messages for a given session ID
 */
export async function fetchSessionMessages(sessionId, phoneNumber) {
  const client = getSupabaseClient();
  if (!client) return [];

  const sidStr = String(sessionId || '').trim();
  const phoneStr = String(phoneNumber || '').trim();

  // Don't use plain numeric lead IDs as session_id in chat_messages
  const isPlainNumericId = /^\d+$/.test(sidStr) && Number(sidStr) < 1_000_000_000_000;

  // 1. If phone number known, try phone-keyed lookup first (most reliable)
  if (phoneStr) {
    try {
      const { data } = await client
        .from('chat_messages')
        .select('*')
        .eq('session_id', `phone_${phoneStr}`)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) return data;
    } catch (_e) {}
  }

  // 2. Exact session_id match (for real session strings like sess_xxx)
  if (!isPlainNumericId && sidStr) {
    try {
      const { data } = await client
        .from('chat_messages')
        .select('*')
        .eq('session_id', sidStr)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) return data;
    } catch (_e) {}
  }

  // 3. Look up student_leads to get phone number & session_id, then query chat_messages
  try {
    const isNum = !isNaN(Number(sidStr)) && sidStr.length < 10;
    let query = client.from('student_leads').select('lead_id, session_id, last_message_snippet, phone_number, created_at');
    if (isNum) {
      query = query.eq('lead_id', Number(sidStr));
    } else if (sidStr) {
      query = query.or(`phone_number.eq.${sidStr},session_id.eq.${sidStr}`);
    }

    const { data: leadRows } = await query.limit(1);

    if (leadRows && leadRows.length > 0) {
      const leadRow = leadRows[0];

      // A. Try phone-keyed lookup
      if (leadRow.phone_number) {
        try {
          const { data: phoneMsgs } = await client
            .from('chat_messages')
            .select('*')
            .eq('session_id', `phone_${leadRow.phone_number}`)
            .order('created_at', { ascending: true });
          if (phoneMsgs && phoneMsgs.length > 0) return phoneMsgs;
        } catch (_e) {}
      }

      // B. Try linked session_id in chat_messages
      if (leadRow.session_id && !leadRow.session_id.startsWith('phone_')) {
        try {
          const { data: leadMsgs } = await client
            .from('chat_messages')
            .select('*')
            .eq('session_id', leadRow.session_id)
            .order('created_at', { ascending: true });
          if (leadMsgs && leadMsgs.length > 0) return leadMsgs;
        } catch (_e) {}
      }

      // C. Parse JSON transcript from last_message_snippet
      if (leadRow.last_message_snippet) {
        const raw = String(leadRow.last_message_snippet).trim();
        if (raw.startsWith('[') || raw.startsWith('{')) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.map((p, idx) => ({
                id: `snippet-${idx}`,
                session_id: leadRow.session_id || sidStr,
                role: p.role || (idx % 2 === 0 ? 'user' : 'bot'),
                content: p.content || String(p),
                created_at: p.created_at || p.timestamp || leadRow.created_at || new Date().toISOString()
              }));
            }
          } catch (_e) {}
        }
      }
    }
  } catch (_e) {}

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

  // If saving institutes, extract campuses & campus_location for secondary upsert
  let campusesToSave = null;
  let campusLocationToSave = null;
  if (tableName === 'institutes') {
    if (currentPayload.campuses !== undefined) {
      campusesToSave = currentPayload.campuses;
      delete currentPayload.campuses;
    }
    if (currentPayload.campus_location !== undefined) {
      campusLocationToSave = currentPayload.campus_location;
      delete currentPayload.campus_location;
    }
  }

  // If saving programs, extract fee and scholarship details for secondary upsert
  let feeToSave = null;
  let scholarshipToSave = null;
  if (tableName === 'programs') {
    if (
      currentPayload.tuition_fee !== undefined ||
      currentPayload.initial_deposit !== undefined ||
      currentPayload.currency !== undefined ||
      currentPayload.application_fee !== undefined ||
      currentPayload.pathway_foundation !== undefined ||
      currentPayload.scholarship_available !== undefined
    ) {
      feeToSave = {
        tuition_fee: (currentPayload.tuition_fee !== '' && currentPayload.tuition_fee !== null && currentPayload.tuition_fee !== undefined) ? parseFloat(String(currentPayload.tuition_fee).replace(/[^0-9.]/g, '')) || null : null,
        initial_deposit: (currentPayload.initial_deposit !== '' && currentPayload.initial_deposit !== null && currentPayload.initial_deposit !== undefined) ? parseFloat(String(currentPayload.initial_deposit).replace(/[^0-9.]/g, '')) || null : null,
        application_fee: (currentPayload.application_fee !== '' && currentPayload.application_fee !== null && currentPayload.application_fee !== undefined) ? parseFloat(String(currentPayload.application_fee).replace(/[^0-9.]/g, '')) || null : null,
        currency: currentPayload.currency || 'USD',
        pathway_foundation: currentPayload.pathway_foundation !== undefined ? currentPayload.pathway_foundation : true,
        scholarship_available: currentPayload.scholarship_available !== undefined ? currentPayload.scholarship_available : true,
        campus_id: currentPayload.campus_id || null,
        is_active: currentPayload.is_active !== undefined ? currentPayload.is_active : true
      };
      delete currentPayload.tuition_fee;
      delete currentPayload.initial_deposit;
      delete currentPayload.application_fee;
      delete currentPayload.currency;
      delete currentPayload.pathway_foundation;
      delete currentPayload.scholarship_available;
    }
    if (
      currentPayload.scholarship_title ||
      currentPayload.scholarship_min ||
      currentPayload.scholarship_max ||
      currentPayload.scholarship_type ||
      currentPayload.scholarship_description ||
      currentPayload.description
    ) {
      scholarshipToSave = {
        scholarship_title: currentPayload.scholarship_title || null,
        scholarship_min: (currentPayload.scholarship_min !== '' && currentPayload.scholarship_min !== null && currentPayload.scholarship_min !== undefined) ? parseFloat(String(currentPayload.scholarship_min).replace(/[^0-9.]/g, '')) || null : null,
        scholarship_max: (currentPayload.scholarship_max !== '' && currentPayload.scholarship_max !== null && currentPayload.scholarship_max !== undefined) ? parseFloat(String(currentPayload.scholarship_max).replace(/[^0-9.]/g, '')) || null : null,
        scholarship_type: currentPayload.scholarship_type || 'Merit-Based',
        description: currentPayload.scholarship_description || currentPayload.description || null,
        currency: currentPayload.currency || 'USD',
        is_active: currentPayload.is_active !== undefined ? currentPayload.is_active : true
      };
      delete currentPayload.scholarship_title;
      delete currentPayload.scholarship_min;
      delete currentPayload.scholarship_max;
      delete currentPayload.scholarship_type;
      delete currentPayload.scholarship_description;
      delete currentPayload.description;
    }
  }

  // If saving admission_pathways, extract test score details for secondary upsert
  let englishToSave = null;
  if (tableName === 'admission_pathways') {
    if (
      currentPayload.ielts_score !== undefined ||
      currentPayload.pte_score !== undefined ||
      currentPayload.toefl_score !== undefined ||
      currentPayload.duolingo_score !== undefined ||
      currentPayload.other !== undefined
    ) {
      englishToSave = {
        ielts_score: (currentPayload.ielts_score !== '' && currentPayload.ielts_score !== null && currentPayload.ielts_score !== undefined) ? parseFloat(String(currentPayload.ielts_score).replace(/[^0-9.]/g, '')) || null : null,
        pte_score: (currentPayload.pte_score !== '' && currentPayload.pte_score !== null && currentPayload.pte_score !== undefined) ? parseFloat(String(currentPayload.pte_score).replace(/[^0-9.]/g, '')) || null : null,
        toefl_score: (currentPayload.toefl_score !== '' && currentPayload.toefl_score !== null && currentPayload.toefl_score !== undefined) ? parseFloat(String(currentPayload.toefl_score).replace(/[^0-9.]/g, '')) || null : null,
        duolingo_score: (currentPayload.duolingo_score !== '' && currentPayload.duolingo_score !== null && currentPayload.duolingo_score !== undefined) ? parseFloat(String(currentPayload.duolingo_score).replace(/[^0-9.]/g, '')) || null : null,
        other: currentPayload.other || null,
        note: currentPayload.notes || currentPayload.note || null,
        is_active: currentPayload.is_active !== undefined ? currentPayload.is_active : true
      };
      delete currentPayload.ielts_score;
      delete currentPayload.pte_score;
      delete currentPayload.toefl_score;
      delete currentPayload.duolingo_score;
      delete currentPayload.other;
    }
  }

  // If saving required_docs, extract program mapping details and clean degree level
  if (tableName === 'required_docs') {
    if (currentPayload.programs_required !== undefined) {
      delete currentPayload.programs_required;
    }
    if (currentPayload.applicable_degree_level === 'All Degree Levels' || currentPayload.applicable_degree_level === '') {
      currentPayload.applicable_degree_level = null;
    }
  }

  let attempts = 0;
  const maxAttempts = 6;
  let savedRows = null;

  while (attempts < maxAttempts) {
    attempts++;
    const { data, error } = await client
      .from(tableName)
      .insert(currentPayload)
      .select();

    if (!error) {
      savedRows = data;
      break;
    }

    const rawMsg = error.message || String(error);
    const lower = rawMsg.toLowerCase();

    // 1. If Postgres complains about an unknown/missing column in table schema
    if (lower.includes('column') && (lower.includes('does not exist') || lower.includes('could not find') || lower.includes('schema') || lower.includes('pgrst204'))) {
      const match = rawMsg.match(/could not find the '([a-zA-Z0-9_]+)' column/i) ||
                    rawMsg.match(/column "([a-zA-Z0-9_]+)"/i) ||
                    rawMsg.match(/column '([a-zA-Z0-9_]+)'/i) ||
                    rawMsg.match(/'([a-zA-Z0-9_]+)'/);
      const invalidCol = match ? match[1] : null;

      if (invalidCol && Object.prototype.hasOwnProperty.call(currentPayload, invalidCol)) {
        console.warn(`Stripping column '${invalidCol}' not present in Supabase '${tableName}' schema and retrying insert.`);
        delete currentPayload[invalidCol];
        continue;
      }
    }

    // 2. If Postgres complains about an invalid input value for an enum (casing or unsupported enum value)
    if (lower.includes('invalid input value for enum') || lower.includes('enum')) {
      const match = rawMsg.match(/invalid input value for enum (?:[a-zA-Z0-9_]+)?:\s*"?([^"'\n]+)"?/i) ||
                    rawMsg.match(/enum [a-zA-Z0-9_]+:\s*"?([^"'\n]+)"?/i) ||
                    rawMsg.match(/"([^"'\n]+)"/);
      const invalidVal = match ? match[1].trim() : null;

      if (invalidVal) {
        let foundField = null;
        for (const [k, v] of Object.entries(currentPayload)) {
          if (v !== null && v !== undefined && (String(v).toLowerCase() === invalidVal.toLowerCase() || String(v) === invalidVal)) {
            foundField = k;
            break;
          }
        }

        if (foundField) {
          const currentVal = String(currentPayload[foundField]);
          const titleCase = currentVal.charAt(0).toUpperCase() + currentVal.slice(1).toLowerCase();
          const lowerCase = currentVal.toLowerCase();

          if (currentVal !== titleCase && currentVal === lowerCase) {
            console.warn(`Enum casing mismatch on '${foundField}'. Retrying with TitleCase '${titleCase}'.`);
            currentPayload[foundField] = titleCase;
            continue;
          } else if (currentVal !== lowerCase && currentVal === titleCase) {
            console.warn(`Enum casing mismatch on '${foundField}'. Retrying with lowercase '${lowerCase}'.`);
            currentPayload[foundField] = lowerCase;
            continue;
          } else {
            console.warn(`Invalid enum value '${currentVal}' on '${foundField}'. Retrying with null.`);
            currentPayload[foundField] = null;
            continue;
          }
        }
      }
    }

    console.error(`Error inserting row into '${tableName}':`, error);
    throw new Error(error.message);
  }

  if (!savedRows || savedRows.length === 0) {
    throw new Error(`Failed to insert row into '${tableName}'.`);
  }

  const primaryRecord = savedRows[0];
  const primaryId = primaryRecord[tableName === 'institutes' ? 'institute_id' : (tableName === 'programs' ? 'program_id' : (tableName === 'admission_pathways' ? 'pathway_id' : (tableName === 'required_docs' ? 'doc_id' : 'id')))] || primaryRecord.id;

  // Secondary upsert: Campuses under Institutes
  if (tableName === 'institutes' && (campusesToSave || campusLocationToSave) && primaryId) {
    const campusList = campusesToSave ? String(campusesToSave).split(',').map(s => s.trim()).filter(Boolean) : ['Main Campus'];
    for (const cName of campusList) {
      try {
        await client.from('campuses').insert({
          campus_name: cName,
          institute_id: primaryId,
          city_id: recordData.city_id || null,
          campus_location: campusLocationToSave || null,
          is_active: true
        });
      } catch (cErr) {
        console.warn('Campus secondary insert notice:', cErr);
      }
    }
  }

  // Secondary upsert: Fees & Scholarships under Programs
  if (tableName === 'programs' && primaryId) {
    if (feeToSave && (feeToSave.tuition_fee || feeToSave.initial_deposit)) {
      try {
        await client.from('program_fees').insert({
          program_id: primaryId,
          ...feeToSave
        });
      } catch (fErr) {
        console.warn('Fee secondary insert notice:', fErr);
      }
    }
    if (scholarshipToSave && scholarshipToSave.scholarship_title) {
      try {
        await client.from('scholarships').insert({
          program_id: primaryId,
          institute_id: recordData.institute_id || null,
          ...scholarshipToSave
        });
      } catch (sErr) {
        console.warn('Scholarship secondary insert notice:', sErr);
      }
    }
  }

  // Secondary upsert: English requirements under Pathways
  if (tableName === 'admission_pathways' && englishToSave) {
    try {
      await client.from('english_requirements').insert({
        program_id: recordData.program_id || null,
        institute_id: recordData.institute_id || null,
        ...englishToSave
      });
    } catch (eErr) {
      console.warn('English requirements secondary insert notice:', eErr);
    }
  }

  // Secondary upsert: Program Required Documents mapping under required_docs
  if (tableName === 'required_docs' && primaryId) {
    const selectedProg = recordData.programs_required;
    if (selectedProg && selectedProg !== 'All Programs') {
      try {
        const { data: matchedProgs } = await client.from('programs').select('program_id').ilike('program_name', selectedProg).limit(1);
        const targetProgId = (matchedProgs && matchedProgs[0]?.program_id) || null;
        if (targetProgId) {
          await client.from('program_required_documents').insert({
            doc_id: primaryId,
            program_id: targetProgId,
            is_mandatory: recordData.is_mandatory !== undefined ? recordData.is_mandatory : true,
            notes: recordData.description || null
          });
        }
      } catch (pErr) {
        console.warn('Program required document secondary insert notice:', pErr);
      }
    }
  }

  // Invalidate cache so fresh data appears immediately
  preloadForeignKeyMaps(true);

  return savedRows;
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

  // If saving institutes, extract campuses & campus_location for secondary upsert
  let campusesToSave = null;
  let campusLocationToSave = null;
  if (tableName === 'institutes') {
    if (currentPayload.campuses !== undefined) {
      campusesToSave = currentPayload.campuses;
      delete currentPayload.campuses;
    }
    if (currentPayload.campus_location !== undefined) {
      campusLocationToSave = currentPayload.campus_location;
      delete currentPayload.campus_location;
    }
  }

  // If saving programs, extract fee and scholarship details for secondary upsert
  let feeToSave = null;
  let scholarshipToSave = null;
  if (tableName === 'programs') {
    if (
      currentPayload.tuition_fee !== undefined ||
      currentPayload.initial_deposit !== undefined ||
      currentPayload.currency !== undefined ||
      currentPayload.application_fee !== undefined ||
      currentPayload.pathway_foundation !== undefined ||
      currentPayload.scholarship_available !== undefined
    ) {
      feeToSave = {
        tuition_fee: (currentPayload.tuition_fee !== '' && currentPayload.tuition_fee !== null && currentPayload.tuition_fee !== undefined) ? parseFloat(String(currentPayload.tuition_fee).replace(/[^0-9.]/g, '')) || null : null,
        initial_deposit: (currentPayload.initial_deposit !== '' && currentPayload.initial_deposit !== null && currentPayload.initial_deposit !== undefined) ? parseFloat(String(currentPayload.initial_deposit).replace(/[^0-9.]/g, '')) || null : null,
        application_fee: (currentPayload.application_fee !== '' && currentPayload.application_fee !== null && currentPayload.application_fee !== undefined) ? parseFloat(String(currentPayload.application_fee).replace(/[^0-9.]/g, '')) || null : null,
        currency: currentPayload.currency || 'USD',
        pathway_foundation: currentPayload.pathway_foundation !== undefined ? currentPayload.pathway_foundation : true,
        scholarship_available: currentPayload.scholarship_available !== undefined ? currentPayload.scholarship_available : true,
        campus_id: currentPayload.campus_id || null,
        is_active: currentPayload.is_active !== undefined ? currentPayload.is_active : true
      };
      delete currentPayload.tuition_fee;
      delete currentPayload.initial_deposit;
      delete currentPayload.application_fee;
      delete currentPayload.currency;
      delete currentPayload.pathway_foundation;
      delete currentPayload.scholarship_available;
    }
    if (
      currentPayload.scholarship_title !== undefined ||
      currentPayload.scholarship_min !== undefined ||
      currentPayload.scholarship_max !== undefined ||
      currentPayload.scholarship_type !== undefined ||
      currentPayload.scholarship_description !== undefined ||
      currentPayload.description !== undefined
    ) {
      scholarshipToSave = {
        scholarship_title: currentPayload.scholarship_title || null,
        scholarship_min: (currentPayload.scholarship_min !== '' && currentPayload.scholarship_min !== null && currentPayload.scholarship_min !== undefined) ? parseFloat(String(currentPayload.scholarship_min).replace(/[^0-9.]/g, '')) || null : null,
        scholarship_max: (currentPayload.scholarship_max !== '' && currentPayload.scholarship_max !== null && currentPayload.scholarship_max !== undefined) ? parseFloat(String(currentPayload.scholarship_max).replace(/[^0-9.]/g, '')) || null : null,
        scholarship_type: currentPayload.scholarship_type || 'Merit-Based',
        description: currentPayload.scholarship_description || currentPayload.description || null,
        currency: currentPayload.currency || 'USD',
        is_active: currentPayload.is_active !== undefined ? currentPayload.is_active : true
      };
      delete currentPayload.scholarship_title;
      delete currentPayload.scholarship_min;
      delete currentPayload.scholarship_max;
      delete currentPayload.scholarship_type;
      delete currentPayload.scholarship_description;
      delete currentPayload.description;
    }
  }

  // If saving admission_pathways, extract test score details for secondary upsert
  let englishToSave = null;
  if (tableName === 'admission_pathways') {
    if (
      currentPayload.ielts_score !== undefined ||
      currentPayload.pte_score !== undefined ||
      currentPayload.toefl_score !== undefined ||
      currentPayload.duolingo_score !== undefined ||
      currentPayload.other !== undefined
    ) {
      englishToSave = {
        ielts_score: (currentPayload.ielts_score !== '' && currentPayload.ielts_score !== null && currentPayload.ielts_score !== undefined) ? parseFloat(String(currentPayload.ielts_score).replace(/[^0-9.]/g, '')) || null : null,
        pte_score: (currentPayload.pte_score !== '' && currentPayload.pte_score !== null && currentPayload.pte_score !== undefined) ? parseFloat(String(currentPayload.pte_score).replace(/[^0-9.]/g, '')) || null : null,
        toefl_score: (currentPayload.toefl_score !== '' && currentPayload.toefl_score !== null && currentPayload.toefl_score !== undefined) ? parseFloat(String(currentPayload.toefl_score).replace(/[^0-9.]/g, '')) || null : null,
        duolingo_score: (currentPayload.duolingo_score !== '' && currentPayload.duolingo_score !== null && currentPayload.duolingo_score !== undefined) ? parseFloat(String(currentPayload.duolingo_score).replace(/[^0-9.]/g, '')) || null : null,
        other: currentPayload.other || null,
        note: currentPayload.notes || currentPayload.note || null,
        is_active: currentPayload.is_active !== undefined ? currentPayload.is_active : true
      };
      delete currentPayload.ielts_score;
      delete currentPayload.pte_score;
      delete currentPayload.toefl_score;
      delete currentPayload.duolingo_score;
      delete currentPayload.other;
    }
  }

  // If saving required_docs, extract program mapping details and clean degree level
  if (tableName === 'required_docs') {
    if (currentPayload.programs_required !== undefined) {
      delete currentPayload.programs_required;
    }
    if (currentPayload.applicable_degree_level === 'All Degree Levels' || currentPayload.applicable_degree_level === '') {
      currentPayload.applicable_degree_level = null;
    }
  }

  let attempts = 0;
  const maxAttempts = 6;
  let updatedRows = null;

  while (attempts < maxAttempts) {
    attempts++;
    const { data, error } = await client
      .from(tableName)
      .update(currentPayload)
      .eq(primaryKeyField, primaryKeyValue)
      .select();

    if (!error) {
      updatedRows = data;
      break;
    }

    const rawMsg = error.message || String(error);
    const lower = rawMsg.toLowerCase();

    // 1. If Postgres complains about an unknown/missing column in table schema
    if (lower.includes('column') && (lower.includes('does not exist') || lower.includes('could not find') || lower.includes('schema') || lower.includes('pgrst204'))) {
      const match = rawMsg.match(/could not find the '([a-zA-Z0-9_]+)' column/i) ||
                    rawMsg.match(/column "([a-zA-Z0-9_]+)"/i) ||
                    rawMsg.match(/column '([a-zA-Z0-9_]+)'/i) ||
                    rawMsg.match(/'([a-zA-Z0-9_]+)'/);
      const invalidCol = match ? match[1] : null;

      if (invalidCol && Object.prototype.hasOwnProperty.call(currentPayload, invalidCol)) {
        console.warn(`Stripping column '${invalidCol}' not present in Supabase '${tableName}' schema and retrying update.`);
        delete currentPayload[invalidCol];
        continue;
      }
    }

    // 2. If Postgres complains about an invalid input value for an enum (casing or unsupported enum value)
    if (lower.includes('invalid input value for enum') || lower.includes('enum')) {
      const match = rawMsg.match(/invalid input value for enum (?:[a-zA-Z0-9_]+)?:\s*"?([^"'\n]+)"?/i) ||
                    rawMsg.match(/enum [a-zA-Z0-9_]+:\s*"?([^"'\n]+)"?/i) ||
                    rawMsg.match(/"([^"'\n]+)"/);
      const invalidVal = match ? match[1].trim() : null;

      if (invalidVal) {
        let foundField = null;
        for (const [k, v] of Object.entries(currentPayload)) {
          if (v !== null && v !== undefined && (String(v).toLowerCase() === invalidVal.toLowerCase() || String(v) === invalidVal)) {
            foundField = k;
            break;
          }
        }

        if (foundField) {
          const currentVal = String(currentPayload[foundField]);
          const titleCase = currentVal.charAt(0).toUpperCase() + currentVal.slice(1).toLowerCase();
          const lowerCase = currentVal.toLowerCase();

          if (currentVal !== titleCase && currentVal === lowerCase) {
            console.warn(`Enum casing mismatch on '${foundField}'. Retrying with TitleCase '${titleCase}'.`);
            currentPayload[foundField] = titleCase;
            continue;
          } else if (currentVal !== lowerCase && currentVal === titleCase) {
            console.warn(`Enum casing mismatch on '${foundField}'. Retrying with lowercase '${lowerCase}'.`);
            currentPayload[foundField] = lowerCase;
            continue;
          } else {
            console.warn(`Invalid enum value '${currentVal}' on '${foundField}'. Retrying with null.`);
            currentPayload[foundField] = null;
            continue;
          }
        }
      }
    }

    console.error(`Error updating row in '${tableName}' where ${primaryKeyField}=${primaryKeyValue}:`, error);
    throw new Error(error.message);
  }

  // Secondary upsert: Campuses under Institutes
  if (tableName === 'institutes' && (campusesToSave !== null || campusLocationToSave !== null)) {
    const campusList = campusesToSave ? String(campusesToSave).split(',').map(s => s.trim()).filter(Boolean) : ['Main Campus'];
    for (const cName of campusList) {
      try {
        const { data: existing } = await client.from('campuses').select('campus_id').eq('institute_id', primaryKeyValue).eq('campus_name', cName).limit(1);
        if (existing && existing.length > 0) {
          if (campusLocationToSave !== null) {
            await client.from('campuses').update({ campus_location: campusLocationToSave }).eq('campus_id', existing[0].campus_id);
          }
        } else {
          await client.from('campuses').insert({
            campus_name: cName,
            institute_id: primaryKeyValue,
            city_id: recordData.city_id || null,
            campus_location: campusLocationToSave || null,
            is_active: true
          });
        }
      } catch (cErr) {
        console.warn('Campus secondary update notice:', cErr);
      }
    }
  }

  // Secondary upsert: Fees & Scholarships under Programs
  if (tableName === 'programs') {
    if (feeToSave && (feeToSave.tuition_fee || feeToSave.initial_deposit)) {
      try {
        const { data: existingFee } = await client.from('program_fees').select('fee_id').eq('program_id', primaryKeyValue).limit(1);
        if (existingFee && existingFee.length > 0) {
          await client.from('program_fees').update(feeToSave).eq('program_id', primaryKeyValue);
        } else {
          await client.from('program_fees').insert({ program_id: primaryKeyValue, ...feeToSave });
        }
      } catch (fErr) {
        console.warn('Fee secondary update notice:', fErr);
      }
    }
    if (scholarshipToSave && scholarshipToSave.scholarship_title) {
      try {
        const { data: existingSch } = await client.from('scholarships').select('scholarship_id').eq('program_id', primaryKeyValue).limit(1);
        if (existingSch && existingSch.length > 0) {
          await client.from('scholarships').update(scholarshipToSave).eq('program_id', primaryKeyValue);
        } else {
          await client.from('scholarships').insert({
            program_id: primaryKeyValue,
            institute_id: recordData.institute_id || null,
            ...scholarshipToSave
          });
        }
      } catch (sErr) {
        console.warn('Scholarship secondary update notice:', sErr);
      }
    }
  }

  // Secondary upsert: English requirements under Pathways
  if (tableName === 'admission_pathways' && englishToSave) {
    try {
      const matchKey = recordData.program_id ? 'program_id' : (recordData.institute_id ? 'institute_id' : null);
      const matchVal = recordData.program_id || recordData.institute_id;
      if (matchKey && matchVal) {
        const { data: existingEng } = await client.from('english_requirements').select('requirement_id').eq(matchKey, matchVal).limit(1);
        if (existingEng && existingEng.length > 0) {
          await client.from('english_requirements').update(englishToSave).eq('requirement_id', existingEng[0].requirement_id);
        } else {
          await client.from('english_requirements').insert({
            program_id: recordData.program_id || null,
            institute_id: recordData.institute_id || null,
            ...englishToSave
          });
        }
      }
    } catch (eErr) {
      console.warn('English requirements secondary update notice:', eErr);
    }
  }

  // Secondary upsert: Program Required Documents mapping under required_docs
  if (tableName === 'required_docs' && primaryKeyValue) {
    const selectedProg = recordData.programs_required;
    try {
      if (selectedProg && selectedProg !== 'All Programs') {
        const { data: matchedProgs } = await client.from('programs').select('program_id').ilike('program_name', selectedProg).limit(1);
        const targetProgId = (matchedProgs && matchedProgs[0]?.program_id) || null;
        if (targetProgId) {
          const { data: existingPrd } = await client.from('program_required_documents').select('id, doc_id, program_id').eq('doc_id', primaryKeyValue).limit(1);
          if (existingPrd && existingPrd.length > 0) {
            await client.from('program_required_documents').update({
              program_id: targetProgId,
              is_mandatory: recordData.is_mandatory !== undefined ? recordData.is_mandatory : true,
              notes: recordData.description || null
            }).eq('doc_id', primaryKeyValue);
          } else {
            await client.from('program_required_documents').insert({
              doc_id: primaryKeyValue,
              program_id: targetProgId,
              is_mandatory: recordData.is_mandatory !== undefined ? recordData.is_mandatory : true,
              notes: recordData.description || null
            });
          }
        }
      } else {
        await client.from('program_required_documents').delete().eq('doc_id', primaryKeyValue);
      }
    } catch (pErr) {
      console.warn('Program required document secondary update notice:', pErr);
    }
  }

  // Invalidate cache so fresh data appears immediately
  preloadForeignKeyMaps(true);

  return updatedRows;
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
