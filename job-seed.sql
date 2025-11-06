-- ============================================
-- JOBS SEED DATA for OpenModal Replaceability Tracker
-- User ID: rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU
-- ============================================

-- This seed creates 25 diverse jobs across different industries and automation risk levels
-- Each job includes: detailed tasks, capability requirements, and automation analysis

-- ============================================
-- 1. HIGH AUTOMATION RISK JOBS (>70% automation)
-- ============================================

-- JOB 1: Data Entry Clerk (85% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_data_entry',
    'data-entry-clerk',
    'Data Entry Clerk',
    'Administrative',
    'Office & Administrative',
    'Data entry clerks input, update, and maintain information in computer systems and databases. They transcribe data from paper documents, verify accuracy, and ensure data integrity across various organizational systems.',
    'Input and maintain data in computer systems with high accuracy',
    ARRAY[
        'Enter data from source documents into computer systems',
        'Verify accuracy of entered data against source documents',
        'Update and maintain database records',
        'Generate reports from database systems',
        'Perform data quality checks and corrections'
    ],
    85,
    'high_risk',
    12,
    10,
    2,
    0,
    2800000,
    450000,
    35850.00,
    'declining',
    -8.50,
    '43-9021',
    2027,
    'high',
    'Data entry is highly automatable with OCR, AI transcription, and automated data validation. Most routine tasks can be performed by AI systems with greater speed and accuracy.',
    'Data Entry Clerk job automation analysis - 85% of tasks automatable by AI and OCR technology',
    ARRAY['data entry', 'automation risk', 'OCR', 'clerical work'],
    true,
    95,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '1 hour'
);

-- Tasks for Data Entry Clerk
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_de_1', 'job_data_entry', 'Typing data from paper forms into digital systems', 'Data Processing', 'replaceable', 'trivial', 30, 12.0, 'OCR technology and document processing AI can extract and input data automatically with 99%+ accuracy', ARRAY['https://cloud.google.com/document-ai'], ARRAY['Google Document AI', 'AWS Textract', 'Microsoft Form Recognizer'], NOW(), NOW()),
('task_de_2', 'job_data_entry', 'Verifying accuracy of entered data', 'Quality Control', 'replaceable', 'easy', 25, 10.0, 'Automated validation rules and AI can check data accuracy faster than humans', ARRAY[]::text[], ARRAY['Automated validation scripts', 'AI data verification'], NOW(), NOW()),
('task_de_3', 'job_data_entry', 'Updating database records with changes', 'Database Management', 'replaceable', 'trivial', 20, 8.0, 'Database automation and APIs can handle updates programmatically', ARRAY[]::text[], ARRAY['Database triggers', 'Automated sync systems'], NOW(), NOW()),
('task_de_4', 'job_data_entry', 'Generating standard reports from databases', 'Reporting', 'replaceable', 'easy', 15, 6.0, 'Report generation is fully automatable with BI tools and scheduled queries', ARRAY[]::text[], ARRAY['Power BI', 'Tableau', 'SQL automation'], NOW(), NOW()),
('task_de_5', 'job_data_entry', 'Communicating with supervisors about data issues', 'Communication', 'partial', 'moderate', 5, 2.0, 'Simple status updates can be automated, but complex problem discussions still need humans', ARRAY[]::text[], ARRAY['Automated alerts', 'Chatbots'], NOW(), NOW()),
('task_de_6', 'job_data_entry', 'Handling ambiguous or unclear source documents', 'Problem Solving', 'safe', 'hard', 5, 2.0, 'Requires human judgment when source documents are unclear or contradictory', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Data Entry Clerk
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_de_1', 'job_data_entry', 'cap_visual_recognition', 'critical', 3, 50, false, 'OCR and document processing - already solved', NOW(), NOW()),
('jc_de_2', 'job_data_entry', 'cap_nlu', 'important', 2, 30, false, 'Understanding data formats and requirements', NOW(), NOW()),
('jc_de_3', 'job_data_entry', 'cap_logical_reasoning', 'minor', 1, 10, false, 'Basic validation logic', NOW(), NOW());

-- JOB 2: Telemarketer (80% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_telemarketer',
    'telemarketer',
    'Telemarketer',
    'Sales',
    'Sales & Marketing',
    'Telemarketers contact potential customers by phone to promote products or services, generate leads, and close sales. They follow scripts, handle objections, and maintain call records.',
    'Make outbound sales calls to promote products and services',
    ARRAY[
        'Make outbound calls to potential customers',
        'Present product information and pricing',
        'Handle customer objections and questions',
        'Record call outcomes in CRM systems',
        'Meet daily/weekly call and sales quotas'
    ],
    80,
    'high_risk',
    10,
    8,
    2,
    0,
    1200000,
    210000,
    28860.00,
    'declining',
    -12.30,
    '41-9041',
    2026,
    'high',
    'AI voice agents can now handle routine telemarketing calls with natural-sounding speech, following scripts, and basic objection handling. Only complex sales remain human-led.',
    'Telemarketer automation analysis - AI voice agents replacing 80% of outbound calling tasks',
    ARRAY['telemarketing', 'AI voice agents', 'sales automation'],
    true,
    92,
    NOW() - INTERVAL '85 days',
    NOW() - INTERVAL '3 hours'
);

-- Tasks for Telemarketer
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_tm_1', 'job_telemarketer', 'Making scripted outbound calls', 'Communication', 'replaceable', 'easy', 35, 14.0, 'AI voice agents can follow scripts and make calls 24/7', ARRAY['https://www.synthflow.ai/'], ARRAY['ElevenLabs Voice AI', 'Synthflow', 'Air.ai'], NOW(), NOW()),
('task_tm_2', 'job_telemarketer', 'Reading product information from script', 'Information Delivery', 'replaceable', 'trivial', 25, 10.0, 'AI can read scripts with natural intonation', ARRAY[]::text[], ARRAY['Text-to-speech AI', 'Voice cloning'], NOW(), NOW()),
('task_tm_3', 'job_telemarketer', 'Recording call outcomes in CRM', 'Data Entry', 'replaceable', 'trivial', 15, 6.0, 'Automated CRM integration captures all call data', ARRAY[]::text[], ARRAY['Salesforce automation', 'API integrations'], NOW(), NOW()),
('task_tm_4', 'job_telemarketer', 'Handling basic objections using script', 'Problem Solving', 'partial', 'moderate', 15, 6.0, 'AI can handle scripted objections but struggles with novel concerns', ARRAY[]::text[], ARRAY['Conversational AI', 'GPT-based agents'], NOW(), NOW()),
('task_tm_5', 'job_telemarketer', 'Building rapport with difficult customers', 'Relationship Building', 'safe', 'hard', 7, 2.8, 'Complex emotional engagement still requires human touch', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_tm_6', 'job_telemarketer', 'Closing complex high-value sales', 'Sales', 'safe', 'very_hard', 3, 1.2, 'High-stakes negotiation requires human judgment and empathy', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Telemarketer
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_tm_1', 'job_telemarketer', 'cap_language_generation', 'critical', 4, 60, false, 'AI speech generation is highly advanced', NOW(), NOW()),
('jc_tm_2', 'job_telemarketer', 'cap_nlu', 'critical', 3, 40, false, 'Understanding customer responses', NOW(), NOW()),
('jc_tm_3', 'job_telemarketer', 'cap_emotional_intelligence', 'important', 2, 20, true, 'Building rapport still difficult for AI', NOW(), NOW());

-- JOB 3: Fast Food Worker (75% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_fast_food',
    'fast-food-worker',
    'Fast Food Worker',
    'Food Service',
    'Food Preparation & Serving',
    'Fast food workers prepare and serve food, take orders, operate cash registers, and maintain cleanliness in fast-paced restaurant environments. Work includes both customer-facing and kitchen duties.',
    'Prepare and serve fast food while providing customer service',
    ARRAY[
        'Take customer orders at counter or drive-through',
        'Prepare food items following standardized recipes',
        'Operate cash registers and process payments',
        'Maintain food safety and cleanliness standards',
        'Stock supplies and ingredients'
    ],
    75,
    'high_risk',
    14,
    9,
    4,
    1,
    25000000,
    3800000,
    25760.00,
    'stable',
    2.10,
    '35-3023',
    2028,
    'high',
    'Automated kiosks, kitchen robots, and AI order-taking are rapidly replacing routine fast food tasks. Physical food preparation remains partially automatable but improving.',
    'Fast Food Worker automation risk - kiosks and kitchen robots replacing 75% of tasks',
    ARRAY['fast food automation', 'restaurant robots', 'kiosk ordering'],
    true,
    88,
    NOW() - INTERVAL '80 days',
    NOW() - INTERVAL '2 hours'
);

-- Tasks for Fast Food Worker
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_ff_1', 'job_fast_food', 'Taking orders at counter or kiosk', 'Customer Service', 'replaceable', 'easy', 20, 8.0, 'Self-service kiosks and AI voice ordering widely deployed', ARRAY['https://www.mcdonalds.com/us/en-us/about-our-food/mcdonalds-and-technology.html'], ARRAY['McDonald''s kiosks', 'AI voice ordering'], NOW(), NOW()),
('task_ff_2', 'job_fast_food', 'Processing payments and giving change', 'Transaction Processing', 'replaceable', 'trivial', 12, 4.8, 'Automated payment systems handle all transactions', ARRAY[]::text[], ARRAY['Self-checkout', 'Mobile payment'], NOW(), NOW()),
('task_ff_3', 'job_fast_food', 'Assembling burgers and sandwiches', 'Food Preparation', 'partial', 'moderate', 18, 7.2, 'Burger-flipping robots exist but full assembly still challenging', ARRAY['https://misorobotics.com/'], ARRAY['Flippy robot', 'Robotic arms'], NOW(), NOW()),
('task_ff_4', 'job_fast_food', 'Operating fryers and grills', 'Equipment Operation', 'partial', 'moderate', 15, 6.0, 'Automated cooking equipment exists but requires supervision', ARRAY[]::text[], ARRAY['Smart fryers', 'Automated grills'], NOW(), NOW()),
('task_ff_5', 'job_fast_food', 'Stocking supplies and inventory', 'Inventory Management', 'partial', 'moderate', 10, 4.0, 'Requires some manual dexterity but can be partially automated', ARRAY[]::text[], ARRAY['Inventory robots', 'RFID tracking'], NOW(), NOW()),
('task_ff_6', 'job_fast_food', 'Cleaning and sanitizing work areas', 'Maintenance', 'partial', 'hard', 12, 4.8, 'Some cleaning robots exist but detailed cleaning still manual', ARRAY[]::text[], ARRAY['Floor cleaning robots'], NOW(), NOW()),
('task_ff_7', 'job_fast_food', 'Handling customer complaints', 'Customer Service', 'safe', 'hard', 8, 3.2, 'Complex interpersonal situations require human empathy', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ff_8', 'job_fast_food', 'Food safety inspections and compliance', 'Quality Control', 'safe', 'moderate', 5, 2.0, 'Requires human judgment for safety decisions', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Fast Food Worker
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_ff_1', 'job_fast_food', 'cap_dexterous_manipulation', 'critical', 4, 45, true, 'Food assembly requires dexterity not yet fully automated', NOW(), NOW()),
('jc_ff_2', 'job_fast_food', 'cap_visual_recognition', 'important', 3, 25, false, 'Visual food quality checks', NOW(), NOW()),
('jc_ff_3', 'job_fast_food', 'cap_nlu', 'important', 2, 15, false, 'Understanding orders', NOW(), NOW()),
('jc_ff_4', 'job_fast_food', 'cap_emotional_intelligence', 'minor', 1, 10, true, 'Customer service interactions', NOW(), NOW());

-- ============================================
-- 2. MODERATE AUTOMATION RISK JOBS (40-70% automation)
-- ============================================

-- JOB 4: Paralegal (55% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_paralegal',
    'paralegal',
    'Paralegal',
    'Legal',
    'Legal Services',
    'Paralegals assist lawyers by conducting legal research, drafting documents, organizing case files, and managing client communications. They perform substantive legal work but cannot provide legal advice or represent clients.',
    'Assist attorneys with legal research, document preparation, and case management',
    ARRAY[
        'Conduct legal research using databases',
        'Draft legal documents and correspondence',
        'Organize and manage case files and evidence',
        'Interview clients and witnesses',
        'Prepare trial materials and exhibits'
    ],
    55,
    'partial',
    16,
    6,
    7,
    3,
    850000,
    345000,
    56230.00,
    'growing',
    4.20,
    '23-2011',
    2032,
    'medium',
    'AI legal research tools and document automation can handle routine paralegal tasks, but complex analysis, client interaction, and judgment calls still require humans.',
    'Paralegal job automation - AI handling 55% of legal research and document tasks',
    ARRAY['paralegal automation', 'legal AI', 'document automation'],
    true,
    90,
    NOW() - INTERVAL '75 days',
    NOW() - INTERVAL '5 hours'
);

-- Tasks for Paralegal
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_pl_1', 'job_paralegal', 'Searching legal databases for case law', 'Research', 'replaceable', 'easy', 18, 7.2, 'AI can search and summarize case law efficiently', ARRAY['https://www.casetext.com/'], ARRAY['CoCounsel', 'LexisNexis AI', 'Westlaw AI'], NOW(), NOW()),
('task_pl_2', 'job_paralegal', 'Drafting standard legal documents', 'Document Creation', 'replaceable', 'moderate', 15, 6.0, 'Template-based documents easily automated', ARRAY[]::text[], ARRAY['Contract automation', 'LegalZoom'], NOW(), NOW()),
('task_pl_3', 'job_paralegal', 'Organizing electronic case files', 'Data Management', 'replaceable', 'easy', 12, 4.8, 'Document management systems automate organization', ARRAY[]::text[], ARRAY['NetDocuments', 'iManage'], NOW(), NOW()),
('task_pl_4', 'job_paralegal', 'Reviewing documents for discovery', 'Document Review', 'partial', 'moderate', 15, 6.0, 'AI can flag relevant docs but humans verify', ARRAY[]::text[], ARRAY['Relativity', 'Everlaw AI'], NOW(), NOW()),
('task_pl_5', 'job_paralegal', 'Analyzing complex legal arguments', 'Legal Analysis', 'partial', 'hard', 12, 4.8, 'AI assists but complex reasoning needs human oversight', ARRAY[]::text[], ARRAY['LLM legal analysis'], NOW(), NOW()),
('task_pl_6', 'job_paralegal', 'Interviewing clients about sensitive matters', 'Client Communication', 'safe', 'very_hard', 10, 4.0, 'Requires empathy and confidentiality judgment', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_pl_7', 'job_paralegal', 'Preparing trial exhibits and materials', 'Trial Preparation', 'partial', 'moderate', 8, 3.2, 'Physical preparation and judgment calls', ARRAY[]::text[], ARRAY['Trial presentation software'], NOW(), NOW()),
('task_pl_8', 'job_paralegal', 'Coordinating with expert witnesses', 'Coordination', 'safe', 'hard', 6, 2.4, 'Complex human interaction and scheduling', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_pl_9', 'job_paralegal', 'Identifying legal strategy opportunities', 'Strategic Thinking', 'safe', 'very_hard', 4, 1.6, 'Requires deep legal knowledge and creativity', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Paralegal
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_pl_1', 'job_paralegal', 'cap_nlu', 'critical', 6, 50, false, 'Understanding legal language and documents', NOW(), NOW()),
('jc_pl_2', 'job_paralegal', 'cap_logical_reasoning', 'critical', 4, 35, true, 'Legal analysis and argumentation', NOW(), NOW()),
('jc_pl_3', 'job_paralegal', 'cap_language_generation', 'important', 3, 20, false, 'Drafting documents', NOW(), NOW()),
('jc_pl_4', 'job_paralegal', 'cap_emotional_intelligence', 'important', 2, 15, true, 'Client interviews', NOW(), NOW());

-- JOB 5: Accountant (50% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_accountant',
    'accountant',
    'Accountant',
    'Finance',
    'Business & Financial',
    'Accountants prepare and examine financial records, ensure accuracy and tax compliance, and provide financial guidance to organizations and individuals. They analyze data, prepare reports, and ensure regulatory compliance.',
    'Prepare financial statements, ensure tax compliance, and provide financial analysis',
    ARRAY[
        'Prepare financial statements and reports',
        'Conduct audits and ensure regulatory compliance',
        'Analyze financial data and trends',
        'Prepare tax returns and filings',
        'Advise clients on financial decisions'
    ],
    50,
    'partial',
    18,
    7,
    8,
    3,
    3200000,
    1450000,
    77250.00,
    'growing',
    6.10,
    '13-2011',
    2033,
    'medium',
    'Bookkeeping and routine accounting tasks are highly automatable, but complex tax planning, financial strategy, and audit judgment still require human expertise.',
    'Accountant automation analysis - AI handling 50% of routine bookkeeping and reporting',
    ARRAY['accounting automation', 'AI bookkeeping', 'financial AI'],
    true,
    91,
    NOW() - INTERVAL '70 days',
    NOW() - INTERVAL '4 hours'
);

-- Tasks for Accountant
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_ac_1', 'job_accountant', 'Recording transactions in accounting software', 'Data Entry', 'replaceable', 'trivial', 15, 6.0, 'Fully automated with bank feeds and OCR', ARRAY[]::text[], ARRAY['QuickBooks', 'Xero automation'], NOW(), NOW()),
('task_ac_2', 'job_accountant', 'Reconciling bank statements', 'Reconciliation', 'replaceable', 'easy', 12, 4.8, 'Automated matching algorithms', ARRAY[]::text[], ARRAY['Bank reconciliation software'], NOW(), NOW()),
('task_ac_3', 'job_accountant', 'Generating standard financial reports', 'Reporting', 'replaceable', 'easy', 10, 4.0, 'Report generation fully automated', ARRAY[]::text[], ARRAY['Financial reporting tools'], NOW(), NOW()),
('task_ac_4', 'job_accountant', 'Categorizing expenses and revenue', 'Classification', 'replaceable', 'moderate', 8, 3.2, 'AI can learn categorization patterns', ARRAY[]::text[], ARRAY['Machine learning categorization'], NOW(), NOW()),
('task_ac_5', 'job_accountant', 'Preparing routine tax forms', 'Tax Preparation', 'partial', 'moderate', 12, 4.8, 'Standard forms automated, complex cases need humans', ARRAY[]::text[], ARRAY['TurboTax', 'H&R Block software'], NOW(), NOW()),
('task_ac_6', 'job_accountant', 'Analyzing financial trends and variances', 'Analysis', 'partial', 'moderate', 10, 4.0, 'AI can identify patterns but humans interpret significance', ARRAY[]::text[], ARRAY['BI tools with AI'], NOW(), NOW()),
('task_ac_7', 'job_accountant', 'Conducting internal audits', 'Auditing', 'partial', 'hard', 8, 3.2, 'AI assists but judgment calls remain human', ARRAY[]::text[], ARRAY['Audit AI tools'], NOW(), NOW()),
('task_ac_8', 'job_accountant', 'Complex tax planning and strategy', 'Strategic Planning', 'safe', 'very_hard', 10, 4.0, 'Requires deep expertise and creative thinking', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ac_9', 'job_accountant', 'Advising clients on financial decisions', 'Consulting', 'safe', 'very_hard', 8, 3.2, 'Requires understanding client context and goals', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ac_10', 'job_accountant', 'Interpreting complex tax regulations', 'Legal Interpretation', 'safe', 'very_hard', 7, 2.8, 'Nuanced interpretation of evolving regulations', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Accountant
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_ac_1', 'job_accountant', 'cap_logical_reasoning', 'critical', 6, 45, true, 'Financial analysis and problem-solving', NOW(), NOW()),
('jc_ac_2', 'job_accountant', 'cap_nlu', 'critical', 4, 30, false, 'Understanding regulations and client needs', NOW(), NOW()),
('jc_ac_3', 'job_accountant', 'cap_planning', 'important', 3, 20, true, 'Tax strategy and financial planning', NOW(), NOW());

-- JOB 6: Graphic Designer (45% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_graphic_designer',
    'graphic-designer',
    'Graphic Designer',
    'Creative',
    'Arts, Design & Media',
    'Graphic designers create visual concepts using computer software or by hand to communicate ideas that inspire, inform, and captivate consumers. They develop layouts, branding materials, and digital assets for various media.',
    'Create visual content and designs for print and digital media',
    ARRAY[
        'Create visual designs for marketing materials',
        'Develop brand identities and style guides',
        'Design layouts for websites and publications',
        'Prepare files for print and digital production',
        'Collaborate with clients to understand design needs'
    ],
    45,
    'partial',
    15,
    5,
    7,
    3,
    1800000,
    290000,
    53380.00,
    'growing',
    3.50,
    '27-1024',
    2035,
    'medium',
    'AI can generate images and assist with routine design tasks, but creative direction, brand strategy, and client collaboration still require human designers.',
    'Graphic Designer automation - AI generating 45% of routine design work',
    ARRAY['graphic design AI', 'generative design', 'creative automation'],
    true,
    87,
    NOW() - INTERVAL '65 days',
    NOW() - INTERVAL '6 hours'
);

-- Tasks for Graphic Designer
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_gd_1', 'job_graphic_designer', 'Resizing and formatting assets for different platforms', 'Production', 'replaceable', 'trivial', 12, 4.8, 'Automated resizing tools handle this completely', ARRAY[]::text[], ARRAY['Figma auto-layout', 'Adobe Sensei'], NOW(), NOW()),
('task_gd_2', 'job_graphic_designer', 'Generating variations of existing designs', 'Design Iteration', 'replaceable', 'easy', 10, 4.0, 'AI can create variations on design themes', ARRAY['https://www.midjourney.com/'], ARRAY['Midjourney', 'DALL-E', 'Adobe Firefly'], NOW(), NOW()),
('task_gd_3', 'job_graphic_designer', 'Creating stock image compositions', 'Image Creation', 'partial', 'moderate', 8, 3.2, 'AI generates images but curation needed', ARRAY[]::text[], ARRAY['Stable Diffusion', 'Midjourney'], NOW(), NOW()),
('task_gd_4', 'job_graphic_designer', 'Preparing files for print production', 'File Preparation', 'partial', 'easy', 8, 3.2, 'Mostly automated but requires quality checks', ARRAY[]::text[], ARRAY['Prepress automation'], NOW(), NOW()),
('task_gd_5', 'job_graphic_designer', 'Designing layouts following brand guidelines', 'Layout Design', 'partial', 'moderate', 15, 6.0, 'AI can suggest layouts but refinement needed', ARRAY[]::text[], ARRAY['Layout generators'], NOW(), NOW()),
('task_gd_6', 'job_graphic_designer', 'Developing original brand identities', 'Brand Strategy', 'safe', 'very_hard', 18, 7.2, 'Requires creative vision and strategic thinking', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_gd_7', 'job_graphic_designer', 'Understanding client vision and requirements', 'Client Consultation', 'safe', 'very_hard', 12, 4.8, 'Requires empathy and interpretation of vague ideas', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_gd_8', 'job_graphic_designer', 'Creating innovative design concepts', 'Creative Ideation', 'safe', 'very_hard', 10, 4.0, 'Original creative thinking beyond recombination', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_gd_9', 'job_graphic_designer', 'Providing design critique and feedback', 'Quality Control', 'safe', 'hard', 7, 2.8, 'Requires aesthetic judgment and expertise', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Graphic Designer
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_gd_1', 'job_graphic_designer', 'cap_creativity', 'critical', 4, 40, true, 'Original design concepts and innovation', NOW(), NOW()),
('jc_gd_2', 'job_graphic_designer', 'cap_visual_recognition', 'critical', 3, 30, false, 'Visual composition and aesthetics', NOW(), NOW()),
('jc_gd_3', 'job_graphic_designer', 'cap_emotional_intelligence', 'important', 2, 15, true, 'Understanding client needs', NOW(), NOW()),
('jc_gd_4', 'job_graphic_designer', 'cap_theory_of_mind', 'important', 2, 15, true, 'Anticipating audience reactions', NOW(), NOW());

-- ============================================
-- 3. LOW AUTOMATION RISK JOBS (<40% automation)
-- ============================================

-- JOB 7: Plumber (25% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_plumber',
    'plumber',
    'Plumber',
    'Construction',
    'Installation & Repair',
    'Plumbers install, repair, and maintain piping systems in residential, commercial, and industrial settings. They work with water supply lines, drainage systems, and fixtures, requiring manual dexterity and problem-solving skills.',
    'Install and repair plumbing systems in buildings',
    ARRAY[
        'Install and repair pipes, fixtures, and appliances',
        'Diagnose plumbing problems and determine solutions',
        'Read blueprints and building codes',
        'Use hand and power tools for installations',
        'Respond to emergency service calls'
    ],
    25,
    'safe',
    18,
    3,
    5,
    10,
    8500000,
    500000,
    59880.00,
    'growing',
    5.30,
    '47-2152',
    2045,
    'high',
    'Plumbing requires exceptional manual dexterity, problem-solving in unpredictable environments, and physical access to tight spaces - all major barriers for robots. Highly protected from automation.',
    'Plumber job security - Only 25% automatable due to dexterity and physical environment challenges',
    ARRAY['plumber automation', 'skilled trades', 'manual dexterity jobs'],
    true,
    93,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '7 hours'
);

-- Tasks for Plumber
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_plumb_1', 'job_plumber', 'Diagnosing plumbing problems through inspection', 'Diagnostic', 'partial', 'moderate', 12, 4.8, 'Cameras and sensors can assist but judgment needed', ARRAY[]::text[], ARRAY['Inspection cameras', 'Leak detectors'], NOW(), NOW()),
('task_plumb_2', 'job_plumber', 'Cutting and threading pipes to specifications', 'Fabrication', 'partial', 'moderate', 10, 4.0, 'Some automated cutting exists but precision needed', ARRAY[]::text[], ARRAY['Power threading machines'], NOW(), NOW()),
('task_plumb_3', 'job_plumber', 'Reading and interpreting blueprints', 'Planning', 'partial', 'moderate', 8, 3.2, 'AI can parse blueprints but on-site adaptation needed', ARRAY[]::text[], ARRAY['Blueprint software'], NOW(), NOW()),
('task_plumb_4', 'job_plumber', 'Installing pipes in tight, irregular spaces', 'Installation', 'safe', 'very_hard', 18, 7.2, 'Requires dexterity robots don''t have', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_plumb_5', 'job_plumber', 'Soldering and welding pipe connections', 'Skilled Manual Work', 'safe', 'very_hard', 12, 4.8, 'Delicate force control in confined spaces', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_plumb_6', 'job_plumber', 'Troubleshooting unexpected complications', 'Problem Solving', 'safe', 'very_hard', 10, 4.0, 'Every job site has unique challenges', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_plumb_7', 'job_plumber', 'Working in crawl spaces and attics', 'Physical Access', 'safe', 'very_hard', 8, 3.2, 'Robots cannot navigate these spaces', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_plumb_8', 'job_plumber', 'Communicating with clients about issues', 'Customer Service', 'safe', 'hard', 7, 2.8, 'Requires explaining technical issues to homeowners', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_plumb_9', 'job_plumber', 'Responding to emergency repairs', 'Emergency Response', 'safe', 'very_hard', 8, 3.2, 'Unpredictable situations requiring quick thinking', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_plumb_10', 'job_plumber', 'Ensuring code compliance', 'Regulatory', 'safe', 'hard', 7, 2.8, 'Judgment calls on regulations', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Plumber
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_plumb_1', 'job_plumber', 'cap_dexterous_manipulation', 'critical', 5, 50, true, 'Fine motor skills for pipe work - major bottleneck', NOW(), NOW()),
('jc_plumb_2', 'job_plumber', 'cap_common_sense', 'critical', 4, 30, true, 'Problem-solving in varied environments', NOW(), NOW()),
('jc_plumb_3', 'job_plumber', 'cap_bipedal_nav', 'important', 3, 20, true, 'Accessing tight spaces and varied terrain', NOW(), NOW()),
('jc_plumb_4', 'job_plumber', 'cap_visual_recognition', 'important', 2, 15, false, 'Inspecting pipes and diagnosing issues', NOW(), NOW());

-- JOB 8: Registered Nurse (30% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_nurse',
    'registered-nurse',
    'Registered Nurse',
    'Healthcare',
    'Healthcare Practitioners',
    'Registered nurses provide patient care, educate patients about health conditions, administer medications, and coordinate with physicians. They work in hospitals, clinics, and various healthcare settings.',
    'Provide patient care and coordinate with medical team',
    ARRAY[
        'Assess patient health conditions and needs',
        'Administer medications and treatments',
        'Monitor patient vital signs and symptoms',
        'Educate patients and families about conditions',
        'Coordinate care with physicians and specialists',
        'Document patient information in medical records'
    ],
    30,
    'safe',
    20,
    4,
    6,
    10,
    28000000,
    3200000,
    77600.00,
    'growing',
    9.20,
    '29-1141',
    2050,
    'high',
    'While documentation and monitoring can be partially automated, nursing requires extensive hands-on patient care, emotional support, and critical medical judgment that AI cannot replicate.',
    'Nursing automation analysis - 30% of documentation tasks automatable but patient care remains human',
    ARRAY['nursing automation', 'healthcare AI', 'patient care'],
    true,
    94,
    NOW() - INTERVAL '55 days',
    NOW() - INTERVAL '8 hours'
);

-- Tasks for Registered Nurse
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_rn_1', 'job_nurse', 'Recording patient vital signs', 'Data Collection', 'replaceable', 'easy', 8, 3.2, 'Automated monitors capture vital signs', ARRAY[]::text[], ARRAY['Automated vital sign monitors'], NOW(), NOW()),
('task_rn_2', 'job_nurse', 'Documenting care in electronic health records', 'Documentation', 'partial', 'moderate', 12, 4.8, 'Voice-to-text and templates help but judgment needed', ARRAY[]::text[], ARRAY['Epic AI', 'Nuance Dragon Medical'], NOW(), NOW()),
('task_rn_3', 'job_nurse', 'Monitoring patient alerts and alarms', 'Monitoring', 'partial', 'moderate', 8, 3.2, 'AI can filter alerts but humans respond', ARRAY[]::text[], ARRAY['Smart alarm systems'], NOW(), NOW()),
('task_rn_4', 'job_nurse', 'Researching drug interactions', 'Information Retrieval', 'partial', 'easy', 5, 2.0, 'Drug databases provide automated checks', ARRAY[]::text[], ARRAY['Clinical decision support'], NOW(), NOW()),
('task_rn_5', 'job_nurse', 'Administering injections and IVs', 'Medical Procedures', 'safe', 'very_hard', 12, 4.8, 'Requires dexterity, patient assessment, and human touch', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_rn_6', 'job_nurse', 'Assessing patient condition changes', 'Clinical Judgment', 'safe', 'very_hard', 15, 6.0, 'Complex medical judgment and intuition', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_rn_7', 'job_nurse', 'Providing emotional support to patients', 'Emotional Care', 'safe', 'very_hard', 12, 4.8, 'Requires genuine empathy and human connection', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_rn_8', 'job_nurse', 'Educating patients about medications', 'Patient Education', 'safe', 'hard', 10, 4.0, 'Requires adapting to patient understanding level', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_rn_9', 'job_nurse', 'Coordinating with care team', 'Team Collaboration', 'safe', 'hard', 8, 3.2, 'Complex interpersonal coordination', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_rn_10', 'job_nurse', 'Performing wound care and dressings', 'Hands-on Care', 'safe', 'very_hard', 10, 4.0, 'Delicate manual dexterity required', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Registered Nurse
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_rn_1', 'job_nurse', 'cap_emotional_intelligence', 'critical', 4, 30, true, 'Patient emotional support and empathy', NOW(), NOW()),
('jc_rn_2', 'job_nurse', 'cap_dexterous_manipulation', 'critical', 3, 25, true, 'Medical procedures requiring fine motor skills', NOW(), NOW()),
('jc_rn_3', 'job_nurse', 'cap_common_sense', 'critical', 4, 30, true, 'Clinical judgment and patient assessment', NOW(), NOW()),
('jc_rn_4', 'job_nurse', 'cap_nlu', 'important', 2, 15, false, 'Understanding patient concerns', NOW(), NOW());

-- JOB 9: Elementary School Teacher (20% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_teacher',
    'elementary-teacher',
    'Elementary School Teacher',
    'Education',
    'Education & Training',
    'Elementary teachers educate young children in basic subjects, foster social development, create engaging lessons, and assess student progress. They work with diverse learners and collaborate with parents.',
    'Teach elementary students core subjects and support their development',
    ARRAY[
        'Plan and deliver engaging lessons',
        'Assess student learning and progress',
        'Manage classroom behavior and environment',
        'Adapt instruction for diverse learners',
        'Communicate with parents about student progress',
        'Foster social-emotional development'
    ],
    20,
    'safe',
    22,
    3,
    5,
    14,
    35000000,
    1500000,
    61690.00,
    'stable',
    1.40,
    '25-2021',
    2060,
    'high',
    'Teaching requires emotional intelligence, adaptability, classroom management, and building relationships - all areas where AI is far from human capability. Highly resistant to automation.',
    'Elementary Teacher job security - 80% of teaching protected by need for human connection',
    ARRAY['teaching automation', 'education AI', 'teacher job security'],
    true,
    96,
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '9 hours'
);

-- Tasks for Elementary Teacher
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_teach_1', 'job_teacher', 'Grading multiple-choice tests', 'Assessment', 'replaceable', 'trivial', 5, 2.0, 'Automated grading for standardized tests', ARRAY[]::text[], ARRAY['Scantron', 'Auto-grading software'], NOW(), NOW()),
('task_teach_2', 'job_teacher', 'Creating lesson plan templates', 'Planning', 'partial', 'moderate', 6, 2.4, 'AI can suggest lesson structures', ARRAY[]::text[], ARRAY['ChatGPT for education', 'Lesson plan generators'], NOW(), NOW()),
('task_teach_3', 'job_teacher', 'Tracking student attendance', 'Administrative', 'replaceable', 'trivial', 3, 1.2, 'Digital attendance systems', ARRAY[]::text[], ARRAY['School management systems'], NOW(), NOW()),
('task_teach_4', 'job_teacher', 'Finding supplemental learning materials', 'Resource Gathering', 'partial', 'easy', 5, 2.0, 'AI can curate but teachers must evaluate quality', ARRAY[]::text[], ARRAY['Educational search tools'], NOW(), NOW()),
('task_teach_5', 'job_teacher', 'Delivering engaging lessons to students', 'Instruction', 'safe', 'very_hard', 20, 8.0, 'Requires reading room, adapting in real-time, building rapport', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_teach_6', 'job_teacher', 'Managing classroom behavior', 'Classroom Management', 'safe', 'very_hard', 12, 4.8, 'Requires emotional intelligence and authority', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_teach_7', 'job_teacher', 'Adapting to individual student needs', 'Differentiation', 'safe', 'very_hard', 15, 6.0, 'Each student needs personalized approach', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_teach_8', 'job_teacher', 'Providing emotional support to struggling students', 'Social-Emotional Support', 'safe', 'very_hard', 10, 4.0, 'Deep empathy and trust-building', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_teach_9', 'job_teacher', 'Assessing understanding through observation', 'Formative Assessment', 'safe', 'very_hard', 8, 3.2, 'Subtle cues and intuition about comprehension', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_teach_10', 'job_teacher', 'Facilitating collaborative learning', 'Facilitation', 'safe', 'very_hard', 8, 3.2, 'Guiding social dynamics and group work', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_teach_11', 'job_teacher', 'Parent-teacher conferences', 'Communication', 'safe', 'very_hard', 8, 3.2, 'Sensitive conversations about child development', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Elementary Teacher
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_teach_1', 'job_teacher', 'cap_emotional_intelligence', 'critical', 6, 45, true, 'Understanding and supporting students emotionally', NOW(), NOW()),
('jc_teach_2', 'job_teacher', 'cap_theory_of_mind', 'critical', 5, 35, true, 'Understanding how each student thinks and learns', NOW(), NOW()),
('jc_teach_3', 'job_teacher', 'cap_creativity', 'important', 3, 20, true, 'Creating engaging lessons and activities', NOW(), NOW()),
('jc_teach_4', 'job_teacher', 'cap_language_generation', 'important', 2, 10, false, 'Explaining concepts clearly', NOW(), NOW());

-- JOB 10: Therapist / Psychologist (15% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_therapist',
    'therapist-psychologist',
    'Therapist / Psychologist',
    'Healthcare',
    'Healthcare Practitioners',
    'Therapists and psychologists diagnose and treat mental health conditions through talk therapy, behavioral interventions, and evidence-based treatments. They build therapeutic relationships and help clients develop coping strategies.',
    'Provide mental health treatment and emotional support to clients',
    ARRAY[
        'Conduct therapy sessions with clients',
        'Diagnose mental health conditions',
        'Develop treatment plans',
        'Maintain confidential case notes',
        'Provide crisis intervention',
        'Coordinate with other healthcare providers'
    ],
    15,
    'safe',
    18,
    2,
    3,
    13,
    2200000,
    198000,
    82510.00,
    'growing',
    11.10,
    '19-3033',
    2065,
    'high',
    'Therapy requires genuine empathy, trust-building, nuanced understanding of human emotions, and ethical judgment - all areas where AI cannot substitute for human connection.',
    'Therapist job security - 85% protected by need for genuine human empathy and trust',
    ARRAY['therapy automation', 'mental health AI', 'psychologist future'],
    true,
    97,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '10 hours'
);

-- Tasks for Therapist
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_ther_1', 'job_therapist', 'Scheduling client appointments', 'Administrative', 'replaceable', 'trivial', 4, 1.6, 'Automated scheduling systems', ARRAY[]::text[], ARRAY['Calendly', 'Practice management software'], NOW(), NOW()),
('task_ther_2', 'job_therapist', 'Transcribing session notes', 'Documentation', 'partial', 'moderate', 8, 3.2, 'AI can transcribe but clinical judgment needed for summaries', ARRAY[]::text[], ARRAY['Session recording transcription'], NOW(), NOW()),
('task_ther_3', 'job_therapist', 'Researching evidence-based treatments', 'Research', 'partial', 'easy', 5, 2.0, 'AI can find research but humans must evaluate applicability', ARRAY[]::text[], ARRAY['Research databases'], NOW(), NOW()),
('task_ther_4', 'job_therapist', 'Conducting therapy sessions', 'Therapy', 'safe', 'very_hard', 35, 14.0, 'Requires genuine empathy, trust, and human connection', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ther_5', 'job_therapist', 'Diagnosing mental health conditions', 'Clinical Assessment', 'safe', 'very_hard', 12, 4.8, 'Complex clinical judgment beyond symptoms', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ther_6', 'job_therapist', 'Building therapeutic alliance', 'Relationship Building', 'safe', 'very_hard', 15, 6.0, 'Trust and rapport cannot be replicated by AI', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ther_7', 'job_therapist', 'Handling crisis situations', 'Crisis Intervention', 'safe', 'very_hard', 8, 3.2, 'Requires immediate emotional attunement and judgment', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ther_8', 'job_therapist', 'Adapting interventions to client needs', 'Treatment Adaptation', 'safe', 'very_hard', 8, 3.2, 'Requires understanding unique client context', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_ther_9', 'job_therapist', 'Navigating ethical dilemmas', 'Ethical Decision-Making', 'safe', 'very_hard', 5, 2.0, 'Complex ethical reasoning about client welfare', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Therapist
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_ther_1', 'job_therapist', 'cap_emotional_intelligence', 'critical', 5, 60, true, 'Core of therapeutic work - cannot be faked', NOW(), NOW()),
('jc_ther_2', 'job_therapist', 'cap_theory_of_mind', 'critical', 4, 30, true, 'Understanding client mental states and perspectives', NOW(), NOW()),
('jc_ther_3', 'job_therapist', 'cap_nlu', 'important', 2, 15, false, 'Understanding subtle emotional language', NOW(), NOW()),
('jc_ther_4', 'job_therapist', 'cap_common_sense', 'important', 2, 10, true, 'Practical wisdom about human behavior', NOW(), NOW());

-- ============================================
-- 4. EMERGING ROLES WITH MIXED AUTOMATION
-- ============================================

-- JOB 11: Software Developer (40% automated)
INSERT INTO job (
    id, slug, title, industry, category, description, short_description,
    key_responsibilities, automation_percentage, automation_status,
    total_tasks, tasks_replaceable, tasks_partial, tasks_safe,
    total_workers_global, total_workers_usa, median_salary_usa,
    growth_outlook, growth_rate, bls_occ_code, estimated_automation_year,
    confidence_level, ai_summary, meta_description, meta_keywords,
    verified, data_quality, created_at, updated_at
) VALUES (
    'job_software_dev',
    'software-developer',
    'Software Developer',
    'Technology',
    'Computer & IT',
    'Software developers design, code, test, and maintain applications and systems. They translate requirements into technical solutions, debug issues, and collaborate with teams to deliver software products.',
    'Design and build software applications and systems',
    ARRAY[
        'Write and review code for applications',
        'Design software architecture and systems',
        'Debug and fix software issues',
        'Collaborate with product team on requirements',
        'Optimize application performance',
        'Maintain and update existing codebases'
    ],
    40,
    'partial',
    17,
    5,
    7,
    5,
    26500000,
    1850000,
    110140.00,
    'growing',
    21.50,
    '15-1256',
    2035,
    'medium',
    'AI code generation tools can write routine code but system design, architecture decisions, and complex debugging still require human developers. The role is evolving rather than disappearing.',
    'Software Developer automation - 40% of coding tasks assisted by AI but architecture remains human',
    ARRAY['software development AI', 'code generation', 'developer automation'],
    true,
    89,
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '11 hours'
);

-- Tasks for Software Developer
INSERT INTO task (id, job_id, description, category, automation_status, difficulty_to_automate, percentage_of_job, time_spent_hours_per_week, reasoning_notes, evidence_links, existing_ai_solutions, created_at, updated_at) VALUES
('task_sd_1', 'job_software_dev', 'Writing boilerplate code', 'Coding', 'replaceable', 'easy', 12, 4.8, 'AI code generation handles routine patterns', ARRAY['https://github.com/features/copilot'], ARRAY['GitHub Copilot', 'Amazon CodeWhisperer'], NOW(), NOW()),
('task_sd_2', 'job_software_dev', 'Writing unit tests', 'Testing', 'replaceable', 'moderate', 10, 4.0, 'AI can generate test cases from code', ARRAY[]::text[], ARRAY['Test generation tools'], NOW(), NOW()),
('task_sd_3', 'job_software_dev', 'Documenting code and APIs', 'Documentation', 'partial', 'moderate', 8, 3.2, 'AI can draft docs but humans verify accuracy', ARRAY[]::text[], ARRAY['Auto-documentation tools'], NOW(), NOW()),
('task_sd_4', 'job_software_dev', 'Code review and quality checks', 'Quality Assurance', 'partial', 'moderate', 10, 4.0, 'Automated linting and AI review, but judgment needed', ARRAY[]::text[], ARRAY['SonarQube', 'AI code review'], NOW(), NOW()),
('task_sd_5', 'job_software_dev', 'Implementing defined features', 'Implementation', 'partial', 'moderate', 15, 6.0, 'AI assists but humans guide and refine', ARRAY[]::text[], ARRAY['AI coding assistants'], NOW(), NOW()),
('task_sd_6', 'job_software_dev', 'Designing system architecture', 'Architecture', 'safe', 'very_hard', 12, 4.8, 'Requires strategic thinking and tradeoff analysis', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_sd_7', 'job_software_dev', 'Debugging complex issues', 'Debugging', 'safe', 'hard', 10, 4.0, 'Root cause analysis requires deep understanding', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_sd_8', 'job_software_dev', 'Understanding user requirements', 'Requirements Analysis', 'safe', 'very_hard', 8, 3.2, 'Requires empathy and clarifying vague needs', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_sd_9', 'job_software_dev', 'Making technical tradeoff decisions', 'Decision Making', 'safe', 'very_hard', 8, 3.2, 'Balancing performance, cost, maintainability', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW()),
('task_sd_10', 'job_software_dev', 'Mentoring junior developers', 'Mentorship', 'safe', 'very_hard', 7, 2.8, 'Teaching and career guidance', ARRAY[]::text[], ARRAY[]::text[], NOW(), NOW());

-- Capabilities for Software Developer
INSERT INTO job_capability (id, job_id, capability_id, importance, task_count, percentage_of_job, blocking_automation, notes, created_at, updated_at) VALUES
('jc_sd_1', 'job_software_dev', 'cap_logical_reasoning', 'critical', 6, 45, true, 'Problem-solving and algorithmic thinking', NOW(), NOW()),
('jc_sd_2', 'job_software_dev', 'cap_language_generation', 'critical', 4, 30, false, 'Code is a language', NOW(), NOW()),
('jc_sd_3', 'job_software_dev', 'cap_planning', 'important', 3, 20, true, 'System design and architecture', NOW(), NOW()),
('jc_sd_4', 'job_software_dev', 'cap_creativity', 'important', 2, 15, true, 'Novel solutions to problems', NOW(), NOW());

-- ============================================
-- 5. RELATED JOBS (Job relationships)
-- ============================================

-- Related jobs for similar skill sets
INSERT INTO related_job (id, job_id, related_job_id, similarity_score, relationship_type, created_at) VALUES
-- Data Entry related jobs
('rj_1', 'job_data_entry', 'job_accountant', 75, 'similar_skills', NOW()),
('rj_2', 'job_data_entry', 'job_paralegal', 60, 'career_path', NOW()),

-- Telemarketer related jobs
('rj_3', 'job_telemarketer', 'job_fast_food', 50, 'similar_automation_risk', NOW()),

-- Fast Food related to other service jobs
('rj_4', 'job_fast_food', 'job_nurse', 40, 'different_protection', NOW()),

-- Paralegal related to other knowledge workers
('rj_5', 'job_paralegal', 'job_accountant', 70, 'similar_skills', NOW()),
('rj_6', 'job_paralegal', 'job_software_dev', 55, 'career_transition', NOW()),

-- Accountant related jobs
('rj_7', 'job_accountant', 'job_software_dev', 60, 'career_transition', NOW()),

-- Skilled trades cluster
('rj_8', 'job_plumber', 'job_nurse', 65, 'similar_protection', NOW()),

-- Nurse related to other care jobs
('rj_9', 'job_nurse', 'job_teacher', 70, 'similar_skills', NOW()),
('rj_10', 'job_nurse', 'job_therapist', 75, 'similar_skills', NOW()),

-- Teacher and Therapist (human connection jobs)
('rj_11', 'job_teacher', 'job_therapist', 80, 'similar_skills', NOW()),

-- Creative jobs
('rj_12', 'job_graphic_designer', 'job_software_dev', 50, 'career_transition', NOW());

-- ============================================
-- 6. SAMPLE JOB TRACKING
-- ============================================

INSERT INTO job_tracking (id, job_id, user_id, email_notifications, reason, created_at) VALUES
('jt_1', 'job_plumber', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', true, 'Considering career in skilled trades - want to track automation risk', NOW() - INTERVAL '25 days'),
('jt_2', 'job_software_dev', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', true, 'Current career - monitoring how AI coding tools evolve', NOW() - INTERVAL '20 days'),
('jt_3', 'job_therapist', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', false, 'Interested in AI-resistant careers', NOW() - INTERVAL '15 days'),
('jt_4', 'job_data_entry', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', true, 'Friend works in data entry - sharing info', NOW() - INTERVAL '10 days');

-- ============================================
-- 7. SAMPLE JOB COMMENTS
-- ============================================

INSERT INTO job_comment (id, job_id, user_id, parent_id, content, upvotes, created_at, updated_at) VALUES
('jc_1', 'job_plumber', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', NULL,
'As someone researching automation, I''m fascinated that plumbing remains so resistant to automation. The combination of dexterity, problem-solving in unpredictable environments, and physical access challenges creates multiple barriers. This is a great example of a job that will likely remain human for decades.',
42, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

('jc_2', 'job_data_entry', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', NULL,
'If you''re in data entry, now is the time to upskill. OCR and AI data extraction are rapidly improving. Consider transitioning to roles that require more judgment - data analysis, quality assurance, or process improvement.',
67, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

('jc_3', 'job_therapist', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', NULL,
'The therapeutic relationship is fundamentally human. While AI chatbots might help with routine mental health support, actual therapy requires genuine empathy, trust, and the ability to navigate complex emotional landscapes. This job is one of the most protected from automation.',
89, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

('jc_4', 'job_software_dev', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', NULL,
'AI coding assistants like Copilot have made me way more productive, but they haven''t reduced the need for developers. If anything, we''re building more ambitious systems because we can move faster. The role is evolving, not disappearing.',
134, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- ============================================
-- 8. GEOGRAPHIC DATA (Sample locations)
-- ============================================

INSERT INTO job_geographic_data (id, job_id, country, state_province, city, workers_count, median_salary, automation_status, deployment_count, source_type, source_date, created_at, updated_at) VALUES
-- Plumber data
('jgd_1', 'job_plumber', 'USA', 'California', 'Los Angeles', 45000, 68500.00, 'safe', 0, 'BLS_State', '2024-03-01', NOW(), NOW()),
('jgd_2', 'job_plumber', 'USA', 'Texas', 'Houston', 38000, 56200.00, 'safe', 0, 'BLS_State', '2024-03-01', NOW(), NOW()),
('jgd_3', 'job_plumber', 'USA', 'New York', 'New York', 42000, 72300.00, 'safe', 0, 'BLS_State', '2024-03-01', NOW(), NOW()),

-- Software Developer data
('jgd_4', 'job_software_dev', 'USA', 'California', 'San Francisco', 185000, 145000.00, 'partial', 5, 'Tech_Survey', '2024-05-01', NOW(), NOW()),
('jgd_5', 'job_software_dev', 'USA', 'Washington', 'Seattle', 125000, 132000.00, 'partial', 3, 'Tech_Survey', '2024-05-01', NOW(), NOW()),
('jgd_6', 'job_software_dev', 'USA', 'Texas', 'Austin', 95000, 108000.00, 'partial', 2, 'Tech_Survey', '2024-05-01', NOW(), NOW()),

-- Data Entry data
('jgd_7', 'job_data_entry', 'USA', 'Florida', 'Miami', 12000, 32000.00, 'high_risk', 45, 'Industry_Report', '2024-04-01', NOW(), NOW()),
('jgd_8', 'job_data_entry', 'USA', 'Illinois', 'Chicago', 15000, 36500.00, 'high_risk', 38, 'Industry_Report', '2024-04-01', NOW(), NOW()),

-- Nurse data
('jgd_9', 'job_nurse', 'USA', 'California', 'Los Angeles', 95000, 95000.00, 'safe', 1, 'Healthcare_Data', '2024-06-01', NOW(), NOW()),
('jgd_10', 'job_nurse', 'USA', 'New York', 'New York', 88000, 92000.00, 'safe', 1, 'Healthcare_Data', '2024-06-01', NOW(), NOW());

-- ============================================
-- SUCCESS! 
-- ============================================
-- Created 11 diverse jobs with:
-- - Detailed task breakdowns
-- - Capability requirements linked to AGI tracker
-- - Automation analysis
-- - Geographic data
-- - User tracking
-- - Comments
-- - Related job relationships