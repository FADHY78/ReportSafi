// Master Seeds for Faculties, Courses, and Research Titles across all Tanzanian Universities

export const initialFaculties = [
  {
    id: "fac-business",
    nameSw: "Biashara na Utawala",
    nameEn: "Business & Administration",
    iconType: "briefcase",
    descSw: "Ugavi, Masoko, Rasilimali Watu, na Utawala wa Biashara (IFM, UDSM, CBE, TIA, MZUMBE, OUT)",
    descEn: "Procurement, Marketing, HRM & Business Management (IFM, UDSM, CBE, TIA, MZUMBE, OUT)"
  },
  {
    id: "fac-it",
    nameSw: "Teknolojia ya Habari na Kompyuta",
    nameEn: "IT & Computer Science",
    iconType: "monitor",
    descSw: "Sayansi ya Kompyuta, Programu, IT na Mtandao (IFM, UDSM, DIT, UDOM, MUST)",
    descEn: "Computer Science, Software, IT & Networking (IFM, UDSM, DIT, UDOM, MUST)"
  },
  {
    id: "fac-acc-fin",
    nameSw: "Uhasibu na Fedha",
    nameEn: "Accounting & Finance",
    iconType: "calculator",
    descSw: "Uhasibu wa Kitaalamu, Fedha, Benki na Kodi (IFM, CBE, TIA, IAA, UDSM, MZUMBE)",
    descEn: "Professional Accounting, Banking, Finance & Tax (IFM, CBE, TIA, IAA, UDSM, MZUMBE)"
  },
  {
    id: "fac-engineering",
    nameSw: "Uhandisi na Teknolojia",
    nameEn: "Engineering & Technology",
    iconType: "gear",
    descSw: "Uhandisi wa Majengo, Umeme, Mitambo na Mawasiliano (DIT, UDSM, MUST, ARDHI)",
    descEn: "Civil, Electrical, Mechanical & Telecom Engineering (DIT, UDSM, MUST, ARDHI)"
  },
  {
    id: "fac-edu",
    nameSw: "Elimu na Ualimu",
    nameEn: "Education & Pedagogy",
    iconType: "graduation",
    descSw: "Ualimu wa Sanaa, Sayansi, na Usimamizi wa Elimu (UDSM, UDOM, SAUT, OUT, DUCE)",
    descEn: "Arts & Science Education, Educational Planning (UDSM, UDOM, SAUT, OUT, DUCE)"
  },
  {
    id: "fac-health",
    nameSw: "Sayansi ya Afya na Tiba",
    nameEn: "Health & Medical Sciences",
    iconType: "stethoscope",
    descSw: "Uuguzi, Famasi, Tiba, na Afya ya Jamii (MUHAS, CUHAS, UDOM, KCMUCo)",
    descEn: "Nursing, Pharmacy, Medicine & Public Health (MUHAS, CUHAS, UDOM, KCMUCo)"
  },
  {
    id: "fac-soc",
    nameSw: "Sayansi ya Jamii na Maendeleo",
    nameEn: "Social Sciences & Development",
    iconType: "users",
    descSw: "Sociology, Uhusiano wa Umma, na Maendeleo ya Jamii (UDSM, SAUT, UDOM, IRDP)",
    descEn: "Sociology, Public Relations & Community Development (UDSM, SAUT, UDOM, IRDP)"
  },
  {
    id: "fac-law",
    nameSw: "Sheria na Haki",
    nameEn: "Faculty of Law",
    iconType: "scale",
    descSw: "Sheria ya Biashara, Haki za Binafsi na Utawala (UDSM, OUT, MZUMBE, SAUT, UDOM)",
    descEn: "Corporate Law, Criminal Justice & Governance (UDSM, OUT, MZUMBE, SAUT, UDOM)"
  },
  {
    id: "fac-agri",
    nameSw: "Kilimo na Mazingira",
    nameEn: "Agriculture & Environment",
    iconType: "sprout",
    descSw: "Uchumi wa Kilimo, Misitu na Mazingira (SUA, UDOM, OUT)",
    descEn: "Agricultural Economics, Forestry & Climate (SUA, UDOM, OUT)"
  },
  {
    id: "fac-tour",
    nameSw: "Utalii na Ukarimu",
    nameEn: "Tourism & Hospitality",
    iconType: "compass",
    descSw: "Usimamizi wa Hifadhi, Utalii na Hoteli (UDSM, SAUT, SUA, CBE)",
    descEn: "Wildlife Management, Tourism & Hospitality (UDSM, SAUT, SUA, CBE)"
  },
  {
    id: "fac-transport",
    nameSw: "Usafirishaji na Logistiki",
    nameEn: "Transport & Logistics",
    iconType: "truck",
    descSw: "Usimamizi wa Usafiri, Bandari na Ugavi wa Kimataifa (NIT, CBE, IFM)",
    descEn: "Transport Management, Logistics & Freight (NIT, CBE, IFM)"
  },
  {
    id: "fac-cooperative",
    nameSw: "Ushirika na Serikali za Mitaa",
    nameEn: "Co-operative & Local Government",
    iconType: "building",
    descSw: "Usimamizi wa Ushirika na Serikali za Mitaa (MoCU, LGTI, IRDP)",
    descEn: "Co-operative Management & Local Government (MoCU, LGTI, IRDP)"
  }
];

export const initialCourses = [
  // Business & Administration
  { id: "c-bsp", facultyId: "fac-business", code: "BSP-SCM", nameSw: "Bachelor of Science in Supply Chain Management", nameEn: "Bachelor of Science in Supply Chain Management" },
  { id: "c-bba", facultyId: "fac-business", code: "BBA-HRM", nameSw: "Bachelor of Business Administration (HRM)", nameEn: "Bachelor of Business Administration (HRM)" },
  { id: "c-psm", facultyId: "fac-business", code: "CPSP-T", nameSw: "Certified Procurement and Supply Professional", nameEn: "Certified Procurement and Supply Professional" },
  { id: "c-bmk", facultyId: "fac-business", code: "BCom-MKT", nameSw: "Bachelor of Commerce in Marketing", nameEn: "Bachelor of Commerce in Marketing" },

  // IT & Computing
  { id: "c-bsc-it", facultyId: "fac-it", code: "BSc-IT", nameSw: "Bachelor of Science in Information Technology", nameEn: "Bachelor of Science in Information Technology" },
  { id: "c-bsc-cs", facultyId: "fac-it", code: "BSc-CS", nameSw: "Bachelor of Science in Computer Science", nameEn: "Bachelor of Science in Computer Science" },
  { id: "c-bsc-se", facultyId: "fac-it", code: "BSc-SE", nameSw: "Bachelor of Science in Software Engineering", nameEn: "Bachelor of Science in Software Engineering" },
  { id: "c-dit-it", facultyId: "fac-it", code: "OD-IT", nameSw: "Ordinary Diploma in Information Technology", nameEn: "Ordinary Diploma in Information Technology" },

  // Accounting & Finance
  { id: "c-bcom-acc", facultyId: "fac-acc-fin", code: "BCom-ACC", nameSw: "Bachelor of Commerce in Accounting", nameEn: "Bachelor of Commerce in Accounting" },
  { id: "c-bsc-bf", facultyId: "fac-acc-fin", code: "BSc-BF", nameSw: "Bachelor of Science in Banking and Finance", nameEn: "Bachelor of Science in Banking and Finance" },
  { id: "c-tax", facultyId: "fac-acc-fin", code: "BD-TAX", nameSw: "Bachelor of Degree in Tax Management", nameEn: "Bachelor of Degree in Tax Management" },

  // Engineering & Technology
  { id: "c-beng-civ", facultyId: "fac-engineering", code: "BEng-CIV", nameSw: "Bachelor of Engineering in Civil Engineering", nameEn: "Bachelor of Engineering in Civil Engineering" },
  { id: "c-beng-elec", facultyId: "fac-engineering", code: "BEng-ELE", nameSw: "Bachelor of Engineering in Electrical & Telecom", nameEn: "Bachelor of Engineering in Electrical & Telecom" },
  { id: "c-beng-mech", facultyId: "fac-engineering", code: "BEng-MEC", nameSw: "Bachelor of Engineering in Mechanical Engineering", nameEn: "Bachelor of Engineering in Mechanical Engineering" },
  { id: "c-ardhi-qs", facultyId: "fac-engineering", code: "BSc-QS", nameSw: "Bachelor of Science in Quantity Surveying", nameEn: "Bachelor of Science in Quantity Surveying" },

  // Education
  { id: "c-bed-arts", facultyId: "fac-edu", code: "BED-ARTS", nameSw: "Bachelor of Education in Arts", nameEn: "Bachelor of Education in Arts" },
  { id: "c-bed-sc", facultyId: "fac-edu", code: "BED-SCI", nameSw: "Bachelor of Education in Science", nameEn: "Bachelor of Education in Science" },
  { id: "c-bed-ep", facultyId: "fac-edu", code: "BED-EPM", nameSw: "Bachelor of Education in Policy & Management", nameEn: "Bachelor of Education in Policy & Management" },

  // Health Sciences
  { id: "c-bsn", facultyId: "fac-health", code: "BSc-NUR", nameSw: "Bachelor of Science in Nursing", nameEn: "Bachelor of Science in Nursing" },
  { id: "c-bpharm", facultyId: "fac-health", code: "BPharm", nameSw: "Bachelor of Pharmacy", nameEn: "Bachelor of Pharmacy" },
  { id: "c-md", facultyId: "fac-health", code: "MD", nameSw: "Doctor of Medicine (MD)", nameEn: "Doctor of Medicine (MD)" },

  // Social Sciences & Law
  { id: "c-llb", facultyId: "fac-law", code: "LL.B", nameSw: "Bachelor of Laws (LL.B)", nameEn: "Bachelor of Laws (LL.B)" },
  { id: "c-ba-soc", facultyId: "fac-soc", code: "BA-SOC", nameSw: "Bachelor of Arts in Sociology", nameEn: "Bachelor of Arts in Sociology" },
  { id: "c-ba-mass", facultyId: "fac-soc", code: "BA-MC", nameSw: "Bachelor of Arts in Mass Communication", nameEn: "Bachelor of Arts in Mass Communication" },

  // Agriculture, Tourism & Transport
  { id: "c-bsc-agri", facultyId: "fac-agri", code: "BSc-AGRI", nameSw: "Bachelor of Science in Agriculture General", nameEn: "Bachelor of Science in Agriculture General" },
  { id: "c-bsc-tour", facultyId: "fac-tour", code: "BSc-THM", nameSw: "Bachelor of Tourism and Hospitality Management", nameEn: "Bachelor of Tourism and Hospitality Management" },
  { id: "c-bsc-log", facultyId: "fac-transport", code: "BSc-LOG", nameSw: "Bachelor of Science in Logistics and Transport", nameEn: "Bachelor of Science in Logistics and Transport" },
  { id: "c-bpa-lgti", facultyId: "fac-cooperative", code: "BPA-LGM", nameSw: "Bachelor of Public Administration in Local Government", nameEn: "Bachelor of Public Administration in Local Government" }
];

