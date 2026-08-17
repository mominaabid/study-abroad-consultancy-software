import React, { useState, useEffect } from 'react';
import { X, Save, Plus, AlertCircle, Check } from 'lucide-react';
import { insertTableRow, updateTableRow, fetchTableRows, getHumanFieldName, formatUserFriendlyError } from '../../services/adminSupabaseService';

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
    institute_type: 'private',
    institute_location: '',
    website: '',
    university_ranking_int: '',
    university_ranking_local: '',
    is_active: true
  },
  campuses: {
    campus_name: '',
    institute_id: '',
    city: '',
    address: ''
  },
  programs: {
    program_name: '',
    institute_id: '',
    campus_id: '',
    degree_level: 'Bachelors',
    degree_duration: '',
    degree_intakes: '',
    is_active: true
  },
  program_fees: {
    program_id: '',
    tuition_fee: '',
    initial_deposit: '',
    application_fee: '',
    fee_currency: ''
  },
  scholarships: {
    scholarship_title: '',
    institute_id: '',
    program_id: '',
    coverage_percentage: '',
    description: '',
    scholarship_available: true
  },
  program_required_documents: {
    program_id: '',
    doc_id: '',
    is_mandatory: true
  },
  required_docs: {
    doc_name: '',
    doc_category: 'academic',
    description: '',
    is_mandatory: true
  },
  english_requirements: {
    program_id: '',
    ielts_score: '',
    toefl_score: '',
    pte_score: '',
    duolingo_score: ''
  },
  admission_pathways: {
    program_id: '',
    pathway_name: '',
    pathway_type: '',
    description: '',
    admission_processing_days: ''
  },
  countries: {
    country_name: '',
    visa_approval_ratio: '',
    psw_duration: '',
    spouse_dependants: true
  },
  states: {
    country_id: '',
    state_name: ''
  },
  cities: {
    state_id: '',
    city_name: ''
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

    let initial = {};
    if (recordData) {
      initial = { ...recordData };
    } else if (sampleRow) {
      const empty = {};
      Object.keys(sampleRow).forEach(key => {
        if (key === tableConfig?.primaryKey || key === 'id' || key === 'created_at' || key === 'updated_at') {
          empty[key] = '';
        } else if (typeof sampleRow[key] === 'boolean') {
          empty[key] = true;
        } else if (typeof sampleRow[key] === 'number') {
          empty[key] = 0;
        } else {
          empty[key] = '';
        }
      });
      initial = empty;
    } else if (tableConfig && DEFAULT_TABLE_SCHEMAS[tableConfig.id]) {
      initial = { ...DEFAULT_TABLE_SCHEMAS[tableConfig.id] };
    } else {
      initial = { name: '', description: '' };
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
          const res = await fetchTableRows(fkConf.table, { limit: 100 });
          if (res && res.data && isMounted) {
            newFkOpts[fkKey] = res.data.map(item => ({
              id: item[fkConf.pKey] || item.id,
              label: item[fkConf.labelKey] || item.name || `ID #${item[fkConf.pKey] || item.id}`,
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
    if (k.includes('scholarship_name')) return 'e.g. Merit Academic Excellence Scholarship';
    if (k.includes('coverage') || k.includes('percentage') || k.includes('ratio')) return 'e.g. 90';
    if (k.includes('ielts')) return 'e.g. 6.5';
    if (k.includes('toefl')) return 'e.g. 85';
    if (k.includes('pte')) return 'e.g. 58';
    if (k.includes('duolingo')) return 'e.g. 115';
    if (k.includes('doc_name') || k.includes('doc')) return 'e.g. Academic Transcripts & Passport Copy';
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
      const options = fkOptions[key] || [];

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
    if (key.includes('duration') || key.includes('psw') || key.includes('intake')) {
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
    if (key.includes('requirements') || key.includes('description') || key.includes('content') || key.includes('address') || key.includes('snippet')) {
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

    // 6. Default text input
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

  return (
    <div className="admin-modal-overlay">
      <div className="admin-record-modal" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <div className="modal-icon-badge">
              {mode === 'create' ? <Plus size={20} /> : <Save size={20} />}
            </div>
            <div>
              <h3>{mode === 'create' ? `Add New ${tableConfig?.label || 'Record'}` : `Edit ${tableConfig?.label || 'Record'}`}</h3>
              <p className="modal-subtitle">Simplified record editor with smart foreign key linkage</p>
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
            {visibleFields.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', gridColumn: 'span 2' }}>
                No editable fields found for this record.
              </p>
            ) : (
              visibleFields.map((key) => {
                const humanLabel = getHumanFieldName(key);
                const isFullWidth = key.includes('requirements') || key.includes('description') || key.includes('content') || key.includes('address');

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
            <button type="submit" className="admin-btn-primary" disabled={loading}>
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
