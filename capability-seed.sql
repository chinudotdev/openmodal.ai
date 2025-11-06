-- Seed data for OpenModal AGI Status Tracker
-- User ID for all user-related inserts: rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU

-- ============================================
-- 1. CAPABILITY CATEGORIES (5 core categories)
-- ============================================

INSERT INTO capability_category (id, slug, name, description, icon, created_at, updated_at) VALUES
('cat_perception', 'perception', 'Perception', 'AI systems that can sense and interpret the world through vision, hearing, and other senses', '👁️', NOW(), NOW()),
('cat_reasoning', 'reasoning', 'Reasoning', 'AI systems that can think logically, plan, learn, and make decisions', '🧮', NOW(), NOW()),
('cat_physical', 'physical', 'Physical', 'AI systems that can move and manipulate objects in the real world', '🦾', NOW(), NOW()),
('cat_social', 'social', 'Social', 'AI systems that can understand and interact with humans emotionally and socially', '💬', NOW(), NOW()),
('cat_meta', 'meta', 'Meta-Cognitive', 'AI systems with self-awareness, creativity, and self-improvement abilities', '🎨', NOW(), NOW());

-- ============================================
-- 2. ORGANIZATIONS (15 key organizations)
-- ============================================

INSERT INTO organization (id, name, description, website_url, created_at, updated_at) VALUES
('org_openai', 'OpenAI', 'AI research lab focused on developing safe AGI. Creator of GPT models, DALL-E, and ChatGPT.', 'https://openai.com', NOW(), NOW()),
('org_anthropic', 'Anthropic', 'AI safety company building reliable, interpretable, and steerable AI systems. Creator of Claude.', 'https://anthropic.com', NOW(), NOW()),
('org_deepmind', 'Google DeepMind', 'AI research lab focused on solving intelligence. Known for AlphaGo, AlphaFold, and Gemini.', 'https://deepmind.google', NOW(), NOW()),
('org_boston_dynamics', 'Boston Dynamics', 'Robotics company creating highly mobile robots like Atlas, Spot, and Stretch.', 'https://bostondynamics.com', NOW(), NOW()),
('org_figure', 'Figure AI', 'Humanoid robotics company building general-purpose robots for commercial deployment.', 'https://figure.ai', NOW(), NOW()),
('org_tesla', 'Tesla', 'Electric vehicle and clean energy company developing Optimus humanoid robot.', 'https://tesla.com', NOW(), NOW()),
('org_meta', 'Meta AI', 'AI research division of Meta focused on computer vision, NLP, and open-source AI models.', 'https://ai.meta.com', NOW(), NOW()),
('org_mit_csail', 'MIT CSAIL', 'MIT Computer Science and Artificial Intelligence Laboratory - leading academic AI research center.', 'https://csail.mit.edu', NOW(), NOW()),
('org_stanford_hai', 'Stanford HAI', 'Stanford Human-Centered Artificial Intelligence institute studying AI impact on society.', 'https://hai.stanford.edu', NOW(), NOW()),
('org_nvidia', 'NVIDIA', 'Computing platform company providing GPUs and AI infrastructure for training and inference.', 'https://nvidia.com', NOW(), NOW()),
('org_sanctuary', 'Sanctuary AI', 'Canadian robotics company developing Phoenix humanoid robot with human-like intelligence.', 'https://sanctuary.ai', NOW(), NOW()),
('org_cohere', 'Cohere', 'Enterprise AI platform providing large language models for business applications.', 'https://cohere.com', NOW(), NOW()),
('org_adept', 'Adept AI', 'AI research lab building a general intelligence system that can use digital tools.', 'https://adept.ai', NOW(), NOW()),
('org_mistral', 'Mistral AI', 'French AI company creating efficient open-source language models.', 'https://mistral.ai', NOW(), NOW()),
('org_ucberkeley', 'UC Berkeley AI Research', 'Leading academic AI research lab focusing on robotics, deep learning, and AI safety.', 'https://bair.berkeley.edu', NOW(), NOW());

-- ============================================
-- 3. CAPABILITIES (15 core capabilities)
-- ============================================

-- Capability 1: Visual Recognition (Perception - High Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_visual_recognition',
  'visual-recognition',
  'Visual Recognition',
  'cat_perception',
  'The ability to identify and classify objects, scenes, faces, and visual patterns in images and video.',
  'Computer vision systems using convolutional neural networks (CNNs), vision transformers, and multimodal models to process and understand visual data. Includes object detection, semantic segmentation, instance segmentation, and visual question answering.',
  'Visual recognition is fundamental to autonomous systems, security, healthcare diagnostics, and human-computer interaction. It enables machines to "see" and interpret the world.',
  90,
  'solved',
  'high',
  ARRAY['Object detection in clear conditions (95%+ accuracy)', 'Face recognition in controlled environments', 'Scene classification', 'OCR and document processing', 'Medical image classification'],
  ARRAY['Small object detection in cluttered scenes', 'Recognition in adverse weather/lighting', 'Fine-grained classification', 'Real-time processing on edge devices', 'Explaining reasoning behind classifications'],
  ARRAY['Consistent performance in all conditions', 'Perfect robustness to adversarial examples', 'Understanding visual context like humans'],
  'Largely solved for most commercial applications',
  'Near-human performance achieved in constrained environments; ongoing work on edge cases',
  2025,
  'Vision transformers and large-scale pretraining have revolutionized visual recognition. Models like CLIP and DINOv2 show strong zero-shot capabilities.',
  0,
  ARRAY[]::text[],
  45,
  NOW() - INTERVAL '15 days',
  2847,
  156,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '2 hours'
);