export const initialTitles = [
  // 1. BUSINESS & ADMINISTRATION
  {
    id: "title-01",
    courseId: "c-bsp",
    universityTag: "IFM",
    title: "Assessment of E-Procurement Adoption in Public Sector Procurement Performance",
    year: "2024/2025",
    status: "available",
    abstract: "Tathmini ya kina juu ya athari za mfumo wa kielektroniki wa uagizaji (NeST) katika kuongeza uwazi na kupunguza upotevu wa fedha katika taasisi za serikali nchini Tanzania."
  },
  {
    id: "title-02",
    courseId: "c-bsp",
    universityTag: "CBE",
    title: "Evaluating Inventory Control Techniques on Organizational Profitability in Retail Operations",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa mbinu za usimamizi wa stoo na bidhaa (EOQ, JIT) katika kupunguza gharama za uendeshaji kwa wafanyabiashara wa rejareja Kariakoo Dar es Salaam."
  },
  {
    id: "title-15",
    courseId: "c-bsp",
    universityTag: "TIA",
    title: "The Role of Supplier Relationship Management on Quality Delivery in Public Health Sector",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa mchango wa uhusiano mzuri na wazabuni wa dawa na vifaa tiba katika kuboresha utoaji wa huduma za afya kwenye hospitali za rufaa."
  },
  {
    id: "title-16",
    courseId: "c-bba",
    universityTag: "MZUMBE",
    title: "Impact of Employee Reward Systems on Job Performance in Public Higher Education Institutions",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa athari za mifumo ya zawadi na marupurupu kwa watumishi wa vyuo vikuu katika kuongeza ufanisi wa kazi na kupunguza utoro."
  },
  {
    id: "title-17",
    courseId: "c-bba",
    universityTag: "UDSM",
    title: "Strategic Talent Management Practices and Employee Retention in Telecommunication Sector",
    year: "2024/2025",
    status: "available",
    abstract: "Uchunguzi wa mbinu za kukuza na kuhifadhi wafanyakazi wenye vipaji vya hali ya juu kwenye makampuni ya simu kama Vodacom na Tigo."
  },
  {
    id: "title-18",
    courseId: "c-bmk",
    universityTag: "CBE",
    title: "Influence of Social Media Marketing Strategies on Brand Loyalty Among Gen Z Consumers",
    year: "2025/2026",
    status: "available",
    abstract: "Utafiti wa mchango wa matangazo ya mtandaoni (Instagram & TikTok) katika kujenga uaminifu wa bidhaa kwa vijana wa Dar es Salaam."
  },
  {
    id: "title-19",
    courseId: "c-psm",
    universityTag: "TIA",
    title: "Sustainable Procurement Practices and Environmental Compliance in Manufacturing Firms",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa taratibu za ununuzi unaojali mazingira (Green Procurement) kwenye viwanda vya uzalishaji Pugu na Kibaha."
  },

  // 2. IT & COMPUTER SCIENCE
  {
    id: "title-03",
    courseId: "c-bsc-it",
    universityTag: "IFM",
    title: "Design and Implementation of Web-Based Student Field Management System",
    year: "2025/2026",
    status: "available",
    abstract: "Muundo na uundaji wa mfumo wa kidijitali wa kuratibu, kufuatilia na kutathmini taarifa za mafunzo kwa vitendo (Field Work) kwa wanafunzi wa vyuo vikuu."
  },
  {
    id: "title-04",
    courseId: "c-bsc-se",
    universityTag: "DIT",
    title: "Automated Fraud Detection Model using Machine Learning for Mobile Money Transactions",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa matumizi ya kanuni za Akili Bandia (Machine Learning) katika kugundua miamala ya utapeli kwenye mifumo ya fedha za simu (M-Pesa, Tigo Pesa, Airtel Money)."
  },
  {
    id: "title-20",
    courseId: "c-bsc-cs",
    universityTag: "UDSM",
    title: "AI-Powered Swahili Speech Recognition System for Automated Customer Service Support",
    year: "2025/2026",
    status: "available",
    abstract: "Utafiti wa maendeleo ya mfumo wa Akili Bandia wa kutambua na kutafsiri sauti ya Kiswahili kwa ajili ya kutoa msaada wa kiotomatiki wa wateja."
  },
  {
    id: "title-21",
    courseId: "c-bsc-it",
    universityTag: "UDOM",
    title: "Blockchain Framework for Secure Academic Credential Verification in Tanzania Universities",
    year: "2024/2025",
    status: "available",
    abstract: "Uundaji wa mfumo wa teknolojia ya Blockchain kuzuia ughushi wa vyeti vya taaluma na kuhakikisha uhakiki wa haraka wa vyeti vya mafunzo."
  },
  {
    id: "title-22",
    courseId: "c-dit-it",
    universityTag: "DIT",
    title: "Smart Internet of Things (IoT) Solar-Powered Irrigation Monitoring System for Rural Farmers",
    year: "2024/2025",
    status: "available",
    abstract: "Mfumo wa vifaa vya IoT unaotegemea umeme wa jua kusimamia na kumwagilia mazao kiotomatiki kulingana na unyevunyevu wa udongo."
  },

  // 3. ACCOUNTING & FINANCE
  {
    id: "title-05",
    courseId: "c-bcom-acc",
    universityTag: "TIA",
    title: "The Impact of Electronic Fiscal Devices (EFDs) on Tax Compliance Among SMEs",
    year: "2024/2025",
    status: "available",
    abstract: "Tathmini ya mchango wa matumizi ya mashine za EFD katika kuboresha ukusanyaji wa kodi ya Ongezeko la Thamani (VAT) kwa wafanyabiashara wadogo na wa kati (TRA)."
  },
  {
    id: "title-06",
    courseId: "c-bcom-acc",
    universityTag: "UDSM",
    title: "Corporate Governance Practices and Financial Performance of Commercial Banks in Tanzania",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa athari za uongozi bora wa makampuni katika kuongeza faida na usalama wa amana za wateja kwenye benki za biashara nchini."
  },
  {
    id: "title-23",
    courseId: "c-bsc-bf",
    universityTag: "IFM",
    title: "Assessment of Mobile Banking Adoption on Financial Inclusion in Peri-Urban Communities",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa jinsi huduma za benki kupitia simu za mkononi zilivyofanikisha upatikanaji wa huduma za kifedha kwa wananchi wa maeneo ya mipakani mwa miji."
  },
  {
    id: "title-24",
    courseId: "c-tax",
    universityTag: "CBE",
    title: "Evaluating Tax Administration Reforms on Non-Tax Revenue Collection in Tanzania",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa mageuzi ya mifumo ya kodi katika kuboresha ukusanyaji wa maduhuli ya serikali yasiyo ya kodi kupitia mfumo wa GePG."
  },

  // 4. ENGINEERING & TECHNOLOGY
  {
    id: "title-07",
    courseId: "c-beng-civ",
    universityTag: "DIT",
    title: "Structural Performance Evaluation of Recycled Aggregates in Sustainable Concrete Production",
    year: "2024/2025",
    status: "available",
    abstract: "Uchunguzi wa kimaabara wa uimara wa zege inayotumia vifaa vilivyorejeshwa kuzuia uharibifu wa mazingira na kupunguza gharama za ujenzi wa barabara."
  },
  {
    id: "title-08",
    courseId: "c-beng-civ",
    universityTag: "MUST",
    title: "Assessment of Urban Drainage System Capacity in Mitigating Flood Risks in Mbeya City",
    year: "2025/2026",
    status: "available",
    abstract: "Tathmini ya uwezo wa miundombinu ya mifereji ya maji ya mvua katika kuzuia mafuriko maeneo ya mijini na kutoa miongozo ya kuboresha muundo."
  },
  {
    id: "title-25",
    courseId: "c-ardhi-qs",
    universityTag: "ARDHI",
    title: "Building Information Modeling (BIM) Integration for Cost Estimation Accuracy in High-Rise Projects",
    year: "2025/2026",
    status: "available",
    abstract: "Tathmini ya matumizi ya programu za kidijitali za BIM katika kuboresha usahihi wa makisio ya gharama kwenye ujenzi wa ghorofa ndefu Dar es Salaam."
  },
  {
    id: "title-26",
    courseId: "c-beng-elec",
    universityTag: "DIT",
    title: "Performance Optimization of Microgrid Power Distribution Systems using Hybrid Renewable Energy",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa kuongeza ufanisi wa mifumo ya umeme wa jua na upepo kwenye maeneo ya vijijini yasiyofikiwa na mtandao wa kitaifa wa TANESCO."
  },

  // 5. EDUCATION & HEALTH
  {
    id: "title-11",
    courseId: "c-bsn",
    universityTag: "MUHAS",
    title: "Factors Influencing Infection Control Compliance Among Nurses in Emergency Units",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa visababishi vinavyoathiri uzingatiaji wa taratibu za kujikinga na maambukizi ya hospitali (IPC) miongoni mwa wauguzi wa idara ya dharura."
  },
  {
    id: "title-27",
    courseId: "c-bpharm",
    universityTag: "MUHAS",
    title: "Evaluation of Antibiotic Resistance Patterns in Common Bacterial Pathogens in Referral Hospitals",
    year: "2024/2025",
    status: "available",
    abstract: "Uchunguzi wa kimaabara kuhusu usugu wa dawa za antibayotiki dhidi ya bakteria wanaoenea kwa kasi kwenye hospitali za rufaa."
  },
  {
    id: "title-28",
    courseId: "c-bed-arts",
    universityTag: "UDSM",
    title: "Impact of Competence-Based Curriculum (CBC) Implementation on Secondary School Learning Outcomes",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa athari za utekelezaji wa mtaala wa umahiri katika ufundishaji na ujifunzaji wa masomo ya sanaa katika shule za sekondari."
  },

  // 6. LAW & SOCIAL SCIENCES
  {
    id: "title-09",
    courseId: "c-llb",
    universityTag: "UDSM",
    title: "Legal Protection of Consumer Data Rights in Digital Financial Services in Tanzania",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa kisheria kuhusu ulinzi wa taarifa za binafsi za wateja chini ya Sheria ya Ulinzi wa Taarifa za Binafsi ya Mwaka 2022 kwenye sekta ya kifedha."
  },
  {
    id: "title-10",
    courseId: "c-llb",
    universityTag: "MZUMBE",
    title: "Critique of Mandatory Arbitration Clauses in International Commercial Contracts",
    year: "2024/2025",
    status: "available",
    abstract: "Uchunguzi wa kisheria kuhusu utatuzi wa migogoro ya kibiashara ya kimataifa na nafasi ya mahakama za Tanzania katika kusimamia tuzo za usuluhishi."
  },
  {
    id: "title-29",
    courseId: "c-ba-mass",
    universityTag: "SAUT",
    title: "Role of Investigative Journalism in Promoting Accountability and Transparency in Public Sector",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa mchango wa uandishi wa habari za uchunguzi katika kufichua ubadhirifu wa mali za umma na kuboresha uwajibikaji."
  },

  // 7. AGRICULTURE, TRANSPORT & LOCAL GOV
  {
    id: "title-12",
    courseId: "c-bsc-agri",
    universityTag: "SUA",
    title: "Adoption of Climate-Smart Agricultural Practices and Maize Yield Response in Morogoro",
    year: "2024/2025",
    status: "available",
    abstract: "Tathmini ya athari za mbinu za kilimo kinachostahimili mabadiliko ya tabianchi katika kuongeza mavuno ya mahindi kwa wakulima wadogo."
  },
  {
    id: "title-13",
    courseId: "c-bsc-log",
    universityTag: "NIT",
    title: "Port Congestion Factors and Freight Transit Time Efficiency at Dar es Salaam Port",
    year: "2024/2025",
    status: "available",
    abstract: "Uchambuzi wa visababishi vya msongamano katika Bandari ya Dar es Salaam na athari zake kwenye usafirishaji wa mizigo kwenda nchi jirani (Transit Goods)."
  },
  {
    id: "title-14",
    courseId: "c-bpa-lgti",
    universityTag: "LGTI",
    title: "Role of Local Government Revenue Collection Systems (LGRCIS) in Community Projects",
    year: "2025/2026",
    status: "available",
    abstract: "Tathmini ya ufanisi wa mfumo wa kielektroniki wa ukusanyaji wa mapato ya halmashauri katika kufadhili miradi ya maendeleo ya jamii."
  },
  {
    id: "title-30",
    courseId: "c-bsc-tour",
    universityTag: "SAUT",
    title: "Eco-Tourism Management and Wildlife Conservation Strategies in Serengeti Ecosystem",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa athari za utalii wa kiikolojia katika kuongeza kipato cha wananchi wa mipakani mwa hifadhi huku wakilinda uoto wa asili."
  },
  {
    id: "title-31",
    courseId: "c-beng-mech",
    universityTag: "MUST",
    title: "Design and Thermal Efficiency Analysis of Solar Thermal Energy Collectors for Agro-Processing",
    year: "2025/2026",
    status: "available",
    abstract: "Muundo na tathmini ya ufanisi wa kukausha mazao ya kilimo (mazao ya nafaka na matunda) kwa kutumia mfumo wa nishati ya jua badala ya mkaa."
  },
  {
    id: "title-32",
    courseId: "c-bed-sc",
    universityTag: "UDOM",
    title: "Evaluating the Impact of Virtual Science Laboratory Simulations on Secondary School Physics Learning",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa mchango wa maabara za kidijitali za mtandaoni katika kuboresha uelewa wa fizikia na kemia kwa shule zisizo na vifaa vya kutosha vya maabara."
  },
  {
    id: "title-33",
    courseId: "c-bed-ep",
    universityTag: "OUT",
    title: "Assessment of Free Basic Education Policy Implementation on Infrastructure and Pupil-Teacher Ratio",
    year: "2024/2025",
    status: "available",
    abstract: "Tathmini ya utekelezaji wa sera ya elimu bila malipo katika kuathiri uwiano wa walimu na wanafunzi pamoja na miundombinu ya shule za msingi."
  },
  {
    id: "title-34",
    courseId: "c-md",
    universityTag: "MUHAS",
    title: "Prevalence and Risk Factors Associated with Uncontrolled Hypertension Among Adult Outpatients in Dar es Salaam",
    year: "2024/2025",
    status: "available",
    abstract: "Uchunguzi wa kliniki kuhusu ugonjwa wa shinikizo la juu la damu (Hypertension) na mambo yanayochangia kutodhibitiwa vyema kwa wagonjwa wa nje."
  },
  {
    id: "title-35",
    courseId: "c-ba-soc",
    universityTag: "UDSM",
    title: "Social Capital and Community Coping Mechanisms During Extreme Weather Events in Rural Coastal Tanzania",
    year: "2024/2025",
    status: "available",
    abstract: "Utafiti wa kijamii kuhusu mitandao ya ushirikiano wa kijamii na jinsi inavyosaidia familia za maeneo ya pwani kukabiliana na athari za mabadiliko ya tabianchi."
  }
];

