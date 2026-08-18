-- ============================================================================
-- COMPLETE DATABASE SEED SCRIPT FOR STUDY ABROAD CONSULTANCY SOFTWARE
-- Execute this script directly in your Supabase SQL Editor.
-- ============================================================================

-- 1. COUNTRIES
INSERT INTO public.countries (country_name, visa_approval_ratio, psw_duration, spouse_dependants, currency, study_requirements, is_active)
VALUES 
  ('Australia', 88.5, '2 to 4 Years', true, 'AUD', 'Valid Passport, Academic Transcripts, English Test (IELTS/PTE), Financial Proof (AUD $24,505/year), OSHC Health Insurance', true),
  ('United Kingdom', 95.0, '2 Years (UG/PG) / 3 Years (PhD)', true, 'GBP', 'CAS Letter, Academic Certificates, IELTS Academic / SELT, TB Test Certificate, Bank Statement (1344 GBP/month London)', true),
  ('Canada', 78.0, 'up to 3 Years (PGWP)', true, 'CAD', 'Letter of Acceptance (LOA), PAL (Attestation Letter), GIC Deposit (CAD $20,635), Academic Records, IELTS Academic', true),
  ('United States', 82.0, '1 Year (OPT) / 3 Years (STEM OPT)', true, 'USD', 'I-20 Form, DS-160 Visa Form, SEVIS Fee Receipt, TOEFL/IELTS/Duolingo, Bank Statement showing 1 Year Full Costs', true),
  ('Germany', 91.0, '18 Months', false, 'EUR', 'APS Certificate (for South Asia), Academic Degree, Blocked Account (€11,208/year), Health Insurance, English/German B2', true),
  ('Finland', 93.0, '2 Years (Residence Permit)', true, 'EUR', 'Acceptance Letter, Funds in Bank (€6,720/year), Health Insurance, Academic Degree, English Proficiency', true),
  ('Cyprus', 96.0, '1 Year', false, 'EUR', 'Acceptance Letter, Police Clearance Certificate, Medical Fitness Report, Financial Proof (€7,000/year)', true),
  ('France', 90.0, '2 Years (APS Permit)', true, 'EUR', 'EEF Campus France Approval, Academic Records, Proof of Accommodation, Financial Means (€615/month)', true)
ON CONFLICT DO NOTHING;

-- 2. STATES / PROVINCES
INSERT INTO public.states (country_id, state_name, is_active)
SELECT c.country_id, s.state_name, true
FROM public.countries c
CROSS JOIN (VALUES
  ('Australia', 'New South Wales'),
  ('Australia', 'Victoria'),
  ('Australia', 'Queensland'),
  ('Australia', 'Western Australia'),
  ('United Kingdom', 'England'),
  ('United Kingdom', 'Scotland'),
  ('Canada', 'Ontario'),
  ('Canada', 'British Columbia'),
  ('United States', 'California'),
  ('United States', 'New York'),
  ('Germany', 'Bavaria'),
  ('Finland', 'Uusimaa'),
  ('Cyprus', 'Nicosia District')
) AS s(country_name, state_name)
WHERE c.country_name = s.country_name;

-- 3. CITIES
INSERT INTO public.cities (state_id, city_name, is_active)
SELECT st.state_id, ct.city_name, true
FROM public.states st
JOIN public.countries c ON st.country_id = c.country_id
CROSS JOIN (VALUES
  ('New South Wales', 'Sydney'),
  ('Victoria', 'Melbourne'),
  ('Queensland', 'Brisbane'),
  ('Western Australia', 'Perth'),
  ('England', 'London'),
  ('England', 'Manchester'),
  ('Scotland', 'Edinburgh'),
  ('Ontario', 'Toronto'),
  ('British Columbia', 'Vancouver'),
  ('California', 'Los Angeles'),
  ('Bavaria', 'Munich'),
  ('Uusimaa', 'Helsinki'),
  ('Nicosia District', 'Nicosia')
) AS ct(state_name, city_name)
WHERE st.state_name = ct.state_name;

-- 4. INSTITUTES / UNIVERSITIES
INSERT INTO public.institutes (
  institute_name, country_id, state_id, city_id, website, institute_location, institute_type, 
  admission_processing_days, english_language_requirement, special_instructions, 
  university_ranking_int, university_ranking_local, admission_intakes, is_active
)
SELECT 
  ins.institute_name, c.country_id, st.state_id, ct.city_id, ins.website, ins.institute_location, 
  ins.institute_type, ins.processing_days, ins.english_req, ins.special_instr, 
  ins.rank_int, ins.rank_local, ins.intakes, true
FROM (VALUES
  ('University of Sydney', 'Australia', 'New South Wales', 'Sydney', 'https://sydney.edu.au', 'Camperdown NSW 2006', 'public', 14, 'IELTS 6.5 overall (min 6.0 each band) or PTE 61', 'Conditional offer issued within 5-7 working days. GTE/GS assessment required.', 19, 2, 'February, July'),
  ('University of Melbourne', 'Australia', 'Victoria', 'Melbourne', 'https://unimelb.edu.au', 'Parkville VIC 3010', 'public', 21, 'IELTS 6.5 (min 6.0 in all components) or TOEFL iBT 79', 'High competitive cutoff. Early application strongly recommended for scholarships.', 14, 1, 'February, July'),
  ('Imperial College London', 'United Kingdom', 'England', 'London', 'https://imperial.ac.uk', 'South Kensington, London SW7 2AZ', 'public', 30, 'IELTS 7.0 (min 6.5 per band) or PTE 69', 'ATAS clearance mandatory for engineering & STEM postgraduates.', 6, 3, 'September, October'),
  ('University of Toronto', 'Canada', 'Ontario', 'Toronto', 'https://utoronto.ca', '27 King''s College Circle, Toronto', 'public', 25, 'IELTS 6.5 (min 6.0) or TOEFL 100', 'Requires Provincial Attestation Letter (PAL) prior to study permit submission.', 21, 1, 'September, January'),
  ('Technical University of Munich', 'Germany', 'Bavaria', 'Munich', 'https://tum.de', 'Arcisstraße 21, 80333 München', 'public', 45, 'IELTS 6.5 or TOEFL 88 / German B2 for specific tracks', 'VPD through Uni-Assist is required before applying to TUM portal.', 28, 1, 'October, April'),
  ('University of Helsinki', 'Finland', 'Uusimaa', 'Helsinki', 'https://helsinki.fi', 'Yliopistonkatu 4, 00100 Helsinki', 'public', 30, 'IELTS 6.5 (min 6.0 in writing) or PTE 62', 'Early bird tuition discount available for first 14 days after admission.', 115, 1, 'September'),
  ('University of Nicosia', 'Cyprus', 'Nicosia District', 'Nicosia', 'https://unic.ac.cy', '46 Makedonitissas Avenue, Nicosia', 'private', 7, 'IELTS 5.5 or English Placement Test on arrival', 'Guaranteed medical & student visa processing upon acceptance.', 501, 1, 'October, February')
) AS ins(institute_name, country_name, state_name, city_name, website, institute_location, institute_type, processing_days, english_req, special_instr, rank_int, rank_local, intakes)
JOIN public.countries c ON c.country_name = ins.country_name
LEFT JOIN public.states st ON st.state_name = ins.state_name
LEFT JOIN public.cities ct ON ct.city_name = ins.city_name;

-- 5. CAMPUSES
INSERT INTO public.campuses (campus_name, institute_id, city_id, campus_location, is_active)
SELECT cmp.campus_name, i.institute_id, ct.city_id, cmp.campus_location, true
FROM public.institutes i
JOIN public.cities ct ON ct.city_name = i.institute_location OR ct.city_id = i.city_id
CROSS JOIN (VALUES
  ('University of Sydney', 'Camperdown Main Campus', 'Camperdown NSW 2006, Sydney'),
  ('University of Melbourne', 'Parkville Main Campus', 'Grattan St, Parkville VIC 3010'),
  ('Imperial College London', 'South Kensington Campus', 'Exhibition Rd, South Kensington, London SW7 2AZ'),
  ('University of Toronto', 'St. George Main Campus', '27 King''s College Circle, Toronto, ON M5S 1A1'),
  ('Technical University of Munich', 'Garching High-Tech Campus', 'Boltzmannstraße 15, 85748 Garching'),
  ('University of Helsinki', 'City Centre Campus', 'Yliopistonkatu 4, 00100 Helsinki'),
  ('University of Nicosia', 'Main Nicosia Campus', '46 Makedonitissas Ave, Nicosia 2417')
) AS cmp(institute_name, campus_name, campus_location)
WHERE i.institute_name = cmp.institute_name;

-- 6. PROGRAMS
INSERT INTO public.programs (
  program_name, institute_id, campus_id, degree_level, degree_duration, degree_intakes, english_language_requirement, is_active
)
SELECT 
  p.program_name, i.institute_id, c.campus_id, p.degree_level, p.degree_duration, p.degree_intakes, p.english_req, true
FROM public.institutes i
LEFT JOIN public.campuses c ON c.institute_id = i.institute_id
CROSS JOIN (VALUES
  ('University of Sydney', 'BSc Computer Science & AI', 'Bachelors', '3 Years', 'February, July', 'IELTS 6.5 (min 6.0 each)'),
  ('University of Sydney', 'Master of Data Science', 'Masters', '1.5 to 2 Years', 'February, July', 'IELTS 7.0 (min 6.5 each)'),
  ('University of Melbourne', 'Bachelor of Business & Finance', 'Bachelors', '3 Years', 'February, July', 'IELTS 6.5 (min 6.0 each)'),
  ('Imperial College London', 'MSc Artificial Intelligence & Machine Learning', 'Masters', '1 Year', 'September', 'IELTS 7.0 (min 6.5 per band)'),
  ('University of Toronto', 'Master of Engineering (Software & Cloud)', 'Masters', '2 Years', 'September, January', 'IELTS 7.0 or TOEFL 100'),
  ('Technical University of Munich', 'MSc Informatics & Software Engineering', 'Masters', '2 Years', 'October, April', 'IELTS 6.5 or TOEFL 88'),
  ('University of Helsinki', 'MSc Computer Science & Data Analytics', 'Masters', '2 Years', 'September', 'IELTS 6.5 (min 6.0 writing)'),
  ('University of Nicosia', 'Bachelor of Business Administration (BBA)', 'Bachelors', '4 Years', 'October, February', 'IELTS 5.5 or Placement Test')
) AS p(institute_name, program_name, degree_level, degree_duration, degree_intakes, english_req)
WHERE i.institute_name = p.institute_name;

-- 7. PROGRAM FEES
INSERT INTO public.program_fees (
  program_id, campus_id, pathway_foundation, scholarship_available, application_fee, tuition_fee, initial_deposit, currency, is_active
)
SELECT 
  p.program_id, p.campus_id, pf.pathway_foundation, pf.scholarship_available, pf.app_fee, pf.tuition, pf.deposit, pf.currency, true
FROM public.programs p
JOIN public.institutes i ON p.institute_id = i.institute_id
CROSS JOIN (VALUES
  ('BSc Computer Science & AI', true, true, 125.00, 48500.00, 10000.00, 'AUD'),
  ('Master of Data Science', false, true, 150.00, 52000.00, 12000.00, 'AUD'),
  ('Bachelor of Business & Finance', true, true, 100.00, 44000.00, 8000.00, 'AUD'),
  ('MSc Artificial Intelligence & Machine Learning', false, true, 80.00, 39500.00, 5000.00, 'GBP'),
  ('Master of Engineering (Software & Cloud)', false, true, 125.00, 38000.00, 5000.00, 'CAD'),
  ('MSc Informatics & Software Engineering', false, false, 0.00, 300.00, 300.00, 'EUR'),
  ('MSc Computer Science & Data Analytics', true, true, 100.00, 13000.00, 3000.00, 'EUR'),
  ('Bachelor of Business Administration (BBA)', true, true, 50.00, 9500.00, 2000.00, 'EUR')
) AS pf(program_name, pathway_foundation, scholarship_available, app_fee, tuition, deposit, currency)
WHERE p.program_name = pf.program_name;

-- 8. SCHOLARSHIPS
INSERT INTO public.scholarships (
  scholarship_title, institute_id, program_id, scholarship_min, scholarship_max, currency, scholarship_type, description, is_active
)
SELECT 
  sch.title, i.institute_id, p.program_id, sch.min_val, sch.max_val, sch.curr, sch.stype, sch.descr, true
FROM public.institutes i
LEFT JOIN public.programs p ON p.institute_id = i.institute_id
CROSS JOIN (VALUES
  ('University of Sydney', 'Vice-Chancellor International Award', 20.0, 50.0, 'AUD', 'Merit-Based', 'Merit-based tuition waiver up to 50% for high academic achievers.'),
  ('Imperial College London', 'Imperial Science & Technology Merit Scholarship', 10.0, 100.0, 'GBP', 'Full Tuition Waiver', 'Full 100% tuition waiver for outstanding international STEM candidates.'),
  ('University of Toronto', 'Lester B. Pearson International Scholarship', 50.0, 100.0, 'CAD', 'Full Tuition Waiver', 'Covers tuition, books, incidental fees, and full residence support.'),
  ('University of Helsinki', 'Finland Government International Grant', 50.0, 100.0, 'EUR', 'Partial Tuition Waiver', '50% to 100% tuition fee waiver based on academic entry rank.'),
  ('University of Nicosia', 'Academic Merit Bursary', 20.0, 30.0, 'EUR', 'Bursary', 'Automatic 20-30% discount for students with high school GPA above 85%.')
) AS sch(institute_name, title, min_val, max_val, curr, stype, descr)
WHERE i.institute_name = sch.institute_name;