-- Capability 2: Natural Language Understanding (Perception - High Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_nlu',
  'natural-language-understanding',
  'Natural Language Understanding',
  'cat_perception',
  'The ability to comprehend, interpret, and extract meaning from human language in text and speech.',
  'Large language models (LLMs) based on transformer architecture processing text through attention mechanisms. Includes sentiment analysis, named entity recognition, question answering, and language translation.',
  'Language understanding is critical for human-AI communication, information retrieval, content moderation, and knowledge work automation.',
  85,
  'solved',
  'high',
  ARRAY['Text comprehension and summarization', 'Language translation (major languages)', 'Sentiment analysis', 'Intent classification', 'Question answering from text'],
  ARRAY['Understanding nuance, sarcasm, and context', 'Low-resource languages', 'Domain-specific terminology', 'Reasoning about ambiguous statements', 'Cultural context awareness'],
  ARRAY['True understanding vs pattern matching', 'Consistent logical reasoning', 'Common sense inference', 'Explaining all decisions'],
  'Major applications solved; edge cases ongoing',
  'GPT-4 and Claude show impressive language understanding but still make reasoning errors',
  2026,
  'Transformer models have achieved remarkable language understanding, but debate continues whether this constitutes "true" understanding or sophisticated pattern matching.',
  0,
  ARRAY[]::text[],
  78,
  NOW() - INTERVAL '8 days',
  3421,
  203,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '5 hours'
);

-- Capability 3: Logical Reasoning (Reasoning - Medium Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_logical_reasoning',
  'logical-reasoning',
  'Logical Reasoning',
  'cat_reasoning',
  'The ability to draw conclusions, solve problems through deduction and induction, and apply logical rules.',
  'Symbolic reasoning systems, neural-symbolic integration, chain-of-thought prompting, and theorem provers. Includes mathematical reasoning, logical inference, and formal verification.',
  'Logical reasoning is essential for scientific discovery, legal analysis, debugging, and any task requiring step-by-step problem solving.',
  60,
  'partial',
  'medium',
  ARRAY['Basic mathematical calculations', 'Simple logical puzzles', 'Pattern recognition in sequences', 'Formal logic in constrained domains', 'Following explicit rules'],
  ARRAY['Multi-step reasoning chains', 'Combining multiple constraints', 'Abstract reasoning', 'Detecting logical fallacies', 'Planning with uncertainty'],
  ARRAY['Consistent reasoning across contexts', 'Self-correction without hints', 'Original mathematical proofs', 'Perfect formal verification'],
  '5-10 years for human-level reasoning',
  'Significant progress with chain-of-thought and tree-of-thoughts, but still prone to errors',
  2030,
  'Recent techniques like chain-of-thought prompting show promise, but models still struggle with complex multi-step reasoning and often produce plausible-sounding but incorrect conclusions.',
  2500000,
  ARRAY['Mathematician', 'Theoretical Physicist', 'Philosophy Professor'],
  34,
  NOW() - INTERVAL '20 days',
  1876,
  98,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '1 day'
);

-- Capability 4: Common Sense Reasoning (Reasoning - Low-Medium Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_common_sense',
  'common-sense-reasoning',
  'Common Sense Reasoning',
  'cat_reasoning',
  'The ability to understand everyday physical and social situations using background knowledge that humans take for granted.',
  'Knowledge graphs, embodied AI, multimodal learning, and world models. Requires understanding physics, causality, social norms, and practical knowledge accumulated through experience.',
  'Common sense is fundamental to safe and useful AI that can operate in the real world without constant supervision or making absurd mistakes.',
  45,
  'partial',
  'low',
  ARRAY['Basic physical intuitions (objects fall down)', 'Simple social norms (be polite)', 'Everyday object affordances (cups hold liquids)', 'Temporal reasoning (day comes before night)'],
  ARRAY['Complex causal reasoning', 'Implicit social rules', 'Practical knowledge about materials', 'Understanding exceptions to rules', 'Predicting human reactions'],
  ARRAY['Intuitive physics like humans', 'Learning all common sense from text alone', 'Generalizing to novel situations reliably', 'Understanding "obvious" unwritten rules'],
  '10-15 years for robust common sense',
  'Hardest problem in AI; progress slower than expected',
  2035,
  'Common sense remains elusive because it requires integrating vast amounts of implicit knowledge from physical, social, and cultural domains. Current LLMs lack grounded experience in the real world.',
  5000000,
  ARRAY['Childcare Provider', 'Home Health Aide', 'Personal Assistant', 'Customer Service Rep'],
  18,
  NOW() - INTERVAL '45 days',
  2156,
  134,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '6 hours'
);

-- Capability 5: Planning & Strategy (Reasoning - Medium Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_planning',
  'planning-strategy',
  'Planning & Strategy',
  'cat_reasoning',
  'The ability to formulate long-term plans, optimize sequences of actions, and think strategically about goals.',
  'Monte Carlo tree search, reinforcement learning, hierarchical planning, and goal-oriented reasoning. Includes scheduling, resource allocation, and multi-agent coordination.',
  'Strategic planning is critical for autonomous systems, business optimization, resource management, and complex decision-making under uncertainty.',
  55,
  'partial',
  'medium',
  ARRAY['Game playing with perfect information (Chess, Go)', 'Route optimization', 'Simple scheduling', 'Resource allocation in constrained problems', 'Short-term tactical decisions'],
  ARRAY['Long-horizon planning (>100 steps)', 'Planning under uncertainty', 'Adapting plans dynamically', 'Multi-objective optimization', 'Strategic thinking about human behavior'],
  ARRAY['Perfect foresight in complex domains', 'Human-level strategic creativity', 'Planning with incomplete information reliably'],
  '7-12 years for general strategic planning',
  'Superhuman in narrow domains (games), but struggles with open-ended real-world planning',
  2032,
  'AI excels at planning in structured environments with clear rules but struggles when dealing with uncertainty, changing conditions, and the need to reason about other agents.',
  1800000,
  ARRAY['Executive', 'Military Strategist', 'Urban Planner'],
  28,
  NOW() - INTERVAL '30 days',
  1453,
  89,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '12 hours'
);

