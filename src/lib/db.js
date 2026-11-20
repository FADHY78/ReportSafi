/**
 * Data layer for the Report Safi Title Selection Portal.
 *
 * The PRD (BR-04) requires the server — never the browser — to be the
 * authority for availability. In this build the "server" is simulated here:
 * every write goes through an exclusive lock and re-validates the business
 * rules (BR-01…BR-09) immediately before committing, exactly the way a
 * transactional API endpoint would. Swap this module for HTTP calls when the
 * real backend exists; nothing else in the UI needs to change.
 */
import { normReg, normPhone, demoHash, pad } from './utils.js';

const DB_KEY = 'reportsafi_portal_db_v6';
const LOCK_KEY = 'reportsafi_portal_lock_v6';
const DB_VERSION = 6;

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-random generator (stable titles across reloads) */
/* ------------------------------------------------------------------ */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length) % arr.length];

/* ------------------------------------------------------------------ */
/* Catalogue seed — programmes, categories, authentic academic titles   */
/* ------------------------------------------------------------------ */

const GENERAL_TEMPLATES = [
  'Evaluating the Influence of {T} on {O} among {S} in {L}',
  'The Role of {T} in Enhancing {O} among {S} in {L}',
  'An Empirical Assessment of {T} and {O} among {S} in {L}',
  'Determinants of Effective {T} among {S} in {L}',
  'Challenges Facing {T} for Sustainable {O} among {S} in {L}',
  'Examining the Relationship between {T} and {O} in {S} ({L})',
  'Adoption of {T} and Its Effect on {O} among {S} in {L}',
  'Factors Influencing {T} and {O} in {S} across {L}',
  'Strategies for Strengthening {T} to Improve {O} among {S} in {L}',
  'Assessing the Effectiveness of {T} on {O} in {S} ({L})',
  'Operational Barriers to {T} among {S} in {L}',
  'A Comparative Study of {T} and {O} across {S} in {L}',
  'Contribution of {T} toward {O} in {S} within {L}',
  'Impact of {T} on {O}: Evidence from {S} in {L}',
  'Institutional Drivers of {T} and {O} among {S} in {L}',
  'Linking {T} to {O}: Insights from {S} in {L}',
  'Modernising {T} for Better {O} among {S} in {L}',
  'Critical Success Factors for {T} among {S} in {L}',
];

const NAMED_INSTITUTION_TEMPLATES = [
  'An Investigation into {T} and {O} at {N}',
  'Assessing the Contribution of {T} to {O} at {N}',
  'Challenges Facing {T} and {O} at {N}',
  'Evaluating the Effectiveness of {T} on {O} at {N}',
  'Strategies for Strengthening {T} to Advance {O} at {N}',
  'Determinants of {T} and {O} at {N}',
];

const OUTCOMES = [
  'Operational Cost Efficiency',
  'Sustainable Revenue Growth',
  'Service Delivery Quality',
  'Customer Retention Rates',
  'Institutional Accountability',
  'Regulatory Compliance',
  'Employee Productivity',
  'Decision-Making Accuracy',
  'Long-Term Competitive Advantage',
  'Turnaround Time Reduction',
  'Stakeholder Confidence',
  'Profitability Margins',
  'Process Reliability',
  'Resource Utilisation Efficiency',
  'Organisational Resilience',
  'Market Share Expansion',
  'Fraud and Loss Prevention',
  'Audit Readiness',
  'Customer Loyalty and Trust',
  'Working Capital Efficiency',
  'Service Accessibility',
  'Risk Mitigation Performance',
  'Operational Transparency',
  'Budget Execution Discipline',
  'Innovation Capability',
  'Quality Consistency',
  'Client Satisfaction Levels',
  'Growth Sustainability',
];

const SECTORS = [
  'Small and Medium Retail Enterprises',
  'Commercial Bank Branches',
  'Savings and Credit Cooperative Societies (SACCOS)',
  'Microfinance Institutions',
  'Private Secondary Schools',
  'Clearing and Forwarding Agencies',
  'Licensed Tour Operators',
  'Food and Beverage Manufacturing Firms',
  'Private Health Clinics',
  'Registered Construction Contractors',
  'Telecommunications Distribution Agents',
  'Urban Logistics and Courier Companies',
  'Boutique Hotels and Hospitality Firms',
  'Wholesale Distribution Enterprises',
  'Community-Based Organisations',
  'Agro-Processing Enterprises',
  'Insurance Brokerage Firms',
  'Hardware and Building Material Suppliers',
  'Online Retail Businesses',
  'Printing and Publishing Firms',
  'Pharmaceutical Wholesalers',
  'Import-Export Trading Companies',
  'Real Estate Management Agencies',
  'Vocational Training Centres',
  'Agricultural Marketing Cooperatives',
  'Private Security Firms',
  'Fuel Retail Stations',
  'Local Government Revenue Units',
  'Women-Owned Enterprises',
  'Youth-Led Start-Ups',
];

const LOCATIONS = [
  'Ilala, Dar es Salaam',
  'Kinondoni, Dar es Salaam',
  'Temeke, Dar es Salaam',
  'Ubungo, Dar es Salaam',
  'Kigamboni, Dar es Salaam',
  'Kariakoo Commercial Hub',
  'Mikocheni Industrial Area',
  'Buguruni Business District',
  'Sinza, Dar es Salaam',
  'Mwenge, Dar es Salaam',
  'Mbagala, Dar es Salaam',
  'Tabata, Dar es Salaam',
  'Dodoma City',
  'Arusha City',
  'Mwanza City',
  'Mbeya City',
  'Morogoro Municipality',
  'Tanga City',
  'Moshi Municipality',
  'Zanzibar Urban West',
  'Iringa Municipality',
  'Tabora Municipality',
  'Mtwara Municipality',
  'Kahama Town',
  'Kigoma-Ujiji Municipality',
];

const NAMED_INSTITUTIONS = [
  'Dar es Salaam City Council',
  'Ilala Municipal Council',
  'Kinondoni Municipal Council',
  'Temeke Municipal Council',
  'Ubungo Municipal Council',
  'Kigamboni Municipal Council',
  'Tanzania Revenue Authority (TRA)',
  'Tanzania Ports Authority (TPA)',
  'TANESCO',
  'DAWASA',
  'NMB Bank Plc',
  'CRDB Bank Plc',
  'NBC Bank Tanzania',
  'National Health Insurance Fund (NHIF)',
  'National Social Security Fund (NSSF)',
  'Public Service Social Security Fund (PSSSF)',
  'Public Procurement Regulatory Authority (PPRA)',
  'Tanzania Bureau of Standards (TBS)',
  'Land Transport Regulatory Authority (LATRA)',
  'Tanzania Communications Regulatory Authority (TCRA)',
  'Business Registrations and Licensing Agency (BRELA)',
  'College of Business Education (CBE)',
  'Tanzania Airports Authority (TAA)',
  'Medical Stores Department (MSD)',
];