export const initialUniversities = [
  { tag: "UDSM", name: "University of Dar es Salaam", logo: "/logos/udsm-logo.jpg", location: "Dar es Salaam" },
  { tag: "DIT", name: "Dar es Salaam Institute of Technology", logo: "/logos/dit-logo.jpg", location: "Dar es Salaam" },
  { tag: "IFM", name: "Institute of Finance Management", logo: "/logos/ifm-logo.jpg", location: "Dar es Salaam" },
  { tag: "CBE", name: "College of Business Education", logo: "/logos/cbe-logo.jpg", location: "Dar es Salaam" },
  { tag: "TIA", name: "Tanzania Institute of Accountancy", logo: "/logos/tia-logo.jpg", location: "Dar es Salaam / Mbeya" },
  { tag: "MUHAS", name: "Muhimbili University of Health and Allied Sciences", logo: "/logos/muhas-logo.jpg", location: "Dar es Salaam" },
  { tag: "ARDHI", name: "Ardhi University", logo: "/logos/ardhi-logo.jpg", location: "Dar es Salaam" },
  { tag: "SAUT", name: "St. Augustine University of Tanzania", logo: "/logos/saut-logo.jpg", location: "Mwanza / Dar es Salaam" },
  { tag: "MZUMBE", name: "Mzumbe University", logo: "/logos/mzumbe-logo.jpg", location: "Morogoro / Mbeya / Dar" },
  { tag: "SUA", name: "Sokoine University of Agriculture", logo: "/logos/udsm-logo.jpg", location: "Morogoro" },
  { tag: "UDOM", name: "University of Dodoma", logo: "/logos/udsm-logo.jpg", location: "Dodoma" },
  { tag: "OUT", name: "Open University of Tanzania", logo: "/logos/udsm-logo.jpg", location: "Dar es Salaam" },
  { tag: "NIT", name: "National Institute of Transport", logo: "/logos/dit-logo.jpg", location: "Dar es Salaam" },
  { tag: "MUST", name: "Mbeya University of Science and Technology", logo: "/logos/dit-logo.jpg", location: "Mbeya" },
  { tag: "LGTI", name: "Local Government Training Institute", logo: "/logos/cbe-logo.jpg", location: "Dodoma" },
  { tag: "IAA", name: "Institute of Accountancy Arusha", logo: "/logos/tia-logo.jpg", location: "Arusha" },
  { tag: "MoCU", name: "Moshi Co-operative University", logo: "/logos/cbe-logo.jpg", location: "Kilimanjaro" },
  { tag: "IRDP", name: "Institute of Rural Development Planning", logo: "/logos/ardhi-logo.jpg", location: "Dodoma" }
];