-- Capability 6: Dexterous Manipulation (Physical - Low Progress) ⚠️ CRITICAL GAP
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_dexterous_manipulation',
  'dexterous-manipulation',
  'Dexterous Manipulation',
  'cat_physical',
  'The ability to manipulate objects with precision, adapt grip to different materials, and perform fine motor tasks like humans.',
  'Robotic hands with tactile sensors, reinforcement learning for manipulation, sim-to-real transfer, and imitation learning from human demonstrations. Requires integration of perception, control, and touch feedback.',
  'This is a critical bottleneck protecting millions of manual labor jobs. Breakthrough here would enable automation of construction, healthcare, repair, and service work.',
  20,
  'unsolved',
  'high',
  ARRAY['Grasping rigid objects in controlled settings', 'Pick-and-place in structured environments', 'Simple gripping motions', 'Bin picking with specialized grippers'],
  ARRAY['Handling deformable objects (cloth, food)', 'Tool use and coordination', 'Gentle touch and force control', 'Adapting to object properties', 'Bimanual manipulation', 'Speed approaching human level'],
  ARRAY['Human-level dexterity and adaptability', 'Tying shoelaces or knots reliably', 'Handling fragile objects consistently', 'Working in unstructured environments', 'Matching human speed and versatility'],
  '15-25 years for human-level dexterity',
  'Hardware and software both need major breakthroughs; this is one of the hardest robotics problems',
  2040,
  'Despite massive investment, dexterous manipulation remains extremely challenging. The human hand has 27 degrees of freedom and extraordinary tactile sensitivity that current robots cannot match. This protects jobs requiring manual dexterity.',
  10200000,
  ARRAY['Plumber', 'Electrician', 'Surgeon', 'Mechanic', 'Carpenter', 'Hair Stylist', 'Dental Hygienist', 'Chef', 'Masseuse', 'Tailor'],
  67,
  NOW() - INTERVAL '5 days',
  5234,
  287,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '30 minutes'
);

-- Capability 7: Bipedal Navigation (Physical - Low Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_bipedal_nav',
  'bipedal-navigation',
  'Bipedal Navigation',
  'cat_physical',
  'The ability to walk, run, climb, and navigate varied terrain on two legs like humans.',
  'Legged locomotion control using model predictive control, reinforcement learning, and dynamic balance algorithms. Includes gait generation, terrain adaptation, and fall recovery.',
  'Bipedal robots could access human environments (stairs, narrow spaces) and replace workers in construction, delivery, and inspection tasks.',
  25,
  'unsolved',
  'medium',
  ARRAY['Walking on flat surfaces', 'Basic stair climbing', 'Standing balance', 'Controlled falling and recovery', 'Slow jogging'],
  ARRAY['Running at human speeds', 'Navigating cluttered spaces', 'Walking on uneven/slippery terrain', 'Quick direction changes', 'Energy efficiency', 'Long-duration operation'],
  ARRAY['Matching human agility and adaptability', 'Marathon-level endurance', 'Rock climbing or parkour', 'Operating reliably in all weather'],
  '10-20 years for robust bipedal locomotion',
  'Boston Dynamics Atlas shows impressive demos, but commercial deployment remains limited',
  2038,
  'While impressive progress has been made (Boston Dynamics Atlas, Tesla Optimus), bipedal locomotion in unstructured environments remains challenging. Battery life, cost, and reliability are major barriers.',
  3400000,
  ARRAY['Construction Worker', 'Delivery Person', 'Warehouse Worker', 'Security Guard'],
  41,
  NOW() - INTERVAL '12 days',
  1987,
  112,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '8 hours'
);

-- Capability 8: Emotional Intelligence (Social - Low Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_emotional_intelligence',
  'emotional-intelligence',
  'Emotional Intelligence',
  'cat_social',
  'The ability to recognize, understand, and respond appropriately to human emotions and social cues.',
  'Emotion recognition from facial expressions, voice, and text using multimodal models. Affective computing, sentiment analysis, and empathetic response generation.',
  'Emotional intelligence is crucial for healthcare, education, customer service, and any role requiring human connection and empathy.',
  35,
  'partial',
  'low',
  ARRAY['Basic emotion classification (happy, sad, angry)', 'Sentiment analysis from text', 'Detecting obvious distress signals', 'Matching emotional tone in responses'],
  ARRAY['Understanding subtle emotional cues', 'Cultural differences in expression', 'Detecting deception or sarcasm', 'Genuine empathy vs simulated', 'Long-term emotional memory', 'Understanding mixed emotions'],
  ARRAY['Truly feeling emotions', 'Perfect emotion recognition across cultures', 'Providing authentic emotional support', 'Understanding complex social dynamics'],
  '15-30 years for human-level EQ (if possible)',
  'Highly uncertain if machines can achieve genuine emotional understanding',
  2045,
  'While AI can recognize and respond to emotional patterns, true emotional intelligence may require consciousness and lived experience. The gap between pattern matching and genuine empathy remains vast.',
  8600000,
  ARRAY['Therapist', 'Social Worker', 'Teacher', 'Nurse', 'Counselor', 'Hostage Negotiator', 'HR Manager'],
  23,
  NOW() - INTERVAL '38 days',
  2678,
  145,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '18 hours'
);

