import { createClient } from '@supabase/supabase-js';

let cachedClient = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseConfig = () => {
  const metaEnv = typeof import.meta !== 'undefined' ? import.meta.env : null;
  const localStore = typeof localStorage !== 'undefined' ? localStorage : null;
  return {
    url: metaEnv?.VITE_SUPABASE_URL || localStore?.getItem('educatia_supabase_url') || '',
    key: metaEnv?.VITE_SUPABASE_ANON_KEY || localStore?.getItem('educatia_supabase_key') || '',
  };
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  lastUrl = url;
  lastKey = key;
  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  return cachedClient;
};

/**
 * Intelligent Context-Aware Supabase Router:
 * Detects current country/topic context from full chat history to prevent unnecessary cross-country data fetching!
 */
export async function fetchContextFromSupabase(userQuery, conversationHistory = []) {
  const client = getSupabaseClient();
  if (!client) {
    return { text: null, rawData: null };
  }

  // 1. Intent Detection (Check CURRENT user query FIRST, then recent conversation history)
  const currentQueryLower = userQuery.toLowerCase();
  const recentTexts = conversationHistory
    .slice(-6)
    .map(m => (m.content || '').toLowerCase());
  const searchSequence = [currentQueryLower, ...recentTexts.reverse()];

  let targetCountry = '';
  let targetInstitute = '';

  // 1. DYNAMICALLY QUERY SUPABASE FOR ACTIVE ENTITIES (Zero Hardcoding)
  try {
    const { data: dbEntities } = await client
      .from('v_chatbot_bot_details')
      .select('country_name, institute_name')
      .eq('program_active', true)
      .eq('institute_active', true);

    if (dbEntities && dbEntities.length > 0) {
      const dbInstitutes = Array.from(new Set(dbEntities.map(r => r.institute_name).filter(Boolean)));
      const dbCountries = Array.from(new Set(dbEntities.map(r => r.country_name).filter(Boolean)));

      const genericWords = new Set(['university', 'college', 'institute', 'school', 'academy', 'the', 'of', 'and', 'for']);

      // Dynamic Institute Match with Keyword & Typo Tolerance
      for (const text of searchSequence) {
        const foundInst = dbInstitutes.find(inst => {
          const lowerInst = inst.toLowerCase();
          if (text.includes(lowerInst)) return true;
          // Match distinct keywords from university name (e.g. "gujranwala", "oxford", "toronto")
          const keywords = lowerInst.split(/\s+/).filter(w => w.length >= 4 && !genericWords.has(w));
          return keywords.length > 0 && keywords.some(kw => text.includes(kw));
        });

        if (foundInst) {
          targetInstitute = foundInst;
          break;
        }
      }

      // Dynamic Country Match against live database records
      if (!targetInstitute) {
        for (const text of searchSequence) {
          const foundCountry = dbCountries.find(c => text.includes(c.toLowerCase()));
          if (foundCountry) {
            targetCountry = foundCountry;
            break;
          }
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Dynamic entity routing notice:', err?.message || err);
  }

  let targetDegree = '';
  for (const text of searchSequence) {
    if (text.match(/\b(?:bachelor|bachelors|bsc|beng|ba|fsc|undergraduate)\b/i)) {
      targetDegree = 'Bachelors';
      break;
    } else if (text.match(/\b(?:master|masters|msc|postgraduate)\b/i)) {
      targetDegree = 'Masters';
      break;
    }
  }

  const contextParts = [];
  const rawDataMap = {};

  try {
    // 2. Primary Query on v_chatbot_bot_details View
    let viewQuery = client
      .from('v_chatbot_bot_details')
      .select('*')
      .eq('program_active', true)
      .eq('institute_active', true);

    if (targetInstitute) {
      viewQuery = viewQuery.ilike('institute_name', `%${targetInstitute}%`);
    } else if (targetCountry) {
      viewQuery = viewQuery.ilike('country_name', `%${targetCountry}%`);
    }
    if (targetDegree) {
      viewQuery = viewQuery.ilike('degree_level', `%${targetDegree}%`);
    }

    const { data: rows, error } = await viewQuery;

    if (error) {
      console.warn('⚠️ [VIEW QUERY NOTICE]:', error.message);
    }

    if (rows && rows.length > 0) {
      rawDataMap.v_chatbot_bot_details = rows;
      const countriesMap = {};

      rows.forEach(r => {
        if (!countriesMap[r.country_name]) {
          countriesMap[r.country_name] = {
            country_name: r.country_name,
            visa_approval_ratio: r.visa_approval_ratio,
            psw_duration: r.psw_duration,
            spouse_dependants: r.spouse_dependants,
            currency: r.country_currency,
            institutes: {}
          };
        }
        const c = countriesMap[r.country_name];
        if (!c.institutes[r.institute_name]) {
          c.institutes[r.institute_name] = {
            institute_name: r.institute_name,
            ranking: r.university_ranking_int,
            website: r.website,
            type: r.institute_type,
            programs: []
          };
        }
        c.institutes[r.institute_name].programs.push({
          program_id: r.program_id,
          program_name: r.program_name,
          degree_level: r.degree_level,
          tuition_fee: r.tuition_fee,
          deposit: r.initial_deposit,
          currency: r.fee_currency,
          ielts: r.ielts_score
        });
      });

      // Format Context
      Object.values(countriesMap).forEach(c => {
        contextParts.push(`Country: ${c.country_name} (Visa Approval Ratio: ${c.visa_approval_ratio}%, PSW Duration: ${c.psw_duration || 'Available'}, Spouse Allowed: ${c.spouse_dependants ? 'Yes' : 'No'}, Currency: ${c.currency})`);
        Object.values(c.institutes).forEach(inst => {
          contextParts.push(`  - University: ${inst.institute_name} (Ranking: #${inst.ranking || 'N/A'}, Type: ${inst.type})`);
          inst.programs.forEach(p => {
            const tuitionFormatted = p.tuition_fee ? p.tuition_fee.toLocaleString('en-US') : 'N/A';
            const depositFormatted = p.deposit ? p.deposit.toLocaleString('en-US') : 'N/A';
            contextParts.push(`    * Degree: ${p.program_name} [${p.degree_level}] (Tuition: ${tuitionFormatted} ${p.currency}, Initial Deposit: ${depositFormatted} ${p.currency}, IELTS Required: ${p.ielts || 'N/A'})`);
          });
        });
      });

      // 3. Strict Subject Grounding Check
      const subjectMatch = userQuery.toLowerCase().match(/\b(?:chemistry|physics|biology|nursing|fashion|design|law|pilot|aviation|art|music|psychology|mathematics|engineering|business|computer science|data science|it)\b/gi);
      if (subjectMatch) {
        const found = rows.some(r => subjectMatch.some(kw => r.program_name.toLowerCase().includes(kw)));
        if (!found) {
          contextParts.push(`[CRITICAL DATABASE VERIFICATION]: Student explicitly asked for "${subjectMatch.join(', ')}", BUT NO matching program exists in our database. You MUST state immediately: "Sorry, we don't currently offer a ${subjectMatch.join(', ')} program in our database."`);
        }
      }

      // 4. Targeted Deep Dive via Primary Keys (program_id / institute_id)
      const isDocRequested = fullTextContext.includes('document') || fullTextContext.includes('doc') || fullTextContext.includes('requirement') || fullTextContext.includes('checklist') || fullTextContext.includes('attest');
      if (isDocRequested) {
        const matchedProgramIds = Array.from(new Set(rows.map(r => r.program_id)));
        const { data: prd } = await client
          .from('program_required_documents')
          .select('program_id, is_mandatory, notes, required_docs(doc_name, doc_category)')
          .in('program_id', matchedProgramIds);

        if (prd && prd.length > 0) {
          const uniqueDocs = [];
          const seenDocs = new Set();
          prd.forEach(d => {
            if (d.required_docs && !seenDocs.has(d.required_docs.doc_name)) {
              seenDocs.add(d.required_docs.doc_name);
              uniqueDocs.push(`- ${d.required_docs.doc_name} (${d.required_docs.doc_category}) ${d.is_mandatory ? '[Mandatory]' : '[Optional]'}`);
            }
          });
          contextParts.push(`\nRequired Admission Documents (Deep Dive via Program PKs):\n${uniqueDocs.join('\n')}`);
          rawDataMap.program_required_documents = prd;
        }
      }
    }

    // 5. Business Office Info
    const { data: binfo } = await client
      .from('business_info')
      .select('organization_name, contact_person, address, city, country, phone_number, whatsapp_number, email, website, office_timing')
      .eq('is_active', true);

    if (binfo && binfo.length > 0) {
      contextParts.push(`Educatia Business & Office Info:\n${binfo.map(b => `- ${b.organization_name}: Address: ${b.address}, ${b.city}, ${b.country}. Phone: ${b.phone_number}, WhatsApp: ${b.whatsapp_number}, Email: ${b.email}, Office Hours: ${b.office_timing}`).join('\n')}`);
      rawDataMap.business_info = binfo;
    }

    return {
      text: contextParts.join('\n\n'),
      rawData: rawDataMap
    };

  } catch (err) {
    return { text: null, rawData: null, error: 'Network offline / DB unreachable' };
  }
}

/**
 * Automatically detects contact numbers & names from student messages
 * and saves them into the `student_leads` table in Supabase!
 */
export async function detectAndSaveLead(userText, fullHistory = []) {
  const client = getSupabaseClient();
  if (!client) return;

  // Combine full history text to search for phone numbers and names
  const allUserTexts = [...fullHistory.filter(m => m.role === 'user').map(m => m.content), userText];
  const combinedText = allUserTexts.join(' ');

  // Regex to detect phone/WhatsApp numbers (Pakistani & International formats)
  const phoneMatch = combinedText.match(/(?:\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b03\d{9}\b/);
  if (!phoneMatch) return;

  const phoneStr = phoneMatch[0].trim();

  // Extract student name using 2-step algorithm (Explicit prefix check + Fallback word stripping)
  let nameStr = '';

  // Step 1: Explicit prefix match ("my name is X", "I am X")
  const explicitMatch = combinedText.match(/(?:my name is|name is|i am|iam|this is)\s+([A-Za-z\s]+)/i);
  if (explicitMatch && explicitMatch[1]) {
    let raw = explicitMatch[1].trim();
    raw = raw.replace(/\s+(?:and|number|phone|whatsapp|mobile|contact|is|my)\b.*/i, '').trim();
    if (raw.length > 1) nameStr = raw;
  }

  // Step 2: Fallback - Extract name from message containing the phone number if no explicit prefix
  if (!nameStr) {
    const msgWithPhone = allUserTexts.slice().reverse().find(t => t.match(/(?:\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b03\d{9}\b/));
    if (msgWithPhone) {
      let textWithoutPhone = msgWithPhone.replace(/(?:\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b03\d{9}\b/g, '').trim();
      textWithoutPhone = textWithoutPhone.replace(/\b(?:and|number|phone|whatsapp|mobile|contact|is|my|this|here|hi|hello|please|call|me)\b/gi, ' ').trim();
      textWithoutPhone = textWithoutPhone.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim();
      
      if (textWithoutPhone.length > 1) {
        nameStr = textWithoutPhone;
      }
    }
  }

  if (!nameStr) nameStr = 'Student Inquiry';
  // Capitalize name
  nameStr = nameStr.replace(/\b\w/g, char => char.toUpperCase());

  // Detect target country from chat context
  const lowerCombined = combinedText.toLowerCase();
  let targetCountry = 'General Study Abroad';
  if (lowerCombined.includes('ireland')) targetCountry = 'Ireland';
  else if (lowerCombined.includes('cyprus')) targetCountry = 'Cyprus';
  else if (lowerCombined.includes('canada')) targetCountry = 'Canada';
  else if (lowerCombined.includes('uk') || lowerCombined.includes('united kingdom')) targetCountry = 'UK';
  else if (lowerCombined.includes('australia')) targetCountry = 'Australia';

  try {
    // Insert into Supabase `student_leads` table matching exact schema columns
    await client
      .from('student_leads')
      .insert([
        {
          student_name: nameStr,
          phone_number: phoneStr,
          interested_country: targetCountry,
          last_message_snippet: userText.substring(0, 200),
          status: 'new'
        }
      ]);
  } catch (err) {
    // Silently fail if offline
  }
}
