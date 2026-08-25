import React, { useState, useEffect } from 'react';
import { X, Save, Plus, AlertCircle, Check } from 'lucide-react';
import { insertTableRow, updateTableRow, fetchTableRows, getHumanFieldName, formatUserFriendlyError, getSingularLabel } from '../../services/adminSupabaseService';

// Foreign key lookup configurations
const FOREIGN_KEY_MAP = {
  institute_id: { table: 'institutes', labelKey: 'institute_name', pKey: 'institute_id', nameKeyInForm: 'institute_name' },
  campus_id: { table: 'campuses', labelKey: 'campus_name', pKey: 'campus_id', nameKeyInForm: 'campus_name' },
  program_id: { table: 'programs', labelKey: 'program_name', pKey: 'program_id', nameKeyInForm: 'program_name' },
  country_id: { table: 'countries', labelKey: 'country_name', pKey: 'country_id', nameKeyInForm: 'country_name' },
  state_id: { table: 'states', labelKey: 'state_name', pKey: 'state_id', nameKeyInForm: 'state_name' },
  city_id: { table: 'cities', labelKey: 'city_name', pKey: 'city_id', nameKeyInForm: 'city_name' },
  doc_id: { table: 'required_docs', labelKey: 'doc_name', pKey: 'doc_id', nameKeyInForm: 'doc_name' },
  pathway_id: { table: 'admission_pathways', labelKey: 'pathway_name', pKey: 'pathway_id', nameKeyInForm: 'pathway_name' }
};