-- Capability 9: Theory of Mind (Social - Low Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_theory_of_mind',
  'theory-of-mind',
  'Theory of Mind',
  'cat_social',
  'The ability to understand that others have beliefs, desires, intentions, and perspectives different from one''s own.',
  'Modeling mental states of other agents, perspective-taking, intention recognition, and social reasoning. Requires predicting behavior based on inferred mental states.',
  'Theory of mind enables effective collaboration, negotiation, teaching, and any situation requiring understanding what others think, know, or want.',
  30,
  'partial',
  'low',
  ARRAY['Basic perspective-taking in simple scenarios', 'Recognizing different knowledge states', 'Following explicit social rules', 'Predicting simple behaviors'],
  ARRAY['Complex social situations', 'Inferring implicit intentions', 'Understanding deception', 'Recursive mental modeling (A thinks B thinks...)', 'Cultural differences in thinking'],
  ARRAY['True understanding vs heuristics', 'Human-level social cognition', 'Navigating complex office politics', 'Understanding all implicit social contracts'],
  '12-20 years for robust theory of mind',
  'Fundamental AI challenge; unclear if possible without consciousness',
  2038,
  'Recent LLM research shows some theory of mind capabilities in controlled tests, but real-world social understanding remains primitive. This protects jobs requiring deep social cognition.',
  4300000,
  ARRAY['Mediator', 'Diplomat', 'Manager', 'Salesperson', 'Investigator'],
  19,
  NOW() - INTERVAL '52 days',
  1534,
  78,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '4 days'
);

-- Capability 10: Language Generation (Perception - High Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_language_generation',
  'language-generation',
  'Language Generation',
  'cat_perception',
  'The ability to produce coherent, contextually appropriate text and speech in human languages.',
  'Autoregressive language models, text-to-speech synthesis, and controllable generation. Includes creative writing, technical documentation, and conversational AI.',
  'Language generation enables content creation, communication, documentation, and human-AI interaction at scale.',
  80,
  'solved',
  'high',
  ARRAY['Coherent paragraph and article generation', 'Code generation', 'Translation between languages', 'Summarization', 'Question answering', 'Basic creative writing'],
  ARRAY['Maintaining consistency in long documents', 'Highly creative or original writing', 'Avoiding factual errors (hallucinations)', 'Matching specific brand voices', 'Generating poetry with depth'],
  ARRAY['Perfect factual accuracy', 'True creativity and originality', 'Writing that consistently matches best human writers', 'Zero hallucinations'],
  'Largely solved for most applications',
  'GPT-4 and similar models show remarkable generation quality but still have consistency and factual issues',
  2025,
  'Language generation has reached impressive levels with modern LLMs, now used extensively in content creation, coding assistance, and customer service. Still improving but commercially viable.',
  1200000,
  ARRAY['Technical Writer', 'Junior Copywriter'],
  56,
  NOW() - INTERVAL '10 days',
  2934,
  167,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '3 hours'
);

-- Capability 11: Creativity (Meta - Low Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_creativity',
  'creativity',
  'Creativity',
  'cat_meta',
  'The ability to generate novel, valuable, and surprising ideas, art, solutions, and concepts.',
  'Generative models (GANs, diffusion, transformers), creative constraint satisfaction, and combinatorial innovation. Includes artistic creation, problem reframing, and conceptual blending.',
  'True creativity is essential for innovation, art, design, scientific discovery, and solving problems that require thinking outside existing frameworks.',
  30,
  'partial',
  'low',
  ARRAY['Generating images in known styles', 'Recombining existing concepts', 'Following creative prompts', 'Producing variations on themes', 'Technical creativity (novel algorithms)'],
  ARRAY['Truly original ideas', 'Understanding aesthetic value', 'Creative problem solving', 'Developing new artistic movements', 'Knowing when to break rules effectively'],
  ARRAY['Human-level artistic genius', 'Paradigm-shifting innovations', 'Understanding "why" something is creative', 'Creating emotionally resonant original art'],
  '20-40 years for human-level creativity (highly uncertain)',
  'AI can augment creativity but true originality remains elusive',
  2050,
  'While AI can generate impressive art and ideas, debate continues about whether current systems are truly creative or simply remixing training data in sophisticated ways. Original creative vision remains largely human.',
  6700000,
  ARRAY['Artist', 'Creative Director', 'Inventor', 'Architect', 'Fashion Designer', 'Screenwriter'],
  31,
  NOW() - INTERVAL '25 days',
  3245,
  189,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '14 hours'
);

-- Capability 12: Self-Improvement (Meta - Very Low Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_self_improvement',
  'self-improvement',
  'Self-Improvement',
  'cat_meta',
  'The ability to autonomously improve one''s own capabilities, learn from mistakes, and modify one''s own architecture.',
  'Meta-learning, neural architecture search, self-play, recursive self-improvement, and automated machine learning (AutoML). The capability to design better versions of itself.',
  'Self-improvement could lead to rapid AI capability gains (intelligence explosion) or safer AI through self-debugging. This is both promising and concerning for AGI development.',
  15,
  'unsolved',
  'medium',
  ARRAY['Basic hyperparameter tuning', 'Learning from feedback in narrow domains', 'Improving through more data', 'Self-play in games'],
  ARRAY['Identifying own weaknesses', 'Autonomous architecture improvements', 'Transfer of improvements across domains', 'Safe self-modification', 'Maintaining alignment while improving'],
  ARRAY['Recursive self-improvement', 'Understanding own limitations fundamentally', 'Improving core reasoning abilities autonomously', 'Safe unbounded self-improvement'],
  '20-50 years (highly uncertain and concerning)',
  'Progress slow and deliberately cautious; major safety concerns',
  2055,
  'Self-improvement capability is intentionally progressing slowly due to safety concerns. Recursive self-improvement could lead to uncontrolled capability gains. This remains one of the most uncertain and potentially dangerous capabilities.',
  900000,
  ARRAY[]::text[],
  12,
  NOW() - INTERVAL '67 days',
  876,
  45,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '7 days'
);