const DOMAIN_TOPICS = {
  marketing: [
    ['Consumer Behaviour', 'Mobile Payment Convenience in Consumer Purchasing'],
    ['Consumer Behaviour', 'Post-Purchase Satisfaction and Brand Loyalty'],
    ['Consumer Behaviour', 'Cultural Preferences in Local Brand Selection'],
    ['Consumer Behaviour', 'Price Sensitivity and Promotional Responsiveness'],
    ['Digital Marketing', 'Short-Form Social Media Video Marketing'],
    ['Digital Marketing', 'Search Engine Optimisation and Digital Lead Generation'],
    ['Digital Marketing', 'WhatsApp Business Catalogues and Conversational Selling'],
    ['Digital Marketing', 'Influencer Endorsements and Digital Buyer Engagement'],
    ['Brand Management', 'Brand Repositioning and Visual Identity Consistency'],
    ['Brand Management', 'Corporate Storytelling and Brand Equity Development'],
    ['Brand Management', 'Packaging Innovation and Shelf Differentiation'],
    ['Brand Management', 'Brand Trust Recovery after Service Disruptions'],
    ['Sales Management', 'Consultative B2B Sales Approaches'],
    ['Sales Management', 'Sales Force Incentive Structures and Quota Design'],
    ['Sales Management', 'Digital Sales Pipeline Tracking'],
    ['Sales Management', 'Key Account Retention Management'],
    ['Marketing Research', 'Customer Journey Mapping and Churn Analysis'],
    ['Marketing Research', 'Point-of-Sale Consumer Analytics'],
    ['Marketing Research', 'Pre-Launch Market Testing and Product Feedback'],
    ['Marketing Research', 'Net Promoter Score Feedback Systems'],
    ['Tourism Marketing', 'Eco-Tourism Destination Promotion'],
    ['Tourism Marketing', 'Domestic Heritage Tourism Marketing'],
    ['Tourism Marketing', 'Online Booking Platform Visibility'],
    ['Tourism Marketing', 'Seasonal Hospitality Package Bundling'],
    ['Event Management', 'Hybrid Corporate Conference Management'],
    ['Event Management', 'Sponsorship Valuation in Commercial Events'],
    ['Event Management', 'Digital Ticketing and Attendee Flow Management'],
    ['Event Management', 'Post-Event Attendee Follow-Up Campaigns'],
    ['Customer Relationship Management', 'Omnichannel Customer Loyalty Programmes'],
    ['Customer Relationship Management', 'Automated Customer Complaint Escalation'],
    ['Customer Relationship Management', 'Personalised SMS Customer Retention Campaigns'],
    ['Customer Relationship Management', 'Customer Lifetime Value Segmentation'],
    ['Advertising', 'Swahili Radio Advertising and Brand Recall'],
    ['Advertising', 'Outdoor Billboard Placement along Urban Corridors'],
    ['Advertising', 'Geotargeted Mobile Display Advertising'],
    ['Advertising', 'Value-Driven Promotional Messaging'],
    ['Retail Marketing', 'In-Store Merchandising and Point-of-Sale Design'],
    ['Retail Marketing', 'Click-and-Collect Omnichannel Retailing'],
    ['Retail Marketing', 'Seasonal Product Bundling and Cross-Selling'],
    ['Retail Marketing', 'Neighbourhood Pop-Up Promotional Activations'],
  ],
  it: [
    ['Information Systems Adoption', 'Cloud-Based ERP Systems'],
    ['Information Systems Adoption', 'Mobile-First Operations and Attendance Portals'],
    ['Information Systems Adoption', 'Open-Source Management Information Systems'],
    ['Information Systems Adoption', 'Unified Digital Payment Gateway Integration'],
    ['Data Management', 'Master Data Governance and Record Deduplication'],
    ['Data Management', 'Automated Data Backup and Disaster Recovery'],
    ['Data Management', 'Business Intelligence Dashboards for Executive Reporting'],
    ['Data Management', 'Data Quality Auditing in Client Registries'],
    ['Cyber Security', 'Zero-Trust Access Control Architecture'],
    ['Cyber Security', 'Phishing Awareness and Staff Security Hygiene'],
    ['Cyber Security', 'Endpoint Protection and Ransomware Containment'],
    ['Cyber Security', 'Multi-Factor Authentication in Financial Portals'],
    ['E-Commerce Systems', 'Mobile Money API Checkout Integration'],
    ['E-Commerce Systems', 'Progressive Web Applications for Low-Bandwidth Commerce'],
    ['E-Commerce Systems', 'Automated Order Tracking and Customer Alerts'],
    ['E-Commerce Systems', 'Automated Fraud Detection in Online Transactions'],
    ['Network Infrastructure', 'Redundant Fibre and LTE Failover Networking'],
    ['Network Infrastructure', 'Enterprise Wireless Network Segmentation'],
    ['Network Infrastructure', 'Software-Defined WAN Performance Monitoring'],
    ['Network Infrastructure', 'Bandwidth Traffic Management for Cloud Workloads'],
    ['Enterprise Systems', 'Integrated Payroll and HR Information Systems'],
    ['Enterprise Systems', 'Automated Inventory-to-Accounting Synchronisation'],
    ['Enterprise Systems', 'Legacy System Modernisation through REST APIs'],
    ['Enterprise Systems', 'Automated IT Helpdesk Ticketing'],
    ['Software Development', 'Agile Software Delivery Practices'],
    ['Software Development', 'Automated Regression Testing Pipelines'],
    ['Software Development', 'Low-Code Rapid Application Prototyping'],
    ['Software Development', 'Secure Coding Reviews in Web Applications'],
    ['Database Management', 'Relational Database Query Indexing and Tuning'],
    ['Database Management', 'Real-Time Database Replication for High Availability'],
    ['Database Management', 'Role-Based Database Access Auditing'],
    ['Database Management', 'Controlled Schema Migration Governance'],
    ['IT Governance', 'COBIT-Aligned IT Risk Management'],
    ['IT Governance', 'Vendor Service-Level Agreement Monitoring'],
    ['IT Governance', 'IT Asset Lifecycle and Software Licence Control'],
    ['IT Governance', 'Shadow IT Mitigation Controls'],
    ['Digital Transformation', 'Paperless Workflow Automation'],
    ['Digital Transformation', 'AI-Assisted Customer Support Chatbots'],
    ['Digital Transformation', 'Digital Identity Verification in Service Portals'],
    ['Digital Transformation', 'Self-Service Client Web Portals'],
  ],
  hrm: [
    ['Talent Acquisition', 'Structured Competency-Based Interviewing'],
    ['Talent Acquisition', 'Digital Recruitment Portals and Graduate Hiring'],
    ['Talent Acquisition', 'Employer Branding and Talent Attraction'],
    ['Talent Acquisition', 'Structured New-Hire Onboarding'],
    ['Employee Relations', 'Workplace Grievance Redressal Mechanisms'],
    ['Employee Relations', 'Participative Staff Consultation Forums'],
    ['Employee Relations', 'Psychological Safety and Team Cohesion'],
    ['Employee Relations', 'Supervisory Conflict Mediation'],
    ['Compensation and Benefits', 'Performance-Linked Bonus and Incentive Plans'],
    ['Compensation and Benefits', 'Non-Monetary Staff Recognition Schemes'],
    ['Compensation and Benefits', 'Pay Equity Reviews and Salary Transparency'],
    ['Compensation and Benefits', 'Employee Health and Wellness Benefits'],
    ['Training and Development', 'On-the-Job Coaching and Technical Mentorship'],
    ['Training and Development', 'Digital Micro-Learning for Frontline Staff'],
    ['Training and Development', 'Internal Leadership Pipeline Development'],
    ['Training and Development', 'Post-Training Workplace Skill Transfer'],
    ['Organisational Behaviour', 'Flexible Work Scheduling and Team Morale'],
    ['Organisational Behaviour', 'Organisational Citizenship Behaviour'],
    ['Organisational Behaviour', 'Supervisory Support and Burnout Prevention'],
    ['Organisational Behaviour', 'Cross-Functional Team Collaboration'],
    ['Performance Management', '360-Degree Performance Appraisal Systems'],
    ['Performance Management', 'Quarterly Objective and Key Result (OKR) Alignment'],
    ['Performance Management', 'Continuous Performance Feedback Check-Ins'],
    ['Performance Management', 'Departmental KPI Calibration'],
    ['Labour Relations', 'Collective Bargaining Agreement Execution'],
    ['Labour Relations', 'Tanzanian Employment Contract Compliance'],
    ['Labour Relations', 'Occupational Health and Safety Oversight'],
    ['Labour Relations', 'Fair Workplace Disciplinary Procedures'],
    ['HR Analytics', 'Predictive Employee Turnover Analytics'],
    ['HR Analytics', 'Staff Absenteeism Tracking and Intervention'],
    ['HR Analytics', 'Workforce Shift and Capacity Analytics'],
    ['HR Analytics', 'Recruitment Time-to-Hire Metrics'],
    ['Recruitment', 'Internal Job Mobility and Succession Filling'],
    ['Recruitment', 'Practical Skills Testing in Technical Hiring'],
    ['Recruitment', 'University Internship-to-Hire Pipelines'],
    ['Recruitment', 'Structured Shortlisting Panel Controls'],
    ['Workplace Ethics', 'Anti-Harassment Policy Enforcement'],
    ['Workplace Ethics', 'Confidential Ethics Reporting Channels'],
    ['Workplace Ethics', 'Conflict-of-Interest Disclosure Controls'],
    ['Workplace Ethics', 'Managerial Ethics Awareness Training'],
  ],
  records: [
    ['Records Management', 'Electronic Document and Records Management Systems (EDRMS)'],
    ['Records Management', 'File Classification Schemes and Retrieval Controls'],
    ['Records Management', 'Records Retention and Scheduled Disposal'],
    ['Records Management', 'Registry Mail Tracking and Indexing'],
    ['Archival Science', 'Preventive Conservation of Physical Archives'],
    ['Archival Science', 'Institutional Archive Appraisal Criteria'],
    ['Archival Science', 'Climate-Controlled Archival Storage'],
    ['Archival Science', 'Digital Archival Finding Aids'],
    ['Information Governance', 'Personal Data Protection and Privacy Controls'],
    ['Information Governance', 'Information Access Request Fulfilment'],
    ['Information Governance', 'Enterprise Information Lifecycle Governance'],
    ['Information Governance', 'Cross-Departmental Data Sharing Protocols'],
    ['Document Management', 'Optical Character Recognition (OCR) Digitisation'],
    ['Document Management', 'Document Version Control for Operating Procedures'],
    ['Document Management', 'Digital Signature Authentication in Official Records'],
    ['Document Management', 'Automated Invoice and Voucher Archiving'],
    ['Digital Archives', 'Long-Term PDF/A Archival Format Migration'],
    ['Digital Archives', 'Checksum Integrity Verification in Digital Repositories'],
    ['Digital Archives', 'Cloud Archival Backup and Redundancy'],
    ['Digital Archives', 'Open-Source Digital Repository Management'],
    ['Knowledge Management', 'Institutional Knowledge Capture before Staff Retirement'],
    ['Knowledge Management', 'Internal Lessons-Learned Knowledge Repositories'],
    ['Knowledge Management', 'Communities of Practice for Operational Learning'],
    ['Knowledge Management', 'Searchable Policy and Precedent Libraries'],
    ['Data Preservation', 'Disaster Preparedness for Vital Institutional Records'],
    ['Data Preservation', 'Off-Site Backup Rotation for Critical Registries'],
    ['Data Preservation', 'Media Obsolescence Mitigation in Audio-Visual Archives'],
    ['Data Preservation', 'Hybrid Physical and Digital Preservation'],
    ['Metadata Management', 'Standardised Dublin Core Metadata Tagging'],
    ['Metadata Management', 'Controlled Vocabularies for Document Discovery'],
    ['Metadata Management', 'Automated Metadata Extraction during Scanning'],
    ['Metadata Management', 'Audit-Trail Metadata for Legal Admissibility'],
    ['Records Security', 'Role-Based Access Controls in Confidential Registries'],
    ['Records Security', 'Physical Vault Security and Chain-of-Custody Logging'],
    ['Records Security', 'Encryption of Sensitive Personnel Records'],
    ['Records Security', 'Secure Record Destruction Protocols'],
    ['Compliance', 'ISO 15489 Records Management Alignment'],
    ['Compliance', 'Statutory Audit Readiness of Financial Records'],
    ['Compliance', 'Regulatory Recordkeeping Controls'],
    ['Compliance', 'Records Management Maturity Assessments'],
  ],
  metrology: [
    ['Quality Management', 'ISO 9001 Quality Management Systems'],
    ['Quality Management', 'Continuous Kaizen Process Improvement'],
    ['Quality Management', 'Root-Cause Analysis of Product Defects'],
    ['Quality Management', 'Incoming Supplier Material Quality Audits'],
    ['Measurement Systems', 'Commercial Weighbridge Accuracy Verification'],
    ['Measurement Systems', 'Flow-Meter Verification Controls'],
    ['Measurement Systems', 'Measurement Uncertainty Estimation'],
    ['Measurement Systems', 'Automated Sensor Drift Monitoring'],
    ['Standardisation', 'Pre-Packaged Goods Net-Weight Labelling'],
    ['Standardisation', 'Harmonised East African Product Standards'],
    ['Standardisation', 'Industrial Material Strength Standardisation'],
    ['Standardisation', 'HACCP Food Safety Standardisation'],
    ['Calibration', 'Traceable Equipment Calibration Scheduling'],
    ['Calibration', 'Analytical Balance Calibration Controls'],
    ['Calibration', 'Temperature and Humidity Logger Calibration'],
    ['Calibration', 'Electrical Metering Instrument Calibration'],
    ['Quality Assurance', 'Batch Sampling Inspection Plans'],
    ['Quality Assurance', 'Cold-Chain Temperature Integrity Monitoring'],
    ['Quality Assurance', 'Product Shelf-Life Verification Controls'],
    ['Quality Assurance', 'Dimensional Tolerance Quality Checks'],
    ['Metrology Instruments', 'Digital Weighing Scale Reliability Controls'],
    ['Metrology Instruments', 'Preventive Maintenance of Precision Instruments'],
    ['Metrology Instruments', 'Smart Utility Meter Accuracy Verification'],
    ['Metrology Instruments', 'Portable Market Surveillance Inspection Kits'],
    ['Compliance Testing', 'Pre-Market Product Certification Audits'],
    ['Compliance Testing', 'Import Consignment Conformity Verification (PVoC)'],
    ['Compliance Testing', 'Physicochemical Quality Compliance Testing'],
    ['Compliance Testing', 'Structural Material Conformity Testing'],
    ['ISO Standards', 'ISO/IEC 17025 Laboratory Competence'],
    ['ISO Standards', 'ISO 22000 Food Safety Certification'],
    ['ISO Standards', 'ISO 14001 Environmental Management Compliance'],
    ['ISO Standards', 'ISO 45001 Occupational Health Standardisation'],
    ['Laboratory Management', 'Laboratory Information Management Systems (LIMS)'],
    ['Laboratory Management', 'Inter-Laboratory Proficiency Testing'],
    ['Laboratory Management', 'Sample Chain-of-Custody Control'],
    ['Laboratory Management', 'Laboratory Reagent Inventory and Safety Control'],
    ['Statistical Quality Control', 'Control Chart Monitoring of Production Variance'],
    ['Statistical Quality Control', 'Six Sigma DMAIC Defect Reduction'],
    ['Statistical Quality Control', 'Process Capability Index (Cpk) Benchmarking'],
    ['Statistical Quality Control', 'Statistical Acceptance Sampling'],
  ],
  procurement: [
    ['Procurement Planning', 'Annual Procurement Plan Alignment'],
    ['Procurement Planning', 'Demand Forecasting in Procurement Budgeting'],
    ['Procurement Planning', 'Consolidated Bulk Purchasing'],
    ['Procurement Planning', 'Emergency Procurement Readiness'],
    ['Supplier Management', 'Vendor Pre-Qualification and Performance Scorecards'],
    ['Supplier Management', 'Long-Term Strategic Supplier Partnerships'],
    ['Supplier Management', 'Local Supplier Capacity Development'],
    ['Supplier Management', 'Multi-Supplier Risk Diversification'],
    ['Inventory Control', 'ABC-VED Selective Inventory Classification'],
    ['Inventory Control', 'Automated Reorder Point and Economic Order Quantity'],
    ['Inventory Control', 'Barcode and RFID Stock Verification'],
    ['Inventory Control', 'Slow-Moving and Obsolete Stock Reduction'],
    ['Logistics Management', 'Last-Mile Urban Delivery Route Optimisation'],
    ['Logistics Management', 'Third-Party Logistics (3PL) Outsourcing'],
    ['Logistics Management', 'Reverse Logistics and Return Handling'],
    ['Logistics Management', 'Cold-Chain Logistics Coordination'],
    ['Transport Operations', 'GPS Fleet Telematics and Fuel Control'],
    ['Transport Operations', 'Preventive Fleet Maintenance Scheduling'],
    ['Transport Operations', 'Container Turnaround Time Management'],
    ['Transport Operations', 'Intermodal Freight Transport Coordination'],
    ['Supply Chain Risk', 'Lead-Time Variability and Safety Stock Buffering'],
    ['Supply Chain Risk', 'Customs Clearance Delay Mitigation'],
    ['Supply Chain Risk', 'Import Disruption Contingency Planning'],
    ['Supply Chain Risk', 'Cargo Security and Transit Shrinkage Control'],
    ['Contracts Management', 'Service-Level Enforcement in Supply Contracts'],
    ['Contracts Management', 'Framework Agreement Utilisation'],
    ['Contracts Management', 'Contract Variation Approval Controls'],
    ['Contracts Management', 'Post-Award Delivery Milestone Inspections'],
    ['Warehousing', 'Warehouse Slotting and Order Picking Design'],
    ['Warehousing', 'Cross-Docking Depot Operations'],
    ['Warehousing', 'FIFO and FEFO Expiry Stock Controls'],
    ['Warehousing', 'Warehouse Space Utilisation and Safety Audits'],
    ['Distribution Management', 'Hub-and-Spoke Regional Distribution'],
    ['Distribution Management', 'Order Fulfilment Cycle Compression'],
    ['Distribution Management', 'Distributor Credit and Stockout Balancing'],
    ['Distribution Management', 'Automated Van Sales Distribution'],
    ['Public Procurement', 'Electronic Procurement (NeST) Transparency'],
    ['Public Procurement', 'Value-for-Money Competitive Tendering'],
    ['Public Procurement', 'Preferential Tendering for Local Suppliers'],
    ['Public Procurement', 'Tender Evaluation Integrity Controls'],
  ],
  finance: [
    ['Financial Reporting', 'IPSAS Accrual Financial Reporting'],
    ['Financial Reporting', 'IFRS for SMEs Financial Disclosure'],
    ['Financial Reporting', 'Cloud-Based Accounting Automation'],
    ['Financial Reporting', 'Timely Interim Financial Statement Preparation'],
    ['Auditing and Assurance', 'Risk-Based Internal Auditing'],
    ['Auditing and Assurance', 'Computer-Assisted Audit Techniques (CAATs)'],
    ['Auditing and Assurance', 'Audit Committee Independence and Oversight'],
    ['Auditing and Assurance', 'Forensic Accounting Fraud Detection'],
    ['Taxation', 'Electronic Fiscal Device (EFD) Compliance'],
    ['Taxation', 'Presumptive Tax Compliance Administration'],
    ['Taxation', 'Digital Tax Filing and Voluntary Compliance'],
    ['Taxation', 'VAT Refund Timeliness and Cash Flow Management'],
    ['Cost and Management Accounting', 'Activity-Based Costing in Service Pricing'],
    ['Cost and Management Accounting', 'Zero-Based Budgeting and Overhead Control'],
    ['Cost and Management Accounting', 'Standard Cost Variance Analysis'],
    ['Cost and Management Accounting', 'Break-Even Pricing and Margin Control'],
    ['Public Sector Accounting', 'Electronic Government Payment Gateway (GePG) Controls'],
    ['Public Sector Accounting', 'Own-Source Revenue Collection Controls'],
    ['Public Sector Accounting', 'Expenditure Tracking and Budget Discipline'],
    ['Public Sector Accounting', 'Fixed Asset Register Valuation'],
    ['Banking Operations', 'Agency Banking Liquidity Management'],
    ['Banking Operations', 'Digital Mobile Payment Settlement'],
    ['Banking Operations', 'Electronic Customer Onboarding (e-KYC)'],
    ['Banking Operations', 'Cross-Border Payment Processing Efficiency'],
    ['Credit Management', 'Credit Scoring Models and Loan Recovery'],
    ['Credit Management', 'Collateral Valuation and Default Prevention'],
    ['Credit Management', 'Flexible Credit Appraisal Controls'],
    ['Credit Management', 'Accounts Receivable Aging and Collection'],
    ['Risk Management', 'Enterprise Risk Management Frameworks'],
    ['Risk Management', 'Liquidity Stress Testing and Cash Buffering'],
    ['Risk Management', 'Foreign Exchange Exposure Hedging'],
    ['Risk Management', 'Anti-Money Laundering Transaction Monitoring'],
    ['Investment Analysis', 'Government Securities Portfolio Allocation'],
    ['Investment Analysis', 'Capital Market Investment Literacy'],
    ['Investment Analysis', 'Capital Budgeting Appraisal Techniques'],
    ['Investment Analysis', 'Collective Unit Trust Investment Participation'],
    ['Financial Inclusion', 'Mobile Micro-Savings and Digital Credit'],
    ['Financial Inclusion', 'Digital Financial Literacy Initiatives'],
    ['Financial Inclusion', 'Community Savings Group Digitalisation'],
    ['Financial Inclusion', 'Micro-Insurance Product Uptake'],
  ],
  entrepreneurship: [
    ['Entrepreneurship', 'Business Formalisation and Licensing Readiness'],
    ['Entrepreneurship', 'Family Business Succession Planning'],
    ['Entrepreneurship', 'Informal-to-Formal Enterprise Transition'],
    ['Entrepreneurship', 'Entrepreneurial Opportunity Recognition'],
    ['Innovation Management', 'Frugal Product Innovation'],
    ['Innovation Management', 'Digital Business Process Re-Engineering'],
    ['Innovation Management', 'University-Industry Innovation Partnerships'],
    ['Innovation Management', 'Customer Co-Creation in Service Design'],
    ['Business Model Design', 'Subscription and Pay-As-You-Go Revenue Models'],
    ['Business Model Design', 'Digital Platform Aggregator Models'],
    ['Business Model Design', 'Circular Economy Packaging and Waste Recovery'],
    ['Business Model Design', 'Asset-Light Franchising Expansion'],
    ['Startup Financing', 'Seed Capital and Investor Readiness'],
    ['Startup Financing', 'Blended Grant-and-Debt Venture Financing'],
    ['Startup Financing', 'Community Crowdfunding Potential'],
    ['Startup Financing', 'Working Capital Bootstrapping Disciplines'],
    ['Venture Creation', 'Minimum Viable Product Validation'],
    ['Venture Creation', 'Co-Founder Governance and Equity Structuring'],
    ['Venture Creation', 'Market Entry Timing Strategies'],
    ['Venture Creation', 'Regulatory Compliance for New Ventures'],
    ['Small Business Management', 'Separating Personal and Business Cash Flows'],
    ['Small Business Management', 'Daily Digital Bookkeeping Disciplines'],
    ['Small Business Management', 'Supplier Trade Credit Negotiation'],
    ['Small Business Management', 'Multi-Branch Expansion Controls'],
    ['Business Incubation', 'Business Incubation Mentorship Outcomes'],
    ['Business Incubation', 'Post-Accelerator Venture Survival'],
    ['Business Incubation', 'Shared Co-Working Ecosystem Networking'],
    ['Business Incubation', 'Investor Pitch Readiness Coaching'],
    ['Social Entrepreneurship', 'Clean Energy Micro-Distribution Models'],
    ['Social Entrepreneurship', 'Community Service Social Enterprises'],
    ['Social Entrepreneurship', 'Circular Recycling Enterprise Models'],
    ['Social Entrepreneurship', 'Inclusive Value-Chain Agribusiness Models'],
    ['Scaling Enterprises', 'Regional Export Market Readiness'],
    ['Scaling Enterprises', 'Nationwide E-Commerce Order Fulfilment'],
    ['Scaling Enterprises', 'Product Quality Certification for Growth'],
    ['Scaling Enterprises', 'Strategic Joint Ventures for Market Expansion'],
    ['Entrepreneurial Marketing', 'Referral-Driven Low-Budget Marketing'],
    ['Entrepreneurial Marketing', 'Social Commerce and Group Selling'],
    ['Entrepreneurial Marketing', 'Trade Fair Participation and B2B Leads'],
    ['Entrepreneurial Marketing', 'Founder-Led Digital Brand Building'],
  ],
  management: [
    ['Strategic Management', 'Competitive Positioning in Crowded Markets'],
    ['Strategic Management', 'Balanced Scorecard Strategy Execution'],
    ['Strategic Management', 'Strategic Alliances and Regional Expansion'],
    ['Strategic Management', 'Service Differentiation Strategies'],
    ['Operations Management', 'Lean Workflow Redesign and Bottleneck Removal'],
    ['Operations Management', 'Service Queue Management and Peak Scheduling'],
    ['Operations Management', 'Standard Operating Procedure Adherence'],
    ['Operations Management', 'Operational Capacity Utilisation Planning'],
    ['Business Ethics', 'Corporate Ethical Compliance Audits'],
    ['Business Ethics', 'Confidential Whistleblowing Safeguards'],
    ['Business Ethics', 'Fair Pricing and Consumer Protection Controls'],
    ['Business Ethics', 'Anti-Bribery and Integrity Controls'],
    ['Project Management', 'Agile Milestone Tracking in Institutional Projects'],
    ['Project Management', 'Stakeholder Engagement in Capital Projects'],
    ['Project Management', 'Project Cost Overrun Prevention'],
    ['Project Management', 'Monitoring and Evaluation Feedback Loops'],
    ['General Management', 'Decentralised Branch Autonomy and Oversight'],
    ['General Management', 'Annual Work-Plan Resource Prioritisation'],
    ['General Management', 'Managerial Delegation and Span-of-Control Design'],
    ['General Management', 'Digital Office Administration Workflows'],
    ['Business Communication', 'Internal Digital Communication Channels'],
    ['Business Communication', 'Crisis Communication Preparedness'],
    ['Business Communication', 'Cross-Departmental Management Reporting'],
    ['Business Communication', 'Structured Customer Feedback Loops'],
    ['Leadership', 'Transformational Leadership Styles'],
    ['Leadership', 'Participative Departmental Decision-Making'],
    ['Leadership', 'Executive Succession Planning'],
    ['Leadership', 'Servant Leadership in Service Delivery'],
    ['Quality Management', 'Total Quality Management (TQM) Culture'],
    ['Quality Management', 'SERVQUAL Service Quality Gap Closure'],
    ['Quality Management', 'Customer Complaint Resolution Turnaround'],
    ['Quality Management', 'Continuous Process Quality Auditing'],
    ['Change Management', 'Digital Workflow Transition Readiness'],
    ['Change Management', 'Managing Employee Resistance during Change'],
    ['Change Management', 'Post-Restructuring Cultural Integration'],
    ['Change Management', 'Structured Organisational Reform Leadership'],
    ['Corporate Governance', 'Board Oversight Independence'],
    ['Corporate Governance', 'Internal Control Governance Frameworks'],
    ['Corporate Governance', 'Stakeholder Financial Disclosure Transparency'],
    ['Corporate Governance', 'Risk and Compliance Committee Oversight'],
  ],
};