// Default field schemas when database table has 0 rows or sampleRow is not available
const DEFAULT_TABLE_SCHEMAS = {
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
  student_leads: {
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
  chat_sessions: {
    user_ip: '',
    user_agent: ''
  },
  chat_messages: {
    role: 'user',
    content: ''
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
  campuses: {
    campus_name: '',
    institute_id: '',
    city_id: '',
    campus_location: '',
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
  program_required_documents: {
    program_id: '',
    doc_id: '',
    pathway_id: '',
    is_mandatory: true,
    notes: ''
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
    program_id: '',
    institute_id: '',
    ielts_score: '',
    toefl_score: '',
    pte_score: '',
    duolingo_score: '',
    other: '',
    note: '',
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
    country_id: '',
    state_name: '',
    is_active: true
  },
  cities: {
    state_id: '',
    city_name: '',
    is_active: true
  }
};

export default function AdminRecordModal({
  isOpen,
  onClose,
  mode = 'create', // 'create' | 'edit'
  tableConfig,
  recordData = null,
  sampleRow = null,
  onSaved
}) {
  const [formData, setFormData] = useState({});
  const [fkOptions, setFkOptions] = useState({});
  const [loadingFkOptions, setLoadingFkOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Primary key and timestamp auto-managed system keys that should NOT be edited manually
  const systemAutoKeys = [
    tableConfig?.primaryKey,
    'id',
    'created_at',
    'updated_at'
  ].filter(Boolean);

  // Initialize form data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const defaultSchema = (tableConfig && DEFAULT_TABLE_SCHEMAS[tableConfig.id]) ? { ...DEFAULT_TABLE_SCHEMAS[tableConfig.id] } : {};
    let initial = { ...defaultSchema };

    if (recordData) {
      initial = { ...defaultSchema, ...recordData };
    }

    // Clean up & guarantee merged fields for Institutes table
    if (tableConfig?.id === 'institutes') {
      if (initial.state_id === undefined) initial.state_id = '';
      if (initial.city_id === undefined) initial.city_id = '';
      if (initial.institute_location === undefined) initial.institute_location = '';
      if (initial.campuses === undefined) initial.campuses = '';
      if (initial.campus_location === undefined) initial.campus_location = '';
    }

    // Clean up & guarantee merged fields for Programs table
    if (tableConfig?.id === 'programs') {
      if (initial.institute_id === undefined) initial.institute_id = '';
      if (initial.campus_id === undefined) initial.campus_id = '';
      if (initial.program_name === undefined) initial.program_name = '';
      if (initial.degree_level === undefined) initial.degree_level = 'Bachelors';
      if (initial.degree_duration === undefined) initial.degree_duration = '';
      if (initial.degree_intakes === undefined) initial.degree_intakes = '';
      if (initial.tuition_fee === undefined) initial.tuition_fee = '';
      if (initial.application_fee === undefined) initial.application_fee = '';
      if (initial.initial_deposit === undefined) initial.initial_deposit = '';
      if (initial.currency === undefined || !initial.currency) initial.currency = 'USD';
      if (initial.pathway_foundation === undefined) initial.pathway_foundation = true;
      if (initial.scholarship_available === undefined) initial.scholarship_available = true;
      if (initial.scholarship_title === undefined) initial.scholarship_title = '';
      if (initial.scholarship_type === undefined) initial.scholarship_type = 'Merit-Based';
      if (initial.scholarship_min === undefined) initial.scholarship_min = '';
      if (initial.scholarship_max === undefined) initial.scholarship_max = '';
      if (initial.scholarship_description === undefined) initial.scholarship_description = '';
      if (initial.english_language_requirement === undefined) initial.english_language_requirement = '';
      if (initial.is_active === undefined) initial.is_active = true;

      // Clean formatted currency symbols or dashes when loading existing record
      if (initial.tuition_fee) {
        initial.tuition_fee = String(initial.tuition_fee).replace(/^[A-Z]{3}\s*/, '').replace(/—/g, '');
      }
      if (initial.application_fee) {
        initial.application_fee = String(initial.application_fee).replace(/^[A-Z]{3}\s*/, '').replace(/—/g, '');
      }
      if (initial.initial_deposit) {
        initial.initial_deposit = String(initial.initial_deposit).replace(/^[A-Z]{3}\s*/, '').replace(/—/g, '');
      }
      if (initial.scholarship_title === '—') initial.scholarship_title = '';
      if (initial.scholarship_min === '—') initial.scholarship_min = '';
      if (initial.scholarship_max === '—') initial.scholarship_max = '';
      if (initial.scholarship_description === '—') initial.scholarship_description = '';
    }

    // Clean up & guarantee merged fields for Pathways table
    if (tableConfig?.id === 'admission_pathways') {
      if (initial.institute_id === undefined) initial.institute_id = '';
      if (initial.campus_id === undefined) initial.campus_id = '';
      if (initial.program_id === undefined) initial.program_id = '';
      if (initial.pathway_name === undefined) initial.pathway_name = '';
      if (initial.pathway_type === undefined) initial.pathway_type = 'Direct';
      if (initial.marks_required_min === undefined) initial.marks_required_min = '';
      if (initial.marks_required_max === undefined) initial.marks_required_max = '';
      if (initial.ielts_score === undefined) initial.ielts_score = '';
      if (initial.pte_score === undefined) initial.pte_score = '';
      if (initial.toefl_score === undefined) initial.toefl_score = '';
      if (initial.duolingo_score === undefined) initial.duolingo_score = '';
      if (initial.other === undefined) initial.other = '';
      if (initial.english_language_requirements === undefined) initial.english_language_requirements = initial.english_language_requirement || '';
      if (initial.notes === undefined) initial.notes = initial.note || '';
      if (initial.is_active === undefined) initial.is_active = true;

      // Clean dashes when editing existing record
      if (initial.ielts_score === '—') initial.ielts_score = '';
      if (initial.pte_score === '—') initial.pte_score = '';
      if (initial.toefl_score === '—') initial.toefl_score = '';
      if (initial.duolingo_score === '—') initial.duolingo_score = '';
      if (initial.other === '—') initial.other = '';
      if (initial.english_language_requirements === '—') initial.english_language_requirements = '';
      if (initial.notes === '—') initial.notes = '';
    }

    // Clean up & guarantee merged fields for Documents table
    if (tableConfig?.id === 'required_docs') {
      if (initial.doc_name === undefined) initial.doc_name = '';
      if (initial.doc_category === undefined) initial.doc_category = 'academic';
      if (initial.applicable_degree_level === undefined) initial.applicable_degree_level = 'All Degree Levels';
      if (initial.programs_required === undefined) initial.programs_required = 'All Programs';
      if (initial.is_mandatory === undefined) initial.is_mandatory = true;
      if (initial.description === undefined) initial.description = '';
      if (initial.is_active === undefined) initial.is_active = true;
    }

    // Explicitly exclude institute fields if table is cities
    if (tableConfig?.id === 'cities') {
      delete initial.institute_id;
      delete initial.institute_name;
    }

    setFormData(initial);
    setError('');
  }, [recordData, sampleRow, tableConfig, isOpen]);

  // Load foreign key options from referenced Supabase tables
  useEffect(() => {
    if (!isOpen || !tableConfig) return;

    let isMounted = true;

    const loadForeignKeys = async () => {
      setLoadingFkOptions(true);
      const newFkOpts = {};

      const fkKeys = Object.keys(FOREIGN_KEY_MAP).filter(
        fkKey => fkKey !== tableConfig.primaryKey
      );

      for (const fkKey of fkKeys) {
        const fkConf = FOREIGN_KEY_MAP[fkKey];
        try {
          const res = await fetchTableRows(fkConf.table, { limit: 500 });
          if (res && res.data && isMounted) {
            newFkOpts[fkKey] = res.data.map(item => ({
              id: item[fkConf.pKey] !== undefined ? item[fkConf.pKey] : item.id,
              label: item[fkConf.labelKey] || item.name || item.title || `ID #${item[fkConf.pKey] || item.id}`,
              rawItem: item
            }));
          }
        } catch (err) {
          console.warn(`Could not load Foreign Key options for ${fkKey}:`, err);
        }
      }

      if (isMounted) {
        setFkOptions(newFkOpts);
        setLoadingFkOptions(false);
      }
    };

    loadForeignKeys();

    return () => {
      isMounted = false;
    };
  }, [isOpen, tableConfig]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFkChange = (fkKey, selectedId) => {
    const fkConf = FOREIGN_KEY_MAP[fkKey];
    const options = fkOptions[fkKey] || [];
    const matched = options.find(opt => String(opt.id) === String(selectedId));

    setFormData(prev => {
      const updated = { ...prev, [fkKey]: selectedId === '' ? '' : selectedId };
      // Automatically sync human-readable name field if present (e.g. institute_name, program_name)
      if (fkConf && fkConf.nameKeyInForm && matched && matched.rawItem) {
        const humanName = matched.rawItem[fkConf.labelKey];
        if (humanName && Object.prototype.hasOwnProperty.call(prev, fkConf.nameKeyInForm)) {
          updated[fkConf.nameKeyInForm] = humanName;
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-submit validation for required fields per table
    if (tableConfig?.id === 'campuses') {
      if (!formData.campus_name || !String(formData.campus_name).trim()) {
        setError('Please enter a Campus Name.');
        setLoading(false);
        return;
      }
      if (!formData.institute_id) {
        setError('Please select a University / Institute for this campus.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'institutes') {
      if (!formData.institute_name || !String(formData.institute_name).trim()) {
        setError('Please enter a University / Institute Name.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'programs') {
      if (!formData.program_name || !String(formData.program_name).trim()) {
        setError('Please enter a Program Name.');
        setLoading(false);
        return;
      }
      if (!formData.institute_id) {
        setError('Please select a University / Institute for this program.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'countries') {
      if (!formData.country_name || !String(formData.country_name).trim()) {
        setError('Please enter a Country Name.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'states') {
      if (!formData.state_name || !String(formData.state_name).trim()) {
        setError('Please enter a State / Province Name.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'cities') {
      if (!formData.city_name || !String(formData.city_name).trim()) {
        setError('Please enter a City Name.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'program_fees') {
      if (!formData.program_id) {
        setError('Please select a Degree Program / Course for this fee structure.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'scholarships') {
      if (!formData.scholarship_title || !String(formData.scholarship_title).trim()) {
        setError('Please enter a Scholarship Title.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'english_requirements') {
      if (!formData.institute_id && !formData.program_id) {
        setError('Please select a University / Institute or Degree Program.');
        setLoading(false);
        return;
      }
    } else if (tableConfig?.id === 'admission_pathways') {
      if (!formData.pathway_name || !String(formData.pathway_name).trim()) {
        setError('Please enter an Admission Pathway Name.');
        setLoading(false);
        return;
      }
      if (!formData.institute_id) {
        setError('Please select a University / Institute for this pathway.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'create') {
        const payload = { ...formData };
        // Remove primary key & timestamps from payload
        systemAutoKeys.forEach(k => delete payload[k]);
        if (tableConfig?.id === 'cities') {
          delete payload.institute_id;
          delete payload.institute_name;
        }

        // Clean any empty string '' in payload to null so Postgres ENUMs, UUIDs, and numbers receive NULL instead of invalid ""
        Object.keys(payload).forEach(k => {
          if (payload[k] === '') {
            payload[k] = null;
          }
        });

        await insertTableRow(tableConfig.id, payload);
      } else {
        const pKeyCol = tableConfig?.primaryKey || 'id';
        const pKeyVal = recordData ? (recordData[pKeyCol] !== undefined ? recordData[pKeyCol] : recordData.id) : null;
        if (pKeyVal === null || pKeyVal === undefined) {
          throw new Error(`Could not find primary key value (${pKeyCol}) for updating this record.`);
        }

        const payload = { ...formData };
        delete payload[pKeyCol];
        delete payload.id;
        delete payload.created_at;
        delete payload.updated_at;
        if (tableConfig?.id === 'cities') {
          delete payload.institute_id;
          delete payload.institute_name;
        }

        // Clean any empty string '' in payload to null so Postgres ENUMs, UUIDs, and numbers receive NULL instead of invalid ""
        Object.keys(payload).forEach(k => {
          if (payload[k] === '') {
            payload[k] = null;
          }
        });

        await updateTableRow(tableConfig.id, pKeyCol, pKeyVal, payload);
      }

      setLoading(false);
      onSaved();
      onClose();
    } catch (err) {
      console.error('Modal Save Error:', err);
      setError(formatUserFriendlyError(err));
      setLoading(false);
    }
  };

  // Generate custom, realistic transparent placeholder examples
  const getFieldPlaceholder = (key) => {
    const k = key.toLowerCase();
    if (k === 'campuses') return 'e.g. Main Campus, London Campus, West Campus';
    if (k === 'institute_location') return 'e.g. 27 King\'s College Circle / Main University Address';
    if (k === 'campus_location') return 'e.g. Branch Campus Address / Specific Campus Facility Location';
    if (k.includes('email')) return 'e.g. student@example.com';
    if (k.includes('phone') || k.includes('whatsapp')) return 'e.g. +44 7911 123456';
    if (k.includes('program_name') || k === 'program') return 'e.g. MSc Artificial Intelligence';
    if (k.includes('institute_name') || k === 'institute' || k.includes('organization_name')) return 'e.g. University of Oxford';
    if (k.includes('country_name') || k === 'country') return 'e.g. United Kingdom / Canada / USA';
    if (k.includes('city')) return 'e.g. London / Toronto / Melbourne';
    if (k.includes('state')) return 'e.g. California / Ontario / England / Bavaria';
    if (k.includes('address')) return 'e.g. Strand, London WC2R 2LS, UK';
    if (k.includes('office_timing') || k.includes('timing')) return 'e.g. Mon - Sat (9:00 AM - 6:00 PM)';
    if (k.includes('duration')) return 'e.g. 1 Year / 18 Months';
    if (k.includes('intakes')) return 'e.g. September, January';
    if (k.includes('tuition_fee')) return 'e.g. 15000';
    if (k.includes('deposit')) return 'e.g. 3000';
    if (k.includes('scholarship_name') || k.includes('scholarship_title')) return 'e.g. Merit Academic Excellence Scholarship';
    if (k.includes('coverage') || k.includes('percentage') || k.includes('ratio')) return 'e.g. 90';
    if (k.includes('marks_required_min') || k.includes('min_marks')) return 'e.g. 60% / GPA 2.5';
    if (k.includes('marks_required_max') || k.includes('max_marks')) return 'e.g. 85% / GPA 3.5';
    if (k.includes('ielts')) return 'e.g. 6.5';
    if (k.includes('toefl')) return 'e.g. 85';
    if (k.includes('pte')) return 'e.g. 58';
    if (k.includes('duolingo')) return 'e.g. 115';
    if (k === 'other') return 'e.g. Duolingo accepted with 105+, or MOI English certificate valid.';
    if (k.includes('english_language_requirement')) return 'e.g. IELTS 6.5 with no band less than 6.0';
    if (k === 'notes' || k === 'note') return 'e.g. Work experience waiver applicable for mature students.';
    if (k.includes('doc_name') || k === 'doc') return 'e.g. Academic Transcripts & Passport Copy';
    if (k.includes('pathway')) return 'e.g. International Foundation Year';
    if (k.includes('days')) return 'e.g. 14';
    if (k.includes('ranking')) return 'e.g. 100';
    if (k.includes('psw')) return 'e.g. 2 Years';
    if (k.includes('student_name')) return 'e.g. John Doe / Student Name';
    if (k.includes('snippet') || k.includes('message')) return 'e.g. Inquiring about Masters programs in UK...';

    const humanLabel = getHumanFieldName(key);
    return `e.g. Enter ${humanLabel}...`;
  };

  // Render smart input control tailored for non-technical users
  const renderSmartInput = (key, val) => {
    const humanLabel = getHumanFieldName(key);
    const placeholderText = getFieldPlaceholder(key);

    // 1. Foreign Key Dropdown Select
    if (FOREIGN_KEY_MAP[key] && key !== tableConfig?.primaryKey) {
      let options = fkOptions[key] || [];

      // Dependent cascading: Filter states by selected country
      if (key === 'state_id' && formData.country_id) {
        const filtered = options.filter(opt => opt.rawItem && String(opt.rawItem.country_id) === String(formData.country_id));
        if (filtered.length > 0) options = filtered;
      }

      // Dependent cascading: Filter cities by selected state or country
      if (key === 'city_id' && formData.state_id) {
        const filtered = options.filter(opt => opt.rawItem && String(opt.rawItem.state_id) === String(formData.state_id));
        if (filtered.length > 0) options = filtered;
      }

      // Dependent cascading: Filter programs by selected institute
      if (key === 'program_id' && formData.institute_id) {
        const filtered = options.filter(opt => opt.rawItem && String(opt.rawItem.institute_id) === String(formData.institute_id));
        if (filtered.length > 0) options = filtered;
      }

      // Dependent cascading: Filter campuses by selected institute
      if (key === 'campus_id' && formData.institute_id) {
        const filtered = options.filter(opt => opt.rawItem && String(opt.rawItem.institute_id) === String(formData.institute_id));
        if (filtered.length > 0) options = filtered;
      }

      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleFkChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="">-- Select {humanLabel} (Optional) --</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    // 2. Predefined Dropdown Selects
    if (key === 'role') {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : 'Admin'}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="Super Admin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="Counselor">Counselor / Staff</option>
          <option value="Viewer">Viewer (Read Only)</option>
        </select>
      );
    }

    if ((key === 'status' || key === 'is_active') && tableConfig?.id === 'users') {
      const currentVal = formData[key];
      const isBool = typeof currentVal === 'boolean';
      const selectVal = isBool ? (currentVal ? 'true' : 'false') : String(currentVal || 'active');

      return (
        <select
          value={selectVal}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'true' || v === 'false') {
              handleChange(key, v === 'true');
            } else {
              handleChange(key, v);
            }
          }}
          className="admin-select-input"
        >
          <option value={isBool ? 'true' : 'active'}>Active User</option>
          <option value={isBool ? 'false' : 'inactive'}>Inactive User</option>
        </select>
      );
    }

    if (key === 'doc_category') {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : 'academic'}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="academic">Academic (Transcripts, Degrees, Marksheets)</option>
          <option value="identity">Identity (Passport, National ID, Photographs)</option>
          <option value="language">Language Proficiency (IELTS, TOEFL, PTE, Duolingo)</option>
          <option value="financial">Financial (Bank Statement, Proof of Funds)</option>
          <option value="other">Other (SOP, CV, Recommendation Letters)</option>
        </select>
      );
    }

    if (key === 'applicable_degree_level') {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : 'All Degree Levels'}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="All Degree Levels">All Degree Levels (Bachelors, Masters, etc.)</option>
          <option value="Bachelors">Bachelors Only</option>
          <option value="Masters">Masters Only</option>
          <option value="PhD">PhD / Doctorate</option>
          <option value="Diploma">Diploma / Certifications</option>
          <option value="Foundation">Foundation / Pre-University</option>
        </select>
      );
    }

    if (key === 'programs_required') {
      const progOptions = fkOptions['program_id'] || [];
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : 'All Programs'}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="All Programs">All Programs (Universal / General Requirement)</option>
          {progOptions.map((opt) => (
            <option key={opt.id} value={opt.label}>
              {opt.label} {opt.rawItem?.institute_name ? `(${opt.rawItem.institute_name})` : ''}
            </option>
          ))}
        </select>
      );
    }

    if (key === 'degree_level') {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="">-- Select Degree Level (Optional) --</option>
          <option value="Bachelors">Bachelors</option>
          <option value="Masters">Masters</option>
          <option value="PhD">PhD</option>
          <option value="Diploma">Diploma</option>
          <option value="Foundation">Foundation</option>
        </select>
      );
    }

    if (key === 'institute_type') {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="">-- Select Institute Type (Optional) --</option>
          <option value="private">Private University</option>
          <option value="public">Public / State University</option>
        </select>
      );
    }

    if (key === 'scholarship_type') {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="">-- Select Scholarship Type (Optional) --</option>
          <option value="Merit-Based">Merit-Based</option>
          <option value="Need-Based">Need-Based / Financial Aid</option>
          <option value="Full Tuition Waiver">Full Tuition Waiver (100%)</option>
          <option value="Partial Tuition Waiver">Partial Tuition Waiver</option>
          <option value="Bursary">Academic Bursary / Grant</option>
          <option value="Research Assistantship">Research / Teaching Assistantship</option>
        </select>
      );
    }

    if (key === 'pathway_type') {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="">-- Select Pathway Type (Optional) --</option>
          <option value="Foundation">Foundation / International Foundation</option>
          <option value="Diploma">Diploma / International Year One</option>
          <option value="Pre-Masters">Pre-Master's Pathway</option>
          <option value="Undergraduate">Undergraduate Pathway</option>
          <option value="Postgraduate">Postgraduate Pathway</option>
          <option value="English">Pre-Sessional English</option>
          <option value="Direct">Direct Entry</option>
        </select>
      );
    }

    if (key.includes('currency')) {
      return (
        <select
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value)}
          className="admin-select-input"
        >
          <option value="">-- Select Currency (Optional / None) --</option>
          <option value="EUR">EUR (€) - Euro</option>
          <option value="GBP">GBP (£) - British Pound</option>
          <option value="USD">USD ($) - US Dollar</option>
          <option value="AUD">AUD (A$) - Australian Dollar</option>
          <option value="CAD">CAD (C$) - Canadian Dollar</option>
          <option value="NZD">NZD ($) - New Zealand Dollar</option>
          <option value="AED">AED - UAE Dirham</option>
          <option value="PKR">PKR (Rs) - Pakistani Rupee</option>
        </select>
      );
    }

    // 3. Text fields (Durations, Intakes, PSW, etc.) - ALWAYS render as TEXT input
    if (key.includes('duration') || key.includes('psw') || key.includes('intake') || key === 'campuses') {
      return (
        <input
          type="text"
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholderText}
          className="admin-text-input"
        />
      );
    }

    // 4. Boolean Switch Toggles
    if (typeof val === 'boolean' || key.includes('active') || key.includes('available') || key.includes('spouse') || key.includes('mandatory')) {
      const isChecked = !!formData[key];
      return (
        <button
          type="button"
          className={`admin-toggle-btn ${isChecked ? 'active' : ''}`}
          onClick={() => handleChange(key, !isChecked)}
        >
          <span className="toggle-slider" />
          <span className="toggle-text">{isChecked ? 'YES (Active)' : 'NO (Inactive)'}</span>
        </button>
      );
    }

    // 5. Multi-line Textareas for requirements, descriptions, address
    if (key.includes('requirements') || key.includes('description') || key.includes('content') || key.includes('address') || key.includes('snippet') || key.includes('instructions')) {
      return (
        <textarea
          rows={3}
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholderText}
          className="admin-textarea-input"
        />
      );
    }

    // 6. Numeric fields (Fees, Scores, Days, Percentages, Rankings, Ratios)
    if (key.includes('fee') || key.includes('deposit') || key.includes('score') || key.includes('ranking') || key.includes('days') || key.includes('ratio')) {
      return (
        <input
          type="number"
          step="any"
          value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
          onChange={(e) => handleChange(key, e.target.value === '' ? '' : parseFloat(e.target.value))}
          placeholder={placeholderText}
          className="admin-number-input"
        />
      );
    }

    // 7. Default text input
    return (
      <input
        type="text"
        value={formData[key] !== undefined && formData[key] !== null ? formData[key] : ''}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={placeholderText}
        className="admin-text-input"
      />
    );
  };

  // Visible fields in form (exclude primary key & timestamps)
  const visibleFields = Object.keys(formData).filter(key => {
    if (tableConfig?.id === 'cities' && (key === 'institute_id' || key === 'institute_name')) return false;
    if (mode === 'create' && (key === tableConfig?.primaryKey || key === 'id' || key === 'created_at' || key === 'updated_at')) return false;
    if (mode === 'edit' && (key === 'created_at' || key === 'updated_at' || key === tableConfig?.primaryKey)) return false;
    return true;
  });

  // Intelligently sort visible fields into symmetric, logical 2-column grid layout
  const getFieldCategoryRank = (key) => {
    if (tableConfig?.id === 'programs') {
      if (key === 'institute_id') return 1;
      if (key === 'campus_id') return 2;
      if (key === 'program_name') return 3;
      if (key === 'degree_level') return 4;
      if (key === 'degree_duration') return 5;
      if (key === 'degree_intakes') return 6;
      if (key === 'tuition_fee') return 7;
      if (key === 'application_fee') return 8;
      if (key === 'initial_deposit') return 9;
      if (key === 'currency') return 10;
      if (key === 'scholarship_title') return 11;
      if (key === 'scholarship_type') return 12;
      if (key === 'scholarship_min') return 13;
      if (key === 'scholarship_max') return 14;
      if (key === 'scholarship_description' || key === 'description') return 15;
      if (key === 'english_language_requirement') return 16;
      if (key === 'pathway_foundation') return 17;
      if (key === 'scholarship_available') return 18;
      if (key === 'is_active' || key === 'active') return 19;
      return 20;
    }
    if (tableConfig?.id === 'institutes') {
      if (key === 'institute_name') return 1;
      if (key === 'country_id') return 2;
      if (key === 'state_id') return 3;
      if (key === 'city_id') return 4;
      if (key === 'institute_location') return 5;
      if (key === 'campuses') return 6;
      if (key === 'campus_location') return 7;
      if (key === 'institute_type') return 8;
      if (key === 'website') return 9;
      if (key === 'university_ranking_int') return 10;
      if (key === 'university_ranking_local') return 11;
      if (key === 'admission_processing_days') return 12;
      if (key === 'admission_intakes') return 13;
      if (key === 'english_language_requirement') return 14;
      if (key === 'special_instructions') return 15;
      if (key === 'is_active' || key === 'active') return 16;
      return 17;
    }
    if (tableConfig?.id === 'admission_pathways') {
      if (key === 'institute_id') return 1;
      if (key === 'campus_id') return 2;
      if (key === 'program_id') return 3;
      if (key === 'pathway_name') return 4;
      if (key === 'pathway_type') return 5;
      if (key === 'marks_required_min') return 6;
      if (key === 'marks_required_max') return 7;
      if (key === 'ielts_score') return 8;
      if (key === 'pte_score') return 9;
      if (key === 'toefl_score') return 10;
      if (key === 'duolingo_score') return 11;
      if (key === 'other') return 12;
      if (key === 'english_language_requirements' || key === 'english_language_requirement') return 13;
      if (key === 'notes' || key === 'note') return 14;
      if (key === 'is_active' || key === 'active') return 15;
      return 16;
    }
    if (tableConfig?.id === 'required_docs') {
      if (key === 'doc_name') return 1;
      if (key === 'doc_category') return 2;
      if (key === 'applicable_degree_level') return 3;
      if (key === 'programs_required') return 4;
      if (key === 'description') return 5;
      if (key === 'is_mandatory') return 6;
      if (key === 'is_active' || key === 'active') return 7;
      return 8;
    }
    if (key.includes('name') || key.includes('title') || key.includes('organization')) return 1;
    if (key === 'country_id' || key === 'city_id' || key === 'state_id') return 2;
    if (FOREIGN_KEY_MAP[key] || key.includes('type') || key.includes('level') || key.includes('category') || key === 'currency' || key === 'role') return 3;
    if (key.includes('fee') || key.includes('deposit') || key.includes('score') || key.includes('ranking') || key.includes('days') || key.includes('ratio') || key.includes('min') || key.includes('max') || key.includes('duration') || key.includes('intakes') || key.includes('psw') || key === 'other') return 4;
    if (key.includes('requirements') || key.includes('description') || key.includes('content') || key.includes('address') || key.includes('snippet') || key.includes('timing') || key.includes('instructions')) return 5;
    if (key.includes('active') || key.includes('available') || key.includes('spouse') || key.includes('mandatory') || key.includes('foundation')) return 6;
    return 4;
  };

  const sortedVisibleFields = [...visibleFields].sort((a, b) => {
    const rankA = getFieldCategoryRank(a);
    const rankB = getFieldCategoryRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return 0;
  });

  return (
    <div className="admin-modal-overlay">
      <div className="admin-record-modal" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="modal-icon-badge" style={{ background: '#009E99', color: '#ffffff' }}>
              {mode === 'create' ? <Plus size={20} /> : <Save size={20} />}
            </div>
            <div>
              <h3 className="text-gray-800 font-bold text-base m-0">{mode === 'create' ? `Add New ${getSingularLabel(tableConfig)}` : `Edit ${getSingularLabel(tableConfig)}`}</h3>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="admin-auth-error" style={{ margin: '1rem 1.5rem 0' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-fields-grid">
            {sortedVisibleFields.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: 'span 2' }}>
                No editable fields found for this record.
              </p>
            ) : (
              sortedVisibleFields.map((key) => {
                const humanLabel = getHumanFieldName(key);
                const isFullWidth = key.includes('requirements') || key.includes('description') || key.includes('content') || key.includes('address') || key.includes('snippet');

                return (
                  <div key={key} className={`admin-form-group ${isFullWidth ? 'full-width' : ''}`}>
                    <label className="field-label">
                      {humanLabel}
                    </label>
                    {renderSmartInput(key, formData[key])}
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn-primary" 
              disabled={loading}
              style={{ background: '#009E99', borderColor: '#008783', color: '#ffffff' }}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" /> Saving...
                </>
              ) : mode === 'create' ? (
                <>
                  <Plus size={16} /> Save Record
                </>
              ) : (
                <>
                  <Check size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