-- Capability 13: Transfer Learning (Reasoning - Medium Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_transfer_learning',
  'transfer-learning',
  'Transfer Learning',
  'cat_reasoning',
  'The ability to apply knowledge learned in one domain to solve problems in different but related domains.',
  'Foundation models, meta-learning, few-shot learning, and domain adaptation. The capacity to generalize skills and knowledge across contexts with minimal retraining.',
  'Transfer learning is key to creating AI that doesn''t need to be trained from scratch for every task, making AI more practical and efficient.',
  65,
  'partial',
  'high',
  ARRAY['Transfer between similar domains', 'Few-shot learning with examples', 'Fine-tuning foundation models', 'Zero-shot task performance', 'Cross-lingual transfer'],
  ARRAY['Transfer to very different domains', 'Learning from single examples', 'Transferring physical skills', 'Knowing what knowledge applies when', 'Transfer without catastrophic forgetting'],
  ARRAY['Perfect generalization across all domains', 'Human-level flexible knowledge application', 'Transfer with zero additional data'],
  '5-10 years for robust transfer learning',
  'Major progress with foundation models, but still domain-dependent',
  2028,
  'Foundation models like GPT-4 and CLIP show impressive transfer learning, but AI still struggles to match human flexibility in applying knowledge across vastly different contexts.',
  1500000,
  ARRAY['Consultant', 'Generalist'],
  39,
  NOW() - INTERVAL '18 days',
  1654,
  93,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '9 hours'
);

-- Capability 14: Tool Use (Reasoning - Medium Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_tool_use',
  'tool-use',
  'Tool Use',
  'cat_reasoning',
  'The ability to use digital and physical tools effectively to accomplish goals, including APIs, software, and physical implements.',
  'Agent systems, API integration, function calling in LLMs, and robotic tool manipulation. Includes knowing which tools to use when and how to combine tools.',
  'Tool use extends AI capabilities dramatically by allowing systems to access databases, run code, control devices, and accomplish complex multi-step tasks.',
  50,
  'partial',
  'medium',
  ARRAY['API calling and function execution', 'Using predefined digital tools', 'Simple physical tool manipulation', 'Database queries', 'Code execution'],
  ARRAY['Selecting appropriate tools autonomously', 'Learning new tools quickly', 'Combining multiple tools creatively', 'Physical tool use with dexterity', 'Handling tool failures gracefully'],
  ARRAY['Human-level tool improvisation', 'Using tools in novel ways consistently', 'Perfect tool selection for any task', 'Physical tool mastery'],
  '5-12 years for general tool use',
  'Rapid progress with LLM agents; physical tool use limited by dexterity',
  2030,
  'Recent advances in LLM function calling and agent systems show promising tool use capabilities. Physical tool use remains limited by manipulation capabilities. This is rapidly evolving.',
  3200000,
  ARRAY['Mechanic', 'IT Specialist', 'Lab Technician'],
  47,
  NOW() - INTERVAL '8 days',
  2156,
  124,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '6 hours'
);

-- Capability 15: Audio Processing (Perception - High Progress)
INSERT INTO capability (id, slug, name, category_id, description, technical_description, why_it_matters, progress_percentage, status, confidence_level, what_works, what_struggles, what_doesnt_work, timeline_estimate, expert_consensus, community_prediction_median, reasoning, jobs_protected_count, jobs_protected_examples, research_activity_count, recent_breakthrough_date, view_count, tracking_count, created_at, updated_at) VALUES
(
  'cap_audio_processing',
  'audio-processing',
  'Audio Processing',
  'cat_perception',
  'The ability to recognize speech, understand audio content, generate natural speech, and process sound.',
  'Speech recognition (ASR), text-to-speech (TTS), audio classification, source separation, and music generation using neural networks.',
  'Audio processing enables voice interfaces, accessibility features, audio content creation, and human-computer interaction through speech.',
  80,
  'solved',
  'high',
  ARRAY['Speech-to-text in clear conditions', 'Text-to-speech (natural sounding)', 'Speaker identification', 'Audio classification', 'Music generation', 'Accent adaptation'],
  ARRAY['Speech recognition in noisy environments', 'Multiple overlapping speakers', 'Emotional prosody in speech', 'Real-time translation with voice cloning', 'Understanding context from tone'],
  ARRAY['Perfect transcription in all conditions', 'Capturing all emotional nuance', 'Perfectly natural speech across all contexts'],
  'Largely solved for most commercial applications',
  'Whisper and modern TTS systems achieve near-human performance in many scenarios',
  2024,
  'Audio processing has reached commercial viability with systems like OpenAI Whisper and modern TTS. Quality continues to improve but core capabilities are solved.',
  800000,
  ARRAY['Transcriptionist', 'Voice Actor (some roles)'],
  52,
  NOW() - INTERVAL '22 days',
  1789,
  98,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '11 hours'
);