-- 9. REQUIRED DOCUMENTS (MASTER DOCS)
INSERT INTO public.required_docs (doc_name, doc_category, description, is_mandatory)
VALUES 
  ('Valid International Passport', 'identity', 'Color scan of bio-data page with minimum 6 months validity.', true),
  ('High School Certificate & Transcript', 'academic', 'Official secondary school leaving certificate & mark sheets.', true),
  ('Bachelor Degree & Semester Transcripts', 'academic', 'Attested undergraduate degree certificate and official transcripts.', true),
  ('IELTS / TOEFL / PTE Test Report', 'language', 'Official test score report taken within the last 2 years.', true),
  ('Statement of Purpose (SOP)', 'other', 'Personal statement explaining study motivation, goals, and course choice.', true),
  ('Two Letters of Recommendation (LOR)', 'other', 'Academic or professional reference letters signed on official letterhead.', true),
  ('Bank Statement / Proof of Financial Funds', 'financial', 'Official bank statement demonstrating sufficient living expenses & tuition fees.', true),
  ('Curriculum Vitae (CV / Resume)', 'other', 'Updated professional resume highlighting academic and work experience.', false)
ON CONFLICT DO NOTHING;

-- 10. ENGLISH REQUIREMENTS
INSERT INTO public.english_requirements (
  institute_id, program_id, ielts_score, toefl_score, pte_score, duolingo_score, other, note, is_active
)
SELECT 
  i.institute_id, p.program_id, eng.ielts, eng.toefl, eng.pte, eng.duolingo, eng.other_test, eng.note_text, true
FROM public.institutes i
LEFT JOIN public.programs p ON p.institute_id = i.institute_id
CROSS JOIN (VALUES
  ('University of Sydney', 6.5, 85, 61, 115, 'Medium of Instruction (MOI) accepted for English-medium universities', 'All individual bands must be 6.0 or higher.'),
  ('Imperial College London', 7.0, 100, 69, 125, 'Cambridge C1 Advanced / C2 Proficiency Grade B or higher', 'Higher requirement applies for Computer Science and Business programs.'),
  ('University of Toronto', 7.0, 93, 65, 120, 'CanTEST or MELAB accepted', 'Minimum score of 22 in writing component.'),
  ('University of Nicosia', 5.5, 60, 45, 95, 'English Placement Test available on arrival at Nicosia campus', 'Students below 5.5 complete 1 semester of English foundation.')
) AS eng(institute_name, ielts, toefl, pte, duolingo, other_test, note_text)
WHERE i.institute_name = eng.institute_name;

-- 11. ADMISSION PATHWAYS
INSERT INTO public.admission_pathways (
  pathway_name, institute_id, campus_id, program_id, marks_required_min, marks_required_max, 
  english_language_requirement, notes, pathway_type, is_active
)
SELECT 
  path.name, i.institute_id, c.campus_id, p.program_id, path.min_marks, path.max_marks, 
  path.eng_req, path.notes_txt, path.ptype, true
FROM public.institutes i
LEFT JOIN public.campuses c ON c.institute_id = i.institute_id
LEFT JOIN public.programs p ON p.institute_id = i.institute_id
CROSS JOIN (VALUES
  ('University of Sydney', 'Taylors College Foundation Year', 60.0, 75.0, 'IELTS 5.5 (min 5.0 in bands)', 'Guaranteed entry into Year 1 of Sydney UG programs upon achieving GPA 6.5.', 'Foundation'),
  ('Imperial College London', 'International Year One STEM Pathway', 75.0, 85.0, 'IELTS 6.0 (min 5.5 in bands)', 'Direct progression into 2nd year of Engineering upon successful module completion.', 'Undergraduate'),
  ('University of Nicosia', 'Pre-Sessional English & Foundation Track', 50.0, 65.0, 'IELTS 5.0', '1-Semester pre-sessional English course before full degree commencement.', 'Pre-Sessional English')
) AS path(institute_name, name, min_marks, max_marks, eng_req, notes_txt, ptype)
WHERE i.institute_name = path.institute_name;

-- 12. PROGRAM REQUIRED DOCUMENTS
INSERT INTO public.program_required_documents (
  program_id, doc_id, pathway_id, is_mandatory, notes
)
SELECT 
  p.program_id, rd.doc_id, path.pathway_id, true, 'Mandatory requirement for course offer letter generation.'
FROM public.programs p
CROSS JOIN public.required_docs rd
LEFT JOIN public.admission_pathways path ON path.program_id = p.program_id
WHERE rd.doc_name IN ('Valid International Passport', 'High School Certificate & Transcript', 'Statement of Purpose (SOP)')
LIMIT 10;

-- 13. BUSINESS INFO
INSERT INTO public.business_info (
  organization_name, address, city, state, country, phone_number, whatsapp_number, email, office_timing
)
VALUES (
  'Educatia Study Abroad Consultants',
  'Suite 402, Executive Tower, Blue Area',
  'Islamabad',
  'Federal Capital',
  'Pakistan',
  '+92 51 111 222 333',
  '+92 300 1234567',
  'admissions@educatiaabroad.com',
  'Monday - Saturday: 09:00 AM - 06:00 PM'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF SEED SCRIPT
-- ============================================================================
