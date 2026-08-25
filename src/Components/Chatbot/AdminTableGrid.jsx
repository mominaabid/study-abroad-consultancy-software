import React from 'react';
import { Edit2, Trash2, Copy, Check, FileText, MessageSquare, Filter, X, RotateCcw } from 'lucide-react';
import { getHumanFieldName, DEFAULT_TABLE_SCHEMAS } from '../../services/adminSupabaseService';
import { Pagination } from '../Pagination';
import { ShowDataNumber } from '../ShowDataNumber';

export default function AdminTableGrid({
  tableConfig,
  rows = [],
  totalCount = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  onEditRecord,
  onDeleteRecord,
  onViewTranscript,
  readLeadIds = [],
  loading = false,
  searchQuery = ''
}) {
  const [copiedId, setCopiedId] = React.useState(null);
  const [selectedFilters, setSelectedFilters] = React.useState({});

  // Reset filters when switching tables
  React.useEffect(() => {
    setSelectedFilters({});
  }, [tableConfig?.id]);

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      if (!value || value === 'ALL') {
        delete updated[filterKey];
      } else {
        updated[filterKey] = value;
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
  };

  // Build dynamic dropdown filter configurations per table
  const tableFilterDefs = React.useMemo(() => {
    const tableId = tableConfig?.id;
    const defs = [];

    const getUniqueValues = (field) => {
      const vals = new Set();
      (rows || []).forEach(r => {
        if (r && r[field] !== undefined && r[field] !== null && r[field] !== '' && r[field] !== '—') {
          vals.add(String(r[field]));
        }
      });
      return Array.from(vals).sort();
    };

    if (tableId === 'countries') {
      const currencies = getUniqueValues('currency');
      if (currencies.length > 0) {
        defs.push({
          key: 'currency',
          label: 'Currency',
          options: [{ value: 'ALL', label: 'All Currencies' }, ...currencies.map(c => ({ value: c, label: c }))]
        });
      }
      defs.push({
        key: 'spouse_dependants',
        label: 'Spouse Allowed',
        options: [
          { value: 'ALL', label: 'All (Spouse)' },
          { value: 'allowed', label: 'Spouse Allowed' },
          { value: 'not_allowed', label: 'Not Allowed' }
        ]
      });
    }

    if (tableId === 'states') {
      const countries = getUniqueValues('country_name');
      if (countries.length > 0) {
        defs.push({
          key: 'country_name',
          label: 'Country',
          options: [{ value: 'ALL', label: 'All Countries' }, ...countries.map(c => ({ value: c, label: c }))]
        });
      }
    }

    if (tableId === 'cities') {
      const countries = getUniqueValues('country_name');
      if (countries.length > 0) {
        defs.push({
          key: 'country_name',
          label: 'Country',
          options: [{ value: 'ALL', label: 'All Countries' }, ...countries.map(c => ({ value: c, label: c }))]
        });
      }
      const states = getUniqueValues('state_name');
      if (states.length > 0) {
        defs.push({
          key: 'state_name',
          label: 'State',
          options: [{ value: 'ALL', label: 'All States' }, ...states.map(s => ({ value: s, label: s }))]
        });
      }
    }

    if (tableId === 'institutes') {
      const countries = getUniqueValues('country_name');
      if (countries.length > 0) {
        defs.push({
          key: 'country_name',
          label: 'Country',
          options: [{ value: 'ALL', label: 'All Countries' }, ...countries.map(c => ({ value: c, label: c }))]
        });
      }
      const states = getUniqueValues('state_name');
      if (states.length > 0) {
        defs.push({
          key: 'state_name',
          label: 'State',
          options: [{ value: 'ALL', label: 'All States' }, ...states.map(s => ({ value: s, label: s }))]
        });
      }
      const cities = getUniqueValues('city_name');
      if (cities.length > 0) {
        defs.push({
          key: 'city_name',
          label: 'City',
          options: [{ value: 'ALL', label: 'All Cities' }, ...cities.map(c => ({ value: c, label: c }))]
        });
      }
      const types = getUniqueValues('institute_type');
      if (types.length > 0) {
        defs.push({
          key: 'institute_type',
          label: 'Type',
          options: [{ value: 'ALL', label: 'All Types' }, ...types.map(t => ({ value: t, label: t === 'private' ? 'Private' : (t === 'public' ? 'Public' : t) }))]
        });
      }
    }

    if (tableId === 'campuses') {
      const institutes = getUniqueValues('institute_name');
      if (institutes.length > 0) {
        defs.push({
          key: 'institute_name',
          label: 'Institute',
          options: [{ value: 'ALL', label: 'All Institutes' }, ...institutes.map(i => ({ value: i, label: i }))]
        });
      }
      const cities = getUniqueValues('city_name');
      if (cities.length > 0) {
        defs.push({
          key: 'city_name',
          label: 'City',
          options: [{ value: 'ALL', label: 'All Cities' }, ...cities.map(c => ({ value: c, label: c }))]
        });
      }
    }

    if (tableId === 'programs') {
      const institutes = getUniqueValues('institute_name');
      if (institutes.length > 0) {
        defs.push({
          key: 'institute_name',
          label: 'Institute',
          options: [{ value: 'ALL', label: 'All Institutes' }, ...institutes.map(i => ({ value: i, label: i }))]
        });
      }
      const campuses = getUniqueValues('campus_name');
      if (campuses.length > 0) {
        defs.push({
          key: 'campus_name',
          label: 'Campus',
          options: [{ value: 'ALL', label: 'All Campuses' }, ...campuses.map(c => ({ value: c, label: c }))]
        });
      }
      const levels = getUniqueValues('degree_level');
      if (levels.length > 0) {
        defs.push({
          key: 'degree_level',
          label: 'Level',
          options: [{ value: 'ALL', label: 'All Levels' }, ...levels.map(l => ({ value: l, label: l }))]
        });
      }
      const currencies = getUniqueValues('currency');
      if (currencies.length > 0) {
        defs.push({
          key: 'currency',
          label: 'Currency',
          options: [{ value: 'ALL', label: 'All Currencies' }, ...currencies.map(c => ({ value: c, label: c }))]
        });
      }
      defs.push({
        key: 'pathway_foundation',
        label: 'Foundation',
        options: [
          { value: 'ALL', label: 'All Foundation' },
          { value: 'available', label: 'Foundation Available' },
          { value: 'direct_only', label: 'Direct Entry Only' }
        ]
      });
      defs.push({
        key: 'scholarship_available',
        label: 'Scholarship',
        options: [
          { value: 'ALL', label: 'All Scholarships' },
          { value: 'available', label: 'Scholarship Available' },
          { value: 'none', label: 'No Scholarship' }
        ]
      });
    }

    if (tableId === 'program_fees') {
      const progs = getUniqueValues('program_name');
      if (progs.length > 0) {
        defs.push({
          key: 'program_name',
          label: 'Program',
          options: [{ value: 'ALL', label: 'All Programs' }, ...progs.map(p => ({ value: p, label: p }))]
        });
      }
      const currencies = getUniqueValues('currency');
      if (currencies.length > 0) {
        defs.push({
          key: 'currency',
          label: 'Currency',
          options: [{ value: 'ALL', label: 'All Currencies' }, ...currencies.map(c => ({ value: c, label: c }))]
        });
      }
    }

    if (tableId === 'scholarships') {
      const institutes = getUniqueValues('institute_name');
      if (institutes.length > 0) {
        defs.push({
          key: 'institute_name',
          label: 'Institute',
          options: [{ value: 'ALL', label: 'All Institutes' }, ...institutes.map(i => ({ value: i, label: i }))]
        });
      }
      const progs = getUniqueValues('program_name');
      if (progs.length > 0) {
        defs.push({
          key: 'program_name',
          label: 'Program',
          options: [{ value: 'ALL', label: 'All Programs' }, ...progs.map(p => ({ value: p, label: p }))]
        });
      }
      const types = getUniqueValues('scholarship_type');
      if (types.length > 0) {
        defs.push({
          key: 'scholarship_type',
          label: 'Sch. Type',
          options: [{ value: 'ALL', label: 'All Types' }, ...types.map(t => ({ value: t, label: t }))]
        });
      }
    }

    if (tableId === 'admission_pathways') {
      const institutes = getUniqueValues('institute_name');
      if (institutes.length > 0) {
        defs.push({
          key: 'institute_name',
          label: 'Institute',
          options: [{ value: 'ALL', label: 'All Institutes' }, ...institutes.map(i => ({ value: i, label: i }))]
        });
      }
      const campuses = getUniqueValues('campus_name');
      if (campuses.length > 0) {
        defs.push({
          key: 'campus_name',
          label: 'Campus',
          options: [{ value: 'ALL', label: 'All Campuses' }, ...campuses.map(c => ({ value: c, label: c }))]
        });
      }
      const progs = getUniqueValues('program_name');
      if (progs.length > 0) {
        defs.push({
          key: 'program_name',
          label: 'Program',
          options: [{ value: 'ALL', label: 'All Programs' }, ...progs.map(p => ({ value: p, label: p }))]
        });
      }
      const types = getUniqueValues('pathway_type');
      if (types.length > 0) {
        defs.push({
          key: 'pathway_type',
          label: 'Type',
          options: [{ value: 'ALL', label: 'All Types' }, ...types.map(t => ({ value: t, label: t }))]
        });
      }
    }

    if (tableId === 'required_docs') {
      const categories = getUniqueValues('doc_category');
      if (categories.length > 0) {
        defs.push({
          key: 'doc_category',
          label: 'Category',
          options: [{ value: 'ALL', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))]
        });
      }
      const levels = getUniqueValues('applicable_degree_level');
      if (levels.length > 0) {
        defs.push({
          key: 'applicable_degree_level',
          label: 'Degree Level',
          options: [{ value: 'ALL', label: 'All Degree Levels' }, ...levels.map(l => ({ value: l, label: l }))]
        });
      }
      const progs = getUniqueValues('programs_required');
      if (progs.length > 0) {
        defs.push({
          key: 'programs_required',
          label: 'Program',
          options: [{ value: 'ALL', label: 'All Programs' }, ...progs.map(p => ({ value: p, label: p }))]
        });
      }
      defs.push({
        key: 'is_mandatory',
        label: 'Mandatory',
        options: [
          { value: 'ALL', label: 'All Documents' },
          { value: 'mandatory', label: 'Mandatory Only' },
          { value: 'optional', label: 'Optional Only' }
        ]
      });
    }

    if (tableId === 'english_requirements') {
      const institutes = getUniqueValues('institute_name');
      if (institutes.length > 0) {
        defs.push({
          key: 'institute_name',
          label: 'Institute',
          options: [{ value: 'ALL', label: 'All Institutes' }, ...institutes.map(i => ({ value: i, label: i }))]
        });
      }
      const progs = getUniqueValues('program_name');
      if (progs.length > 0) {
        defs.push({
          key: 'program_name',
          label: 'Program',
          options: [{ value: 'ALL', label: 'All Programs' }, ...progs.map(p => ({ value: p, label: p }))]
        });
      }
    }

    if (tableId === 'program_required_documents') {
      const progs = getUniqueValues('program_name');
      if (progs.length > 0) {
        defs.push({
          key: 'program_name',
          label: 'Program',
          options: [{ value: 'ALL', label: 'All Programs' }, ...progs.map(p => ({ value: p, label: p }))]
        });
      }
      const docs = getUniqueValues('doc_name');
      if (docs.length > 0) {
        defs.push({
          key: 'doc_name',
          label: 'Document',
          options: [{ value: 'ALL', label: 'All Documents' }, ...docs.map(d => ({ value: d, label: d }))]
        });
      }
      defs.push({
        key: 'is_mandatory',
        label: 'Mandatory',
        options: [
          { value: 'ALL', label: 'All Requirements' },
          { value: 'mandatory', label: 'Mandatory Only' },
          { value: 'optional', label: 'Optional Only' }
        ]
      });
    }

    if (tableId === 'student_leads') {
      const statuses = getUniqueValues('status');
      if (statuses.length > 0) {
        defs.push({
          key: 'status',
          label: 'Status',
          options: [{ value: 'ALL', label: 'All Statuses' }, ...statuses.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]
        });
      }
      const countries = getUniqueValues('interested_country');
      if (countries.length > 0) {
        defs.push({
          key: 'interested_country',
          label: 'Target Country',
          options: [{ value: 'ALL', label: 'All Countries' }, ...countries.map(c => ({ value: c, label: c }))]
        });
      }
      const institutes = getUniqueValues('interested_institute');
      if (institutes.length > 0) {
        defs.push({
          key: 'interested_institute',
          label: 'Target Institute',
          options: [{ value: 'ALL', label: 'All Institutes' }, ...institutes.map(i => ({ value: i, label: i }))]
        });
      }
      const levels = getUniqueValues('degree_level');
      if (levels.length > 0) {
        defs.push({
          key: 'degree_level',
          label: 'Level',
          options: [{ value: 'ALL', label: 'All Levels' }, ...levels.map(l => ({ value: l, label: l }))]
        });
      }
    }

    if (tableId === 'business_info') {
      const countries = getUniqueValues('country');
      if (countries.length > 0) {
        defs.push({
          key: 'country',
          label: 'Country',
          options: [{ value: 'ALL', label: 'All Countries' }, ...countries.map(c => ({ value: c, label: c }))]
        });
      }
      const cities = getUniqueValues('city');
      if (cities.length > 0) {
        defs.push({
          key: 'city',
          label: 'City',
          options: [{ value: 'ALL', label: 'All Cities' }, ...cities.map(c => ({ value: c, label: c }))]
        });
      }
    }

    if (tableId === 'users') {
      const roles = getUniqueValues('role');
      if (roles.length > 0) {
        defs.push({
          key: 'role',
          label: 'Role',
          options: [{ value: 'ALL', label: 'All Roles' }, ...roles.map(r => ({ value: r, label: r }))]
        });
      }
    }

    if (tableId === 'v_chatbot_bot_details') {
      const countries = getUniqueValues('country_name');
      if (countries.length > 0) {
        defs.push({
          key: 'country_name',
          label: 'Country',
          options: [{ value: 'ALL', label: 'All Countries' }, ...countries.map(c => ({ value: c, label: c }))]
        });
      }
      const institutes = getUniqueValues('institute_name');
      if (institutes.length > 0) {
        defs.push({
          key: 'institute_name',
          label: 'Institute',
          options: [{ value: 'ALL', label: 'All Institutes' }, ...institutes.map(i => ({ value: i, label: i }))]
        });
      }
      const levels = getUniqueValues('degree_level');
      if (levels.length > 0) {
        defs.push({
          key: 'degree_level',
          label: 'Level',
          options: [{ value: 'ALL', label: 'All Levels' }, ...levels.map(l => ({ value: l, label: l }))]
        });
      }
    }

    // Active status filter for any table with an active status column
    const hasActiveField = (rows || []).some(r => r && (r.is_active !== undefined || r.active !== undefined || r.program_active !== undefined || r.institute_active !== undefined));
    if (hasActiveField) {
      defs.push({
        key: 'is_active',
        label: 'Active Status',
        options: [
          { value: 'ALL', label: 'All Status' },
          { value: 'active', label: 'Active Only' },
          { value: 'inactive', label: 'Inactive Only' }
        ]
      });
    }

    return defs;
  }, [tableConfig, rows]);

  // Client-side real-time multi-condition filter across dropdowns + search query
  const filteredRows = React.useMemo(() => {
    let result = rows || [];

    const activeFilterKeys = Object.keys(selectedFilters);
    if (activeFilterKeys.length > 0) {
      result = result.filter(row => {
        return activeFilterKeys.every(filterKey => {
          const filterVal = selectedFilters[filterKey];
          if (!filterVal || filterVal === 'ALL') return true;

          // Boolean Active Status check
          if (filterKey === 'is_active') {
            const isRowActive = row.is_active === true || row.is_active === 1 || row.is_active === 'true' || row.is_active === '1' || String(row.status || '').toLowerCase() === 'active';
            return filterVal === 'active' ? isRowActive : !isRowActive;
          }

          // Spouse Allowed check
          if (filterKey === 'spouse_dependants') {
            const isAllowed = row.spouse_dependants === true || row.spouse_dependants === 1 || row.spouse_dependants === 'true' || String(row.spouse_dependants || '').toLowerCase() === 'allowed';
            return filterVal === 'allowed' ? isAllowed : !isAllowed;
          }

          // Mandatory document check
          if (filterKey === 'is_mandatory') {
            const isMandatory = row.is_mandatory === true || row.is_mandatory === 1 || row.is_mandatory === 'true';
            return filterVal === 'mandatory' ? isMandatory : !isMandatory;
          }

          // Foundation / Pathway check
          if (filterKey === 'pathway_foundation') {
            const hasFoundation = row.pathway_foundation === true || row.pathway_foundation === 1 || row.pathway_foundation === 'true';
            return filterVal === 'available' ? hasFoundation : !hasFoundation;
          }

          // Scholarship check
          if (filterKey === 'scholarship_available') {
            const hasSch = row.scholarship_available === true || row.scholarship_available === 1 || row.scholarship_available === 'true';
            return filterVal === 'available' ? hasSch : !hasSch;
          }

          // Comma-separated list matching for campuses or programs
          if (filterKey === 'campuses') {
            const rowVal = String(row.campuses || row.campus_name || '').toLowerCase();
            return rowVal.includes(String(filterVal).toLowerCase());
          }
          if (filterKey === 'programs_required') {
            const rowVal = String(row.programs_required || row.program_name || '').toLowerCase();
            return rowVal.includes(String(filterVal).toLowerCase());
          }

          // Foreign Key or Category exact/case-insensitive match
          const rowVal = String(row[filterKey] !== undefined ? row[filterKey] : '').toLowerCase();
          return rowVal === String(filterVal).toLowerCase();
        });
      });
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(row => 
        Object.values(row || {}).some(val => String(val || '').toLowerCase().includes(q))
      );
    }

    return result;
  }, [rows, selectedFilters, searchQuery]);

  const pageSize = Math.max(1, Math.round(totalCount / (totalPages || 1))) || 12;
  const displayStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const displayEnd = Math.min(page * pageSize, totalCount);

  // Detect columns from first row OR fallback to DEFAULT_TABLE_SCHEMAS so headers ALWAYS show even when 0 records
  const defaultSchema = (tableConfig && DEFAULT_TABLE_SCHEMAS[tableConfig.id]) || {};
  const sampleDataKeys = (filteredRows && filteredRows.length > 0 && Object.keys(filteredRows[0] || {}).length > 0)
    ? Object.keys(filteredRows[0] || {})
    : (rows && rows.length > 0 && Object.keys(rows[0] || {}).length > 0)
      ? Object.keys(rows[0] || {})
      : Object.keys(defaultSchema);

  const primaryKey = tableConfig?.primaryKey || 'id';

  // Filter out 'id', '*_id', 'created_at' (allowed for student_leads, users, chat_sessions), 'updated_at', and IP / device info fields from visible display columns
  const visibleColumns = sampleDataKeys.filter(col => 
    col !== 'id' && 
    !col.endsWith('_id') && 
    (col !== 'created_at' || tableConfig?.id === 'student_leads' || tableConfig?.id === 'users' || tableConfig?.id === 'chat_sessions' || tableConfig?.id === 'chat_messages') && 
    col !== 'updated_at' &&
    col !== 'user_ip' &&
    col !== 'ip_address' &&
    col !== 'ip' &&
    col !== 'user_agent' &&
    col !== 'device_info' &&
    col !== 'user_device'
  );
  // Fallback to sampleDataKeys if all columns happen to be IDs
  const rawColumns = visibleColumns.length > 0 ? visibleColumns : (sampleDataKeys.length > 0 ? sampleDataKeys : ['name']);

  // Shift active status columns to the end (right before Actions column)
  const isActiveCol = (col) => col === 'is_active' || col === 'active' || col === 'program_active' || col === 'institute_active';
  const nonActiveCols = rawColumns.filter(col => !isActiveCol(col));
  const activeCols = rawColumns.filter(col => isActiveCol(col));

  // Sort columns in intuitive logical hierarchy (e.g. for cities: Country -> State -> City Name)
  const getColSortRank = (col) => {
    if (tableConfig?.id === 'student_leads') {
      if (col === 'student_name' || col === 'name') return 1;
      if (col === 'phone_number' || col.includes('phone')) return 2;
      if (col === 'email') return 3;
      if (col === 'interested_country' || col.includes('country')) return 4;
      if (col === 'interested_institute' || col.includes('institute')) return 5;
      if (col === 'interested_program' || col.includes('program')) return 6;
      if (col === 'degree_level' || col.includes('level')) return 7;
      if (col === 'lead_source' || col.includes('source')) return 8;
      if (col === 'last_message_snippet' || col.includes('message')) return 9;
      if (col === 'created_at' || col.includes('date') || col.includes('time')) return 10;
      if (col === 'status') return 11;
      return 12;
    }
    if (tableConfig?.id === 'institutes') {
      if (col === 'institute_name' || col === 'name') return 1;
      if (col === 'country_name' || col.includes('country')) return 2;
      if (col === 'state_name' || col.includes('state')) return 3;
      if (col === 'city_name' || col.includes('city')) return 4;
      if (col === 'institute_location') return 5;
      if (col === 'campuses') return 6;
      if (col === 'campus_location') return 7;
      if (col.includes('type')) return 8;
      if (col.includes('website')) return 9;
      if (col === 'university_ranking_int') return 10;
      if (col === 'university_ranking_local') return 11;
      if (col.includes('days')) return 12;
      if (col.includes('intakes')) return 13;
      if (col.includes('english')) return 14;
      if (col.includes('instructions')) return 15;
      return 16;
    }
    if (tableConfig?.id === 'programs') {
      if (col === 'institute_name' || col.includes('institute')) return 1;
      if (col === 'campus_name' || col.includes('campus')) return 2;
      if (col === 'program_name' || col === 'name') return 3;
      if (col.includes('level')) return 4;
      if (col.includes('duration')) return 5;
      if (col.includes('intakes')) return 6;
      if (col === 'tuition_fee') return 7;
      if (col === 'application_fee') return 8;
      if (col === 'initial_deposit' || col.includes('deposit')) return 9;
      if (col === 'currency') return 10;
      if (col === 'scholarship_title' || col === 'scholarship_name') return 11;
      if (col === 'scholarship_type') return 12;
      if (col === 'scholarship_min') return 13;
      if (col === 'scholarship_max') return 14;
      if (col === 'scholarship_description' || col === 'description') return 15;
      if (col.includes('english') || col.includes('requirement')) return 16;
      if (col === 'pathway_foundation') return 17;
      if (col === 'scholarship_available') return 18;
      if (col.includes('active')) return 19;
      return 20;
    }
    if (tableConfig?.id === 'admission_pathways') {
      if (col.includes('institute') || col === 'institute_name') return 1;
      if (col.includes('campus') || col === 'campus_name') return 2;
      if (col.includes('program') || col === 'program_name') return 3;
      if (col === 'pathway_name') return 4;
      if (col === 'pathway_type') return 5;
      if (col === 'marks_required_min') return 6;
      if (col === 'marks_required_max') return 7;
      if (col === 'ielts_score') return 8;
      if (col === 'pte_score') return 9;
      if (col === 'toefl_score') return 10;
      if (col === 'duolingo_score') return 11;
      if (col === 'other') return 12;
      if (col.includes('english')) return 13;
      if (col === 'notes' || col === 'note') return 14;
      if (col.includes('active')) return 15;
      return 16;
    }
    if (tableConfig?.id === 'required_docs') {
      if (col === 'doc_name' || col === 'name') return 1;
      if (col === 'doc_category' || col.includes('category')) return 2;
      if (col === 'applicable_degree_level' || col.includes('degree')) return 3;
      if (col === 'programs_required' || col.includes('program')) return 4;
      if (col === 'description') return 5;
      if (col === 'is_mandatory' || col.includes('mandatory')) return 6;
      if (col.includes('active')) return 7;
      return 8;
    }
    if (tableConfig?.id === 'cities') {
      if (col.includes('country')) return 1;
      if (col.includes('state')) return 2;
      if (col.includes('city') || col === 'name') return 3;
      return 4;
    }
    if (tableConfig?.id === 'states') {
      if (col.includes('country')) return 1;
      if (col.includes('state') || col === 'name') return 2;
      return 3;
    }
    if (tableConfig?.id === 'campuses') {
      if (col.includes('institute') || col.includes('university')) return 1;
      if (col.includes('campus') || col === 'name') return 2;
      if (col.includes('city')) return 3;
      return 4;
    }
    return 10;
  };

  const sortedNonActiveCols = [...nonActiveCols].sort((a, b) => getColSortRank(a) - getColSortRank(b));
  const columns = [...sortedNonActiveCols, ...activeCols];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[calc(100vh-220px)] flex flex-col items-center justify-center py-16">
        <div className="loading-animation-container">
          <div className="animated-pulse-ring" />
          <div className="w-8 h-8 border-3 border-gray-200 border-t-[#009E99] rounded-full animate-spin mx-auto" />
        </div>
        <p className="loading-animated-text text-sm text-slate-500 mt-3 text-center">Loading records...</p>
      </div>
    );
  }

  const copyToClipboard = (val, id) => {
    navigator.clipboard.writeText(String(val));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderCellValue = (col, val, row) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-300 italic text-xs">--</span>;
    }

    // Spouse / Dependant Allowed badge rendering
    if (col === 'spouse_dependants' || col.includes('spouse')) {
      const isAllowed = val === true || val === 1 || val === 'true' || val === '1' || String(val).toLowerCase() === 'allowed' || String(val).toLowerCase() === 'yes';
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isAllowed 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-rose-100 text-rose-700 border border-rose-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isAllowed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {isAllowed ? 'Allowed' : 'Not Allowed'}
        </span>
      );
    }

    // Pathway / Foundation & Scholarships Available feature badges
    if (col === 'pathway_foundation' || col === 'scholarship_available') {
      const isYes = val === true || val === 1 || val === 'true' || val === '1' || String(val).toLowerCase() === 'yes';
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isYes 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : 'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isYes ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {isYes ? 'Yes' : 'No'}
        </span>
      );
    }

    // Campuses badge list rendering
    if (col === 'campuses') {
      const items = String(val).split(',').map(s => s.trim()).filter(Boolean);
      return (
        <div className="flex flex-wrap items-center gap-1">
          {items.map((campusName, i) => (
            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              {campusName}
            </span>
          ))}
        </div>
      );
    }

    // Applicable programs badge list rendering
    if (col === 'programs_required') {
      const items = String(val).split(',').map(s => s.trim()).filter(Boolean);
      return (
        <div className="flex flex-wrap items-center gap-1">
          {items.map((progName, i) => (
            <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
              progName === 'All Programs' 
                ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {progName}
            </span>
          ))}
        </div>
      );
    }

    // Mandatory document badge rendering
    if (col === 'is_mandatory' || col.includes('mandatory')) {
      const isMandatory = val === true || val === 1 || val === 'true' || val === '1' || String(val).toLowerCase() === 'mandatory' || String(val).toLowerCase() === 'yes';
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isMandatory 
            ? 'bg-rose-100 text-rose-700 border border-rose-200' 
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isMandatory ? 'bg-rose-500' : 'bg-slate-400'}`} />
          {isMandatory ? 'Mandatory' : 'Optional'}
        </span>
      );
    }

    // Document category badge rendering
    if (col === 'doc_category') {
      const cat = String(val).toLowerCase();
      let colorCls = 'bg-slate-50 text-slate-700 border-slate-200';
      if (cat === 'academic') colorCls = 'bg-blue-50 text-blue-700 border-blue-200';
      else if (cat === 'identity') colorCls = 'bg-purple-50 text-purple-700 border-purple-200';
      else if (cat === 'language') colorCls = 'bg-amber-50 text-amber-700 border-amber-200';
      else if (cat === 'financial') colorCls = 'bg-emerald-50 text-emerald-700 border-emerald-200';

      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colorCls}`}>
          {String(val).charAt(0).toUpperCase() + String(val).slice(1)}
        </span>
      );
    }

    // Applicable degree level badge rendering
    if (col === 'applicable_degree_level') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {val}
        </span>
      );
    }

    // Date & Time formatting (created_at, timestamp, updated_at)
    if (col === 'created_at' || col === 'timestamp' || col === 'date_time' || col === 'updated_at') {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const dateFormatted = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
          const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          return (
            <div className="inline-flex flex-col text-left py-0.5">
              <span className="text-[11px] font-bold text-slate-800 whitespace-nowrap">{dateFormatted}</span>
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#009E99]"></span>
                {timeFormatted}
              </span>
            </div>
          );
        }
      } catch (e) {
        // Fall through to regular text
      }
    }

    // Lead Status rendering with color-coded badges
    if (col === 'status') {
      const s = String(val).toLowerCase();
      let badgeCls = 'bg-slate-100 text-slate-600 border-slate-200';
      let dotCls = 'bg-slate-400';
      let label = String(val).charAt(0).toUpperCase() + String(val).slice(1);

      if (s === 'new') {
        badgeCls = 'bg-teal-100 text-teal-900 border-teal-300 font-black shadow-xs';
        dotCls = 'bg-[#009E99] animate-pulse';
        label = 'New Lead';
      } else if (s === 'contacted') {
        badgeCls = 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
        dotCls = 'bg-blue-500';
        label = 'Contacted';
      } else if (s === 'in_progress' || s === 'in progress') {
        badgeCls = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';
        dotCls = 'bg-amber-500';
        label = 'In Progress';
      } else if (s === 'enrolled') {
        badgeCls = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
        dotCls = 'bg-emerald-500';
        label = 'Enrolled';
      } else if (s === 'closed') {
        badgeCls = 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
        dotCls = 'bg-slate-400';
        label = 'Closed';
      }

      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border ${badgeCls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
          {label}
        </span>
      );
    }

    // Student Name cell with NEW unread indicator if status is 'new' and unread
    if (col === 'student_name') {
      const isNew = isLeadUnread(row);
      return (
        <div className="flex items-center gap-1.5">
          <span className={`text-xs ${isNew ? 'font-black text-slate-950' : 'font-medium text-slate-700'}`}>
            {val}
          </span>
          {isNew && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase bg-[#009E99] text-white tracking-wider animate-pulse shadow-xs">
              NEW
            </span>
          )}
        </div>
      );
    }

    if (typeof val === 'boolean' || isActiveCol(col)) {
      const isActive = val === true || val === 1 || val === 'true' || val === '1' || String(val).toLowerCase() === 'active';
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isActive 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    }

    if (typeof val === 'object') {
      return (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded" title={JSON.stringify(val)}>
          {JSON.stringify(val).substring(0, 30)}...
        </span>
      );
    }

    const isNewLeadRow = isLeadUnread(row);
    const valStr = String(val);
    if (valStr.length > 60) {
      return <span title={valStr} className={`text-xs ${isNewLeadRow ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{valStr.substring(0, 60)}...</span>;
    }

    return <span className={`text-xs ${isNewLeadRow ? 'font-bold text-slate-900' : 'text-slate-700 font-medium'}`}>{valStr}</span>;
  };

  const isLeadUnread = (row) => {
    if (tableConfig?.id !== 'student_leads') return false;
    const leadKey = String(row?.lead_id || row?.id || row?.session_id || '');
    const isRead = readLeadIds.includes(leadKey);
    const isStatusNew = String(row?.status || '').toLowerCase() === 'new';
    return !isRead && isStatusNew;
  };

  const getColumnAlignmentClass = (col) => {
    if (col.includes('active') || col.includes('available') || col.includes('spouse') || col.includes('mandatory') || col.includes('foundation') || col === 'currency' || col === 'code' || col === 'status') {
      return 'text-center';
    }
    if (col.includes('score') || col.includes('ratio') || col.includes('ranking') || col.includes('days') || col.includes('fee') || col.includes('deposit') || col.includes('min') || col.includes('max')) {
      return 'text-center';
    }
    return 'text-left';
  };

  const isChatOrLeadTable = tableConfig?.id === 'chat_sessions' || tableConfig?.id === 'chat_messages' || tableConfig?.id === 'student_leads';
  const isTranscriptTable = tableConfig?.id === 'chat_sessions' || tableConfig?.id === 'student_leads';

  const thCls = "px-3 py-2 text-[9.5px] font-bold text-white uppercase tracking-wider whitespace-nowrap bg-[#009E99]";
  const tdCls = "px-3 py-2 align-middle text-[11.5px] leading-tight";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200 min-h-[calc(100vh-220px)] flex flex-col justify-between">
      {/* Dynamic Contextual Dropdown Filter Bar */}
      {tableFilterDefs.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 mr-1">
              <Filter size={13} className="text-[#009E99]" />
              <span>Filters:</span>
            </div>

            {tableFilterDefs.map((filter) => (
              <select
                key={filter.key}
                value={selectedFilters[filter.key] || 'ALL'}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#009E99] ${
                  selectedFilters[filter.key] && selectedFilters[filter.key] !== 'ALL'
                    ? 'bg-teal-50 text-[#009E99] border-teal-400 font-semibold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}

            {Object.keys(selectedFilters).length > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-150 cursor-pointer shadow-xs"
                title="Clear all active filters"
              >
                <X size={12} />
                <span>Reset Filters ({Object.keys(selectedFilters).length})</span>
              </button>
            )}
          </div>

          <div className="text-[11px] font-medium text-slate-400">
            Showing <strong className="text-slate-700 font-bold">{filteredRows.length}</strong> of {totalCount} records
          </div>
        </div>
      )}

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#009E99] border-b border-[#009E99]">
              <th className={`${thCls} w-12 text-center`}>SR#</th>
              {columns.map((col) => (
                <th key={col} className={`${thCls} ${getColumnAlignmentClass(col)}`}>
                  {getHumanFieldName(col)}
                </th>
              ))}
              {tableConfig?.canModify && <th className={`${thCls} w-24 text-center`}>Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (tableConfig?.canModify ? 2 : 1)} 
                  className="text-center py-8 px-4 bg-white"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5 max-w-sm mx-auto">
                    <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-[#009E99] shadow-sm">
                      <FileText size={18} />
                    </div>
                    <p className="text-gray-700 font-semibold text-xs m-0">
                      {searchQuery ? `No records matched "${searchQuery}"` : `No records found in ${tableConfig?.label || 'table'}`}
                    </p>
                    <p className="text-gray-400 text-[11px] m-0">
                      {searchQuery ? "Try adjusting your search terms" : "Click 'Add' above to create the first entry"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const pKeyValue = row[primaryKey] || idx;
                const regNum = (page - 1) * pageSize + idx + 1;
                const isNewLead = isLeadUnread(row);
                const isClickableRow = isTranscriptTable && onViewTranscript;

                return (
                  <tr 
                    key={pKeyValue || idx}
                    onClick={() => {
                      if (isClickableRow) onViewTranscript(row);
                    }}
                    title={isClickableRow ? "Click to view full student details & chat transcript" : undefined}
                    className={`
                      border-b border-gray-100 transition-all duration-150
                      ${isNewLead 
                        ? 'bg-teal-50/70 hover:bg-teal-100/70 border-l-[4px] border-l-[#009E99] font-bold text-slate-950 shadow-xs' 
                        : (idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white hover:bg-gradient-to-r hover:from-teal-50/40 hover:to-transparent')
                      }
                      ${isClickableRow ? 'cursor-pointer hover:shadow-xs' : ''}
                      group
                    `}
                  >
                    <td className={`${tdCls} text-center font-bold text-[#009E99]`}>
                      <div className={`inline-flex items-center justify-center w-5 h-5 rounded ${isNewLead ? 'bg-[#009E99] text-white font-black' : 'bg-teal-50 text-[#009E99] font-bold'} text-[10.5px]`}>
                        {regNum}
                      </div>
                    </td>
                    {columns.map((col) => (
                      <td key={col} className={`${tdCls} ${getColumnAlignmentClass(col)}`}>
                        {renderCellValue(col, row[col], row)}
                      </td>
                    ))}
                  {tableConfig?.canModify && (
                    <td className={`${tdCls} text-center`}>
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isTranscriptTable && onViewTranscript && (
                          <button
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-[#009E99] text-white hover:bg-[#008783] shadow-sm transition-all duration-150"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewTranscript(row);
                            }}
                            title="View Student Details & Chat Transcript"
                          >
                            <MessageSquare size={13} />
                          </button>
                        )}
                        {!isChatOrLeadTable && (
                          <button
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:text-[#009E99] hover:border-[#009E99] hover:bg-teal-50 transition-all duration-150"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditRecord(row);
                            }}
                            title="Edit Record"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        <button
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-white border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-all duration-150"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRecord(row);
                          }}
                          title="Remove Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Standardized Application Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white gap-3">
        <ShowDataNumber
          start={displayStart}
          end={displayEnd}
          total={totalCount}
        />
        <Pagination
          handlePageClick={(p) => onPageChange(p)}
          pageNo={page}
          totalNum={totalCount}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}