function domainFor(code, name) {
  const key = `${code} ${name}`.toLowerCase();
  if (/marketing|tourism|event|brand/.test(key)) return 'marketing';
  if (/information technology|information system|\bit\b/.test(key)) return 'it';
  if (/human resource|hrm/.test(key)) return 'hrm';
  if (/records|archives/.test(key)) return 'records';
  if (/metrology|standard/.test(key)) return 'metrology';
  if (/procurement|supplies|logistics|transport/.test(key)) return 'procurement';
  if (/account|auditing|tax|financ|bank|economics/.test(key)) return 'finance';
  if (/entrepreneur|innovation/.test(key)) return 'entrepreneurship';
  return 'management';
}

function categoriesFor(code, name) {
  const topics = DOMAIN_TOPICS[domainFor(code, name)];
  return Array.from(new Set(topics.map(([cat]) => cat)));
}

function departmentFor(code, name) {
  const key = `${code} ${name}`.toLowerCase();

  if (/metrology|standard/.test(key)) return 'Department of Metrology and Standardization';
  if (/information technology|information system/.test(key)) return 'Department of Information Technology';
  if (/records|archives/.test(key)) return 'Department of Records and Archives Management';
  if (/human resource|hrm/.test(key)) return 'Department of Human Resource Management';
  if (/procurement|supplies|logistics|transport/.test(key)) {
    return 'Department of Procurement, Logistics and Supply Chain';
  }
  if (/marketing|tourism|event/.test(key)) return 'Department of Marketing and Tourism';
  if (/account|auditing|tax|financ|bank|economics/.test(key)) {
    return 'Department of Accounting, Finance and Economics';
  }
  if (/entrepreneur|innovation/.test(key)) return 'Department of Entrepreneurship and Innovation';
  return 'Department of Management Studies';
}

const RAW_PROGRAMMES = {
  'Basic Technician Certificate': [
    ['Business Administration', 'BTCBA'],
    ['Accountancy', 'BTCA'],
    ['Banking and Finance Management', 'BTCBFM'],
    ['Marketing', 'BTCM'],
    ['Procurement and Supplies', 'BTCPS'],
    ['Metrology and Standardization', 'BTCMET'],
    ['Information Technology', 'BTCIT'],
    ['Business Administration in Human Resource', 'BTCBA-HRM'],
    ['Business Administration in Records and Archives Management', 'BTCBA-RAM'],
    ['Digital Marketing', 'BTCDM'],
    ['Accountancy and Taxation', 'BTCAT'],
    ['Accounting and Finance Management', 'BTCAFM'],
    ['Marketing in Tourism and Events Management', 'BTCM-TEM'],
    ['Economics and Finance', 'BTCEF'],
    ['Transport and Logistics Management', 'BTCTLM'],
    ['Entrepreneurship and Innovation', 'BTCEI'],
  ],
  'Ordinary Diploma': [
    ['Business Administration', 'DBA'],
    ['Accountancy', 'DA'],
    ['Banking and Finance Management', 'DBFM'],
    ['Marketing', 'DM'],
    ['Procurement and Supplies Management', 'DPS'],
    ['Metrology and Standardization', 'DMET'],
    ['Information Technology', 'DIT'],
    ['Business Administration in Human Resource Management', 'DBA-HRM'],
    ['Marketing in Tourism and Event Management', 'DM-TEM'],
    ['Digital Marketing', 'DDM'],
    ['Business Administration in Records and Archives Management', 'DBA-RAM'],
    ['Accounting and Finance', 'DAF'],
    ['Accounting and Taxation', 'DAT'],
    ['Economics and Finance', 'DEF'],
    ['Transport and Logistics Management', 'DTLM'],
    ['Entrepreneurship and Logistics Innovation', 'DEI'],
  ],
  'Bachelor Degree': [
    ['Business Administration', 'BBA'],
    ['Accountancy', 'BACC'],
    ['Banking and Finance Management', 'BBFM'],
    ['Marketing', 'BMK'],
    ['Procurement and Supplies Management', 'BPS'],
    ['Metrology and Standardization', 'BMET'],
    ['Information Technology', 'BIT'],
    ['Business Studies with Education', 'BBSE'],
    ['Business Administration in Human Resources Management', 'BBA-HRM'],
    ['Accountancy and Taxation', 'BAT'],
    ['Accounting and Finance', 'BAF'],
    ['Business Administration in Records and Archives Management', 'BBA-RAM'],
    ['Marketing in Tourism and Events Management', 'BMK-TEM'],
    ['Economics and Finance', 'BEF'],
    ['Transport and Logistics Management', 'BTLM'],
    ['Entrepreneurship and Innovation', 'BEI'],
  ],
};

export const BASE_PROGRAMMES = Object.entries(RAW_PROGRAMMES).flatMap(
  ([award, list], groupIndex) =>
    list.map(([name, code], i) => ({
      id: `p-${code.toLowerCase()}`,
      code,
      name,
      award,
      department: departmentFor(code, name),
      status: 'active',
      titleCount: code === 'BAF' ? 1760 : 1700 + ((groupIndex + i) % 5) * 20,
      categories: categoriesFor(code, name),
    }))
);

/* ------------------------------------------------------------------ */
/* Title generation — 1,700+ genuinely unique titles per programme      */
/* ------------------------------------------------------------------ */

function buildTitles(programme) {
  const rnd = mulberry32(hashStr(`v2-${programme.code}`));
  const topics = DOMAIN_TOPICS[domainFor(programme.code, programme.name)];
  const out = [];
  const seen = new Set();

  // Separate large combination spaces for sector+location and named-institution titles
  const generalSpace =
    GENERAL_TEMPLATES.length * topics.length * OUTCOMES.length * SECTORS.length * LOCATIONS.length;
  const namedSpace =
    NAMED_INSTITUTION_TEMPLATES.length * topics.length * OUTCOMES.length * NAMED_INSTITUTIONS.length;

  const makeStride = (space, salt) => {
    let s = (hashStr(`${programme.code}-${salt}`) % (space - 1)) + 1;
    if (s < 97) s += 97;
    while (gcd(s, space) !== 1) {
      s = (s % (space - 1)) + 1;
    }
    return s;
  };

  const gStride = makeStride(generalSpace, 'gen-stride');
  const gOffset = hashStr(`${programme.code}-gen-offset`) % generalSpace;
  const nStride = makeStride(namedSpace, 'named-stride');
  const nOffset = hashStr(`${programme.code}-named-offset`) % namedSpace;

  let gIdx = 0;
  let nIdx = 0;

  for (let i = 0; i < programme.titleCount; i += 1) {
    let text = '';
    let category = topics[0][0];

    // Pick a genuinely unique title (roughly 80% sector+location, 20% named institution)
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const useNamed = (i + attempt) % 5 === 4;
      if (useNamed) {
        const k = (nIdx * nStride + nOffset) % namedSpace;
        nIdx += 1;
        const tplIdx = k % NAMED_INSTITUTION_TEMPLATES.length;
        const rem1 = Math.floor(k / NAMED_INSTITUTION_TEMPLATES.length);
        const topicIdx = rem1 % topics.length;
        const rem2 = Math.floor(rem1 / topics.length);
        const outIdx = rem2 % OUTCOMES.length;
        const instIdx = Math.floor(rem2 / OUTCOMES.length) % NAMED_INSTITUTIONS.length;

        const [cat, topic] = topics[topicIdx];
        category = cat;
        text = NAMED_INSTITUTION_TEMPLATES[tplIdx]
          .replace('{T}', topic)
          .replace('{O}', OUTCOMES[outIdx])
          .replace('{N}', NAMED_INSTITUTIONS[instIdx]);
      } else {
        const k = (gIdx * gStride + gOffset) % generalSpace;
        gIdx += 1;
        const tplIdx = k % GENERAL_TEMPLATES.length;
        const rem1 = Math.floor(k / GENERAL_TEMPLATES.length);
        const topicIdx = rem1 % topics.length;
        const rem2 = Math.floor(rem1 / topics.length);
        const outIdx = rem2 % OUTCOMES.length;
        const rem3 = Math.floor(rem2 / OUTCOMES.length);
        const secIdx = rem3 % SECTORS.length;
        const locIdx = Math.floor(rem3 / SECTORS.length) % LOCATIONS.length;

        const [cat, topic] = topics[topicIdx];
        category = cat;
        text = GENERAL_TEMPLATES[tplIdx]
          .replace('{T}', topic)
          .replace('{O}', OUTCOMES[outIdx])
          .replace('{S}', SECTORS[secIdx])
          .replace('{L}', LOCATIONS[locIdx]);
      }

      const normKey = text.toLowerCase();
      if (!seen.has(normKey)) {
        seen.add(normKey);
        break;
      }
    }

    const n = i + 1;
    out.push({
      id: `t-${programme.code}-${pad(n, 4)}`,
      code: `${programme.code}/${pad(n, 4)}`,
      text,
      category,
      programmeId: programme.id,
      status: 'active',
      createdAt: new Date(
        Date.now() - (programme.titleCount - n) * 60000 - Math.floor(rnd() * 86400000)
      ).toISOString(),
    });
  }
  return out;
}

const titleCache = new Map();
export function baseTitles(programmeId) {
  if (!titleCache.has(programmeId)) {
    const prog = BASE_PROGRAMMES.find((p) => p.id === programmeId);
    if (!prog) return [];
    titleCache.set(programmeId, buildTitles(prog));
  }
  return titleCache.get(programmeId);
}

/** Base catalogue + admin additions + admin edits, memoised on db.rev. */
let mergeCache = { rev: null, list: null };
export function allTitles(db) {
  if (mergeCache.rev === db.rev && mergeCache.list) return mergeCache.list;
  const list = [];
  db.programmes.forEach((p) => {
    if (!baseTitles(p.id).length && !db.titleAdds.some((t) => t.programmeId === p.id)) return;
    baseTitles(p.id).forEach((t) => {
      const patch = db.titleOverrides[t.id];
      list.push(patch ? { ...t, ...patch } : t);
    });
  });
  db.titleAdds.forEach((t) => {
    const patch = db.titleOverrides[t.id];
    list.push(patch ? { ...t, ...patch } : t);
  });
  mergeCache = { rev: db.rev, list };
  return list;
}

export function titlesOf(db, programmeId) {
  return allTitles(db).filter((t) => t.programmeId === programmeId);
}

/* ------------------------------------------------------------------ */
/* Seed: historical students + selections so red "UNAVAILABLE" rows     */
/* exist from the first page load                                       */
/* ------------------------------------------------------------------ */

const FIRST_NAMES = [
  'Amina', 'Baraka', 'Neema', 'Frank', 'Rehema', 'Joseph', 'Zainabu', 'Deo',
  'Happiness', 'Kelvin', 'Grace', 'Emmanuel', 'Hawa', 'Peter', 'Sarah',
  'Godfrey', 'Upendo', 'Michael', 'Fatuma', 'Daniel', 'Joyce', 'Emanuel',
  'Sophia', 'Julius', 'Anna', 'Thomas', 'Halima', 'Benedict', 'Christina',
  'David', 'Elizabeth', 'George', 'Isaya', 'Maria', 'Noel', 'Tumaini',
];

const SURNAMES = [
  'Mwakalinga', 'Mushi', 'Juma', 'Kimaro', 'Mrisho', 'Sanga', 'Ndosi',
  'Massawe', 'Mwakasege', 'Ally', 'Mwambe', 'Chacha', 'Mrema', 'Shirima',
  'Mabula', 'Komba', 'Lyimo', 'Bakari', 'Salum', 'Mgaya', 'Mnyika', 'Urassa',
  'Mwakyusa', 'Kessy', 'Mkumbo', 'Ngoya', 'Mwakatobe', 'Rweyemamu',
  'Mwamnyeto', 'Kway', 'Sanga', 'Mnyamzi', 'Chuwa', 'Mgeni', 'Mwenda',
];

const SEED_SELECTION_COUNT = 1021; // 2 released + 1,019 active

function seedHistory(db) {
  const rnd = mulberry32(hashStr('reportsafi-selection-seed'));
  const yearPool = [2023, 2024, 2025];
  const titlesByProgramme = new Map();
  const usedTitleIds = new Set();
  let seq = 1;
  let refSeq = 412;
  let programmeIndex = 0;

  while (db.selections.length < SEED_SELECTION_COUNT) {
    const programme = db.programmes[programmeIndex % db.programmes.length];
    programmeIndex += 1;

    if (!titlesByProgramme.has(programme.id)) {
      titlesByProgramme.set(programme.id, baseTitles(programme.id));
    }
    const titles = titlesByProgramme.get(programme.id);

    let title = null;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const candidate = titles[Math.floor(rnd() * titles.length)];
      if (!usedTitleIds.has(candidate.id)) {
        title = candidate;
        break;
      }
    }
    if (!title) continue;

    usedTitleIds.add(title.id);

    const names = `${pick(FIRST_NAMES, rnd)} ${pick(SURNAMES, rnd)} ${pick(SURNAMES, rnd)}`;
    const regNo = `${programme.code}/${pick(yearPool, rnd)}/${pad(Math.floor(rnd() * 90000) + 1000, 5)}`;
    const phone = `+255${pick(['6', '7'], rnd)}${pad(Math.floor(rnd() * 900000000) + 100000000, 9)}`;
    const selectedAt = new Date(
      Date.now() - Math.floor(rnd() * 90 * 86400000) - 3600000
    ).toISOString();

    const student = {
      id: `stu-${seq}`,
      regNo,
      names,
      phone,
      supervisorName: '',
      programmeId: programme.id,
      createdAt: selectedAt,
      updatedAt: selectedAt,
    };

    db.students.push(student);
    db.selections.push({
      id: `sel-${seq}`,
      ref: `RS-TS-${new Date(selectedAt).getFullYear()}-${pad(refSeq, 5)}`,
      studentId: student.id,
      titleId: title.id,
      status: 'active',
      selectedAt,
      releasedAt: null,
      releaseReason: null,
      releasedBy: null,
      editedAt: null,
      editCount: 0,
      previousTitleCode: null,
      previousTitleText: null,
      editNote: null,
      editHistory: [],
    });
    seq += 1;
    refSeq += 1;
  }

  db.counters.ref = refSeq;

  // A couple of released selections so the audit trail is not empty
  const released = db.selections.slice(0, 2);
  released.forEach((sel, i) => {
    sel.status = 'released';
    sel.releasedAt = new Date(Date.now() - (i + 2) * 86400000).toISOString();
    sel.releaseReason = i === 0 ? 'Student graduated with a different topic area' : 'Duplicate registration record merged';
    sel.releasedBy = 'Registrar, Research Office';
  });

  db.audit = [
    {
      id: 'aud-1',
      at: new Date(Date.now() - 12 * 86400000).toISOString(),
      actor: 'Dr. M. Kessy',
      role: 'Administrator',
      action: 'title.import',
      entity: 'Title catalogue',
      entityId: 'BAF',
      summary: 'Imported 560 titles for BAF from CSV',
      reason: 'Annual catalogue update',
      before: '1,000 titles',
      after: '1,560 titles',
    },
    {
      id: 'aud-2',
      at: new Date(Date.now() - 9 * 86400000).toISOString(),
      actor: 'Dr. M. Kessy',
      role: 'Administrator',
      action: 'programme.create',
      entity: 'Programme',
      entityId: 'BIT',
      summary: 'Created programme BIT',
      reason: 'New intake approved',
      before: '—',
      after: 'Information Technology',
    },
    {
      id: 'aud-3',
      at: new Date(Date.now() - 5 * 86400000).toISOString(),
      actor: 'Registrar, Research Office',
      role: 'System administrator',
      action: 'selection.release',
      entity: 'Selection',
      entityId: db.selections[0]?.ref || '—',
      summary: `Released ${db.selections[0]?.ref || 'a selection'}`,
      reason: db.selections[0]?.releaseReason || '—',
      before: 'active',
      after: 'released',
    },
    {
      id: 'aud-4',
      at: new Date(Date.now() - 2 * 86400000).toISOString(),
      actor: 'Dr. A. Mnyamzi',
      role: 'Administrator',
      action: 'title.update',
      entity: 'Title',
      entityId: 'BBA/0007',
      summary: 'Edited title wording for clarity',
      reason: 'Supervisor request',
      before: '…Profitability of SMEs…',
      after: '…Profitability of Small and Medium Enterprises…',
    },
    {
      id: 'aud-5',
      at: new Date(Date.now() - 20 * 3600000).toISOString(),
      actor: 'Registrar, Research Office',
      role: 'System administrator',
      action: 'auth.login',
      entity: 'Administrator account',
      entityId: 'controller',
      summary: 'Signed in to the admin workspace',
      reason: '—',
      before: '—',
      after: '—',
    },
  ];
}

function seedDB() {
  const db = {
    v: DB_VERSION,
    rev: 1,
    programmes: BASE_PROGRAMMES.map(({ titleCount: _seedCount, categories: _seedCats, ...rest }) => ({ ...rest })),
    titleAdds: [],
    titleOverrides: {},
    students: [],
    selections: [],
    orders: [],
    siteContent: {},
    audit: [],
    counters: { ref: 412, orderRef: 0 },
    admins: [
      {
        id: 'adm-1',
        username: 'neemamndeme37@gmail.com',
        name: 'Neema',
        role: 'Administrator',
        pwHash: demoHash('Neema1998?@'),
        status: 'active',
      },
    ],
    seededAt: new Date().toISOString(),
  };
  seedHistory(db);
  return db;
}

/* ------------------------------------------------------------------ */
/* Persistence                                                          */
/* ------------------------------------------------------------------ */

export function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      if (db && db.v === DB_VERSION) {
        if (!Array.isArray(db.orders)) db.orders = [];
        if (!db.siteContent || typeof db.siteContent !== 'object') db.siteContent = {};
        if (!db.counters) db.counters = { ref: 412, orderRef: 0 };
        if (typeof db.counters.orderRef !== 'number') db.counters.orderRef = 0;
        return db;
      }
    }
  } catch (err) {
    console.warn('Stored portal data could not be read, reseeding.', err);
  }
  const fresh = seedDB();
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  } catch (err) {
    console.warn('Portal data could not be persisted.', err);
  }
  return fresh;
}

export function saveDB(db) {
  db.rev = (db.rev || 0) + 1;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  broadcast();
  return db;
}

/* Cross-tab notification so two open browsers see the same availability. */
let channel = null;
function broadcast() {
  try {
    if (!channel && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('reportsafi-portal');
    }
    channel?.postMessage({ type: 'db', rev: Date.now() });
  } catch {
    /* storage event fallback is enough */
  }
}

export function subscribe(cb) {
  const onStorage = (e) => {
    if (e.key === DB_KEY) cb();
  };
  const onMessage = () => cb();
  window.addEventListener('storage', onStorage);
  try {
    if (!channel && 'BroadcastChannel' in window) channel = new BroadcastChannel('reportsafi-portal');
    channel?.addEventListener('message', onMessage);
  } catch {
    /* noop */
  }
  return () => {
    window.removeEventListener('storage', onStorage);
    try {
      channel?.removeEventListener('message', onMessage);
    } catch {
      /* noop */
    }
  };
}

/* ------------------------------------------------------------------ */
/* Exclusive lock — stands in for a DB transaction (PRD §5.3, §10)       */
/* ------------------------------------------------------------------ */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withLock(fn, { timeout = 4000 } = {}) {
  const started = Date.now();
  const owner = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  for (;;) {
    let held = null;
    try {
      held = JSON.parse(localStorage.getItem(LOCK_KEY) || 'null');
    } catch {
      held = null;
    }

    if (held && held.owner !== owner && Date.now() - held.ts < 1500) {
      if (Date.now() - started > timeout) {
        const err = new Error('The portal is receiving many requests right now. Please try again.');
        err.code = 'busy';
        throw err;
      }
      await wait(20 + Math.random() * 30);
      continue;
    }

    localStorage.setItem(LOCK_KEY, JSON.stringify({ owner, ts: Date.now() }));
    const confirm = JSON.parse(localStorage.getItem(LOCK_KEY) || 'null');
    if (confirm && confirm.owner === owner) break;
    await wait(20);
  }

  try {
    return await fn();
  } finally {
    try {
      const current = JSON.parse(localStorage.getItem(LOCK_KEY) || 'null');
      if (current && current.owner === owner) localStorage.removeItem(LOCK_KEY);
    } catch {
      localStorage.removeItem(LOCK_KEY);
    }
  }
}

export { normReg, normPhone };