-- ============================================
-- 4. BOTTLENECKS (3-5 per major capability)
-- ============================================

-- Dexterous Manipulation Bottlenecks
INSERT INTO bottleneck (id, capability_id, types, title, description, severity, estimated_solve_date, organizations_working_on_it, created_at, updated_at) VALUES
('btn_dext_1', 'cap_dexterous_manipulation', ARRAY['hardware', 'cost']::text[], 'Tactile Sensing Hardware', 'Current tactile sensors lack the sensitivity and durability of human skin. Sensors need to detect subtle forces, textures, and slip while withstanding repeated use.', 'critical', '2032-2035', 8, NOW(), NOW()),
('btn_dext_2', 'cap_dexterous_manipulation', ARRAY['software', 'data']::text[], 'Sim-to-Real Transfer Gap', 'Policies trained in simulation fail when deployed to real robots due to differences in physics, friction, and sensor noise. Massive amounts of real-world data are needed.', 'critical', '2030-2033', 12, NOW(), NOW()),
('btn_dext_3', 'cap_dexterous_manipulation', ARRAY['hardware', 'cost']::text[], 'Actuator Limitations', 'Current actuators cannot match the speed, precision, and power-to-weight ratio of human muscles. Better actuators are needed for dexterous control.', 'major', '2030-2035', 6, NOW(), NOW()),
('btn_dext_4', 'cap_dexterous_manipulation', ARRAY['theory', 'software']::text[], 'Contact-Rich Manipulation', 'Planning and controlling movements that involve complex contact (sliding, rolling, deforming) remains extremely difficult. Theory for contact-rich manipulation is incomplete.', 'critical', '2028-2032', 15, NOW(), NOW());

-- Common Sense Reasoning Bottlenecks
INSERT INTO bottleneck (id, capability_id, types, title, description, severity, estimated_solve_date, organizations_working_on_it, created_at, updated_at) VALUES
('btn_cs_1', 'cap_common_sense', ARRAY['theory', 'data']::text[], 'Implicit Knowledge Representation', 'Humans possess vast amounts of implicit knowledge never written down. Current systems struggle to learn this knowledge from text alone. Requires embodied learning or massive knowledge engineering.', 'critical', '2035-2045', 9, NOW(), NOW()),
('btn_cs_2', 'cap_common_sense', ARRAY['software', 'theory']::text[], 'Causal Reasoning', 'Understanding cause and effect relationships, not just correlations, remains difficult. Systems need to build causal models of the world.', 'critical', '2030-2038', 11, NOW(), NOW()),
('btn_cs_3', 'cap_common_sense', ARRAY['data', 'theory']::text[], 'Learning from Experience', 'Humans learn common sense through years of physical and social experience. Current AI lacks this grounded learning. Embodied AI may be necessary.', 'major', '2032-2040', 7, NOW(), NOW());

-- Emotional Intelligence Bottlenecks
INSERT INTO bottleneck (id, capability_id, types, title, description, severity, estimated_solve_date, organizations_working_on_it, created_at, updated_at) VALUES
('btn_ei_1', 'cap_emotional_intelligence', ARRAY['theory']::text[], 'Genuine Empathy vs Simulation', 'Unclear if AI can have genuine emotional understanding or only simulate empathy through pattern matching. May require consciousness or lived experience.', 'critical', 'Unknown', 5, NOW(), NOW()),
('btn_ei_2', 'cap_emotional_intelligence', ARRAY['data', 'software']::text[], 'Cultural Context', 'Emotional expression and interpretation vary dramatically across cultures. Current systems lack deep cultural understanding needed for appropriate emotional responses.', 'major', '2032-2040', 8, NOW(), NOW()),
('btn_ei_3', 'cap_emotional_intelligence', ARRAY['theory', 'software']::text[], 'Long-term Emotional Memory', 'Tracking and responding to emotional states over long time periods (days, weeks, years) in relationships requires persistent memory and understanding of emotional dynamics.', 'major', '2030-2035', 4, NOW(), NOW());

-- Logical Reasoning Bottlenecks
INSERT INTO bottleneck (id, capability_id, types, title, description, severity, estimated_solve_date, organizations_working_on_it, created_at, updated_at) VALUES
('btn_logic_1', 'cap_logical_reasoning', ARRAY['software', 'theory']::text[], 'Multi-Step Reasoning Chains', 'Current LLMs struggle with problems requiring many logical steps. They lose track of context, make arithmetic errors, or reach incorrect conclusions in long reasoning chains.', 'major', '2027-2030', 14, NOW(), NOW()),
('btn_logic_2', 'cap_logical_reasoning', ARRAY['theory', 'software']::text[], 'Self-Correction', 'AI systems struggle to identify and correct their own logical errors without external feedback. Robust self-verification mechanisms are needed.', 'major', '2028-2032', 10, NOW(), NOW());

-- Bipedal Navigation Bottlenecks
INSERT INTO bottleneck (id, capability_id, types, title, description, severity, estimated_solve_date, organizations_working_on_it, created_at, updated_at) VALUES
('btn_bipedal_1', 'cap_bipedal_nav', ARRAY['hardware', 'cost']::text[], 'Energy Efficiency', 'Current bipedal robots consume far more energy per distance than humans. Better actuators and more efficient control algorithms are needed for practical deployment.', 'critical', '2030-2035', 8, NOW(), NOW()),
('btn_bipedal_2', 'cap_bipedal_nav', ARRAY['software', 'hardware']::text[], 'Terrain Adaptation', 'Real-time adaptation to unexpected terrain (ice, mud, loose gravel, obstacles) requires fast perception-action loops and robust control policies that current systems lack.', 'major', '2028-2033', 11, NOW(), NOW()),
('btn_bipedal_3', 'cap_bipedal_nav', ARRAY['cost', 'hardware']::text[], 'Cost and Reliability', 'Bipedal robots remain expensive ($50k-$150k) and maintenance-intensive. Cost must drop 10x and reliability improve 100x for mass deployment.', 'critical', '2032-2040', 9, NOW(), NOW());

-- Creativity Bottlenecks
INSERT INTO bottleneck (id, capability_id, types, title, description, severity, estimated_solve_date, organizations_working_on_it, created_at, updated_at) VALUES
('btn_creative_1', 'cap_creativity', ARRAY['theory']::text[], 'Originality vs Recombination', 'Current AI "creativity" may be sophisticated recombination of training data rather than true originality. Fundamental question of whether machines can be genuinely creative remains unresolved.', 'critical', 'Unknown', 6, NOW(), NOW()),
('btn_creative_2', 'cap_creativity', ARRAY['theory', 'software']::text[], 'Aesthetic Judgment', 'Understanding what makes something beautiful, moving, or valuable requires subjective experience and cultural context that current AI lacks.', 'major', '2035-2050', 7, NOW(), NOW());

-- ============================================
-- 5. CAPABILITY-ORGANIZATION RELATIONSHIPS
-- ============================================

INSERT INTO capability_organization (id, capability_id, organization_id, focus_area, created_at) VALUES
-- Dexterous Manipulation
('co_1', 'cap_dexterous_manipulation', 'org_openai', 'Robotic hand control for assembly tasks', NOW()),
('co_2', 'cap_dexterous_manipulation', 'org_boston_dynamics', 'Atlas humanoid hand dexterity', NOW()),
('co_3', 'cap_dexterous_manipulation', 'org_figure', 'Figure 02 bimanual manipulation', NOW()),
('co_4', 'cap_dexterous_manipulation', 'org_tesla', 'Optimus hand design and control', NOW()),
('co_5', 'cap_dexterous_manipulation', 'org_sanctuary', 'Phoenix carbon hand dexterity', NOW()),
('co_6', 'cap_dexterous_manipulation', 'org_mit_csail', 'Tactile sensing research', NOW()),
('co_7', 'cap_dexterous_manipulation', 'org_ucberkeley', 'Learning dexterous skills from demonstration', NOW()),

-- Visual Recognition
('co_8', 'cap_visual_recognition', 'org_openai', 'CLIP and multimodal vision models', NOW()),
('co_9', 'cap_visual_recognition', 'org_deepmind', 'Gemini vision capabilities', NOW()),
('co_10', 'cap_visual_recognition', 'org_meta', 'FAIR vision research and SAM model', NOW()),
('co_11', 'cap_visual_recognition', 'org_nvidia', 'GPU-accelerated vision inference', NOW()),

-- Natural Language Understanding
('co_12', 'cap_nlu', 'org_openai', 'GPT series language models', NOW()),
('co_13', 'cap_nlu', 'org_anthropic', 'Claude constitutional AI and safety', NOW()),
('co_14', 'cap_nlu', 'org_deepmind', 'Gemini and language grounding', NOW()),
('co_15', 'cap_nlu', 'org_cohere', 'Enterprise language understanding', NOW()),
('co_16', 'cap_nlu', 'org_mistral', 'Efficient open-source language models', NOW()),

-- Logical Reasoning
('co_17', 'cap_logical_reasoning', 'org_openai', 'Chain-of-thought reasoning in GPT-4', NOW()),
('co_18', 'cap_logical_reasoning', 'org_deepmind', 'AlphaProof and mathematical reasoning', NOW()),
('co_19', 'cap_logical_reasoning', 'org_anthropic', 'Constitutional AI reasoning', NOW()),

-- Common Sense Reasoning
('co_20', 'cap_common_sense', 'org_deepmind', 'World models and embodied AI', NOW()),
('co_21', 'cap_common_sense', 'org_mit_csail', 'Commonsense reasoning datasets', NOW()),
('co_22', 'cap_common_sense', 'org_stanford_hai', 'Social common sense research', NOW()),

-- Planning & Strategy
('co_23', 'cap_planning', 'org_deepmind', 'AlphaGo and game-playing AI', NOW()),
('co_24', 'cap_planning', 'org_openai', 'Long-context planning with GPT-4', NOW()),
('co_25', 'cap_planning', 'org_ucberkeley', 'Hierarchical reinforcement learning', NOW()),

-- Bipedal Navigation
('co_26', 'cap_bipedal_nav', 'org_boston_dynamics', 'Atlas bipedal locomotion', NOW()),
('co_27', 'cap_bipedal_nav', 'org_figure', 'Figure 01/02 walking control', NOW()),
('co_28', 'cap_bipedal_nav', 'org_tesla', 'Optimus bipedal platform', NOW()),
('co_29', 'cap_bipedal_nav', 'org_sanctuary', 'Phoenix walking algorithms', NOW()),

-- Emotional Intelligence
('co_30', 'cap_emotional_intelligence', 'org_deepmind', 'Social AI research', NOW()),
('co_31', 'cap_emotional_intelligence', 'org_stanford_hai', 'Human-AI emotional interaction', NOW()),
('co_32', 'cap_emotional_intelligence', 'org_meta', 'Social understanding in AI', NOW()),

-- Theory of Mind
('co_33', 'cap_theory_of_mind', 'org_deepmind', 'Multi-agent social reasoning', NOW()),
('co_34', 'cap_theory_of_mind', 'org_stanford_hai', 'Theory of mind in language models', NOW()),
('co_35', 'cap_theory_of_mind', 'org_mit_csail', 'Social cognition research', NOW()),

-- Language Generation
('co_36', 'cap_language_generation', 'org_openai', 'GPT series text generation', NOW()),
('co_37', 'cap_language_generation', 'org_anthropic', 'Claude writing capabilities', NOW()),
('co_38', 'cap_language_generation', 'org_cohere', 'Enterprise content generation', NOW()),
('co_39', 'cap_language_generation', 'org_deepmind', 'Gemini language generation', NOW()),

-- Creativity
('co_40', 'cap_creativity', 'org_openai', 'DALL-E image generation', NOW()),
('co_41', 'cap_creativity', 'org_deepmind', 'Generative models research', NOW()),
('co_42', 'cap_creativity', 'org_stanford_hai', 'Computational creativity', NOW()),

-- Self-Improvement
('co_43', 'cap_self_improvement', 'org_deepmind', 'Self-play and AutoML research', NOW()),
('co_44', 'cap_self_improvement', 'org_openai', 'AI safety and alignment', NOW()),
('co_45', 'cap_self_improvement', 'org_anthropic', 'Constitutional AI self-improvement', NOW()),

-- Transfer Learning
('co_46', 'cap_transfer_learning', 'org_openai', 'Foundation model research', NOW()),
('co_47', 'cap_transfer_learning', 'org_deepmind', 'Meta-learning and few-shot learning', NOW()),
('co_48', 'cap_transfer_learning', 'org_meta', 'LLaMA foundation models', NOW()),

-- Tool Use
('co_49', 'cap_tool_use', 'org_openai', 'Function calling and plugins', NOW()),
('co_50', 'cap_tool_use', 'org_adept', 'ACT-1 tool-using agent', NOW()),
('co_51', 'cap_tool_use', 'org_anthropic', 'Claude tool use capabilities', NOW()),

-- Audio Processing
('co_52', 'cap_audio_processing', 'org_openai', 'Whisper speech recognition', NOW()),
('co_53', 'cap_audio_processing', 'org_deepmind', 'Audio generation research', NOW()),
('co_54', 'cap_audio_processing', 'org_meta', 'Speech and audio processing', NOW());

-- ============================================
-- 6. USER TRACKING (Sample user tracking capabilities)
-- ============================================

INSERT INTO capability_tracking (id, capability_id, user_id, notifications_enabled, created_at) VALUES
('track_1', 'cap_dexterous_manipulation', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', true, NOW() - INTERVAL '30 days'),
('track_2', 'cap_common_sense', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', true, NOW() - INTERVAL '25 days'),
('track_3', 'cap_emotional_intelligence', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', true, NOW() - INTERVAL '20 days'),
('track_4', 'cap_creativity', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', false, NOW() - INTERVAL '15 days'),
('track_5', 'cap_self_improvement', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', true, NOW() - INTERVAL '10 days');

-- ============================================
-- 7. USER PREDICTIONS (Sample predictions)
-- ============================================

INSERT INTO capability_prediction (id, capability_id, user_id, predicted_year, predicted_year_end, confidence, reasoning, background, created_at, updated_at) VALUES
('pred_1', 'cap_dexterous_manipulation', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', 2038, 2042, 'medium', 
'Dexterous manipulation requires breakthroughs in both hardware (tactile sensors, actuators) and software (sim-to-real transfer). While progress is steady, human-level dexterity involves subtle force control and material understanding that will take decades to match.', 
'professional', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

('pred_2', 'cap_common_sense', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', 2035, 2045, 'low',
'Common sense may require embodied experience in the world that current text-based AI lacks. Without physical grounding, AI may never truly understand everyday situations the way humans do.',
'researcher', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),

('pred_3', 'cap_logical_reasoning', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', 2028, 2032, 'high',
'Recent progress with chain-of-thought and more sophisticated architectures suggests logical reasoning will improve rapidly. However, consistent reasoning across all domains will take a few more years.',
'professional', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- ============================================
-- 8. SAMPLE COMMENTS
-- ============================================

INSERT INTO capability_comment (id, capability_id, user_id, parent_id, content, upvotes, created_at, updated_at) VALUES
('comment_1', 'cap_dexterous_manipulation', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', NULL,
'As someone who works in manufacturing automation, I can confirm that dexterous manipulation is the #1 bottleneck preventing wider robot deployment. We can''t automate tasks involving wire harnesses, soft materials, or any kind of "feel" because robots simply can''t match human hands. The economic impact of solving this would be enormous.',
23, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('comment_2', 'cap_common_sense', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', NULL,
'The fact that LLMs still struggle with basic physics (like "if I drop a cup of water, what happens?") shows how far we have to go. Common sense isn''t just facts - it''s intuition built from experience.',
34, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

('comment_3', 'cap_emotional_intelligence', 'rqKPfqThTwQ33oHLCvIf7z6vZELDkxbU', NULL,
'Working as a therapist, I can tell you that emotional intelligence isn''t just about recognizing facial expressions. It''s about understanding context, reading between the lines, and responding with genuine empathy. AI might simulate this, but can it ever truly *feel* what the patient is experiencing?',
45, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days');

-- ============================================
-- SUCCESS!
-- ============================================

-- Total counts:
-- 5 capability categories ✓
-- 15 capabilities (fully detailed) ✓
-- 15 organizations ✓
-- 15 bottlenecks across major capabilities ✓
-- 54 capability-organization relationships ✓
-- 5 user tracking records ✓
-- 3 user predictions ✓
-- 3 sample comments ✓