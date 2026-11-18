// All facts below come from public reporting up to 18 Nov 2026.
// Every stage is tagged "confirmed" (stated by Amadeus or an affected airline)
// or "inferred" (my reasoning, based on how similar attacks usually work).

const SOURCES = {
  record: {
    label: "The Record: More Asian airlines announce data breaches after attack on Amadeus (4 Nov 2026)",
    url: "https://therecord.media/asian-airlines-announce-data-breach-it-provider-incident"
  },
  techradar: {
    label: "TechRadar: Singapore Airlines says 46,000 booking records hit following Amadeus breach",
    url: "https://techradar.com/pro/security/singapore-airlines-says-46-000-booking-records-hit-following-amadeus-breach"
  },
  nst: {
    label: "New Straits Times: Amadeus fixes booking system vulnerability amid airline data breaches (2 Nov 2026)",
    url: "https://www.nst.com.my/amp/business/corporate/2026/11/1569011/amadeus-fixes-booking-system-vulnerability-amid-airline-data"
  },
  star: {
    label: "The Star: Singapore Airlines says 46,000 booking records affected by Amadeus breach (4 Nov 2026)",
    url: "https://www.thestar.com.my/business/business-news/2026/11/04/singapore-airlines-says-46000-booking-records-affected-by-amadeus-breach"
  },
  bloomberg: {
    label: "Bloomberg: Singapore Air becomes latest carrier affected by data breach (4 Nov 2026)",
    url: "https://www.bloomberg.com/news/articles/2026-11-04/singapore-air-becomes-latest-carrier-affected-by-data-breach"
  },
  esp: {
    label: "eSecurity Planet: Cathay Pacific says Amadeus breach exposed data from 53,000 bookings",
    url: "https://www.esecurityplanet.com/news/news-cathay-pacific-amadeus-data-breach-apac-hongkong/"
  },
  cathay: {
    label: "Cathay Pacific: Personal data security incident involving a third-party service provider",
    url: "https://www.cathaypacific.com/cx/en_AU/latest-news/security-and-operational-changes/personal-data-security.html"
  },
  recordowl: {
    label: "RecordOwl (citing The Straits Times): SIA Amadeus 46,000 booking records breach",
    url: "https://recordowl.com/news/sia-amadeus-46000-booking-records-breach"
  },
  attack: {
    label: "MITRE ATT&CK Enterprise Matrix",
    url: "https://attack.mitre.org/"
  }
};

const STATS = [
  { value: "46,000", label: "Singapore Airlines booking records accessed", src: ["techradar", "star"] },
  { value: "~620", label: "of those also exposed email, phone, travel document or KrisFlyer number", src: ["techradar"] },
  { value: "3 yrs+", label: "access window: Aug 2023 to Sep 2026", src: ["nst", "esp"] },
  { value: "0", label: "Singapore Airlines systems breached. The weak point was the vendor.", src: ["star"] },
  { value: "8", label: "airlines confirmed hit by the same Amadeus incident (Qantas still checking)", src: ["techradar", "record"] }
];

// Timeline. "pos" is used for the long-range bar; "cluster" marks the Oct/Nov disclosure burst.
const TIMELINE = [
  {
    date: "10 Aug 2023",
    iso: "2023-08-10",
    title: "Earliest known unauthorised access",
    body: "Japan Airlines gives 10 August 2023 as the start of the access window. Cathay Pacific and Malaysia Airlines both say August 2023.",
    tag: "confirmed",
    src: ["esp", "nst"]
  },
  {
    date: "Aug 2023 to Sep 2026",
    iso: "2025-02-15",
    title: "Over three years of undetected access",
    body: "Booking-display data is reachable through the vulnerability for the whole window. Nothing public says whether the access was continuous or happened in bursts.",
    tag: "confirmed",
    src: ["nst", "esp"],
    span: true
  },
  {
    date: "23 Sep 2026",
    iso: "2026-09-23",
    title: "Last known unauthorised access",
    body: "Japan Airlines puts the end of the window at 23 September 2026.",
    tag: "confirmed",
    src: ["esp"]
  },
  {
    date: "20 Oct 2026",
    iso: "2026-10-20",
    title: "Amadeus notifies Korean Air and Asiana",
    body: "The first airlines on record to be told by Amadeus.",
    tag: "confirmed",
    src: ["nst"],
    cluster: true
  },
  {
    date: "23 Oct 2026",
    iso: "2026-10-23",
    title: "Japan Airlines and Japan Transocean Air notified",
    body: "JAL later reports about 92,000 affected customers, around 2,000 of them with passport numbers exposed.",
    tag: "confirmed",
    src: ["nst", "techradar"],
    cluster: true
  },
  {
    date: "28 Oct 2026",
    iso: "2026-10-28",
    title: "Cathay Pacific notified",
    body: "Cathay receives further details the next day, confirming the access used login credentials assigned to a system account.",
    tag: "confirmed",
    src: ["nst", "esp"],
    cluster: true
  },
  {
    date: "30 to 31 Oct 2026",
    iso: "2026-10-30",
    title: "Cathay and Malaysia Airlines go public",
    body: "Cathay reports about 53,000 bookings. Malaysia Airlines says its own IT systems were not compromised.",
    tag: "confirmed",
    src: ["nst"],
    cluster: true
  },
  {
    date: "2 Nov 2026",
    iso: "2026-11-02",
    title: "Amadeus says the vulnerability is fixed",
    body: "Amadeus says it fixed the flaw in the travel booking display environment, enhanced monitoring and detection, and found no sign of ransomware or of payment data being accessed.",
    tag: "confirmed",
    src: ["nst", "record"],
    cluster: true
  },
  {
    date: "4 Nov 2026",
    iso: "2026-11-04",
    title: "Singapore Airlines discloses 46,000 records",
    body: "SIA confirms its own IT systems were not breached and starts contacting affected customers with upcoming travel to change their booking reference numbers. The Straits Times reports that the PDPC is investigating.",
    tag: "confirmed",
    src: ["star", "bloomberg", "recordowl"],
    cluster: true
  }
];

// Attack lifecycle. Each stage maps to a MITRE ATT&CK tactic.
const STAGES = [
  {
    id: "creds",
    n: 1,
    name: "Obtain credentials",
    tactic: "Credential Access (TA0006)",
    tag: "inferred",
    what: "The attacker got hold of the login credentials for an Amadeus system account: a non-human account used by software rather than a person.",
    confirmed: "Cathay Pacific says the unauthorised access used login credentials assigned to a system account.",
    unknown: "How the credentials were obtained has not been disclosed.",
    likely: "Common routes for system-account credentials are secrets hard-coded in code or config files (T1552 Unsecured Credentials), infostealer malware on an admin or developer machine, or a password reused from an earlier leak. Service accounts often have long-lived passwords and no MFA, which makes them attractive.",
    control: "Store secrets in a vault, rotate them automatically, and scan code repositories for leaked keys.",
    src: ["esp", "record"]
  },
  {
    id: "access",
    n: 2,
    name: "Log in as a legitimate account",
    tactic: "Initial Access / Defense Evasion: Valid Accounts (T1078)",
    tag: "confirmed",
    what: "Using a real account means every request looks like normal traffic. No malware, no exploit alerts, no failed logins.",
    confirmed: "The access was made with valid system-account credentials.",
    unknown: "Which systems or networks the login came from.",
    likely: "Logging in with valid credentials is a major reason an intrusion can stay hidden for years. Tools that hunt for 'bad' activity have nothing to flag.",
    control: "Allow system accounts to connect only from known servers (IP allow-listing or mutual TLS) and baseline their behaviour.",
    src: ["esp", "attack"]
  },
  {
    id: "vuln",
    n: 3,
    name: "Exploit the booking display vulnerability",
    tactic: "Exploit Public-Facing Application (T1190), mapping inferred",
    tag: "confirmed",
    what: "Amadeus says a vulnerability in a 'travel booking display environment' made booking-display data accessible.",
    confirmed: "\"Certain booking-display data was accessible through the vulnerability.\" Amadeus has since fixed it.",
    unknown: "The type of flaw. It could be a broken access check, an over-permissive API, or something else.",
    likely: "Because the same environment served many airlines, the flaw probably let one account see bookings it should never have seen, across several airlines (an authorisation flaw). That would explain why 8 carriers were hit at once.",
    control: "Enforce per-tenant authorisation on every request and test for broken object-level authorisation (OWASP API Top 10, API1).",
    src: ["record", "nst"]
  },
  {
    id: "collect",
    n: 4,
    name: "Collect booking records",
    tactic: "Collection: Data from Information Repositories (T1213)",
    tag: "confirmed",
    what: "Names, booking reference numbers (PNRs), itineraries and booking classes were taken. For about 620 SIA records this also included email addresses, phone numbers, travel document details and KrisFlyer numbers.",
    confirmed: "SIA: 46,000 records. Cathay: about 53,000. JAL: about 92,000. ANA: 37,800. No payment data, and no bookings modified.",
    unknown: "Whether the attacker targeted specific passengers or pulled everything in bulk.",
    likely: "The volume across airlines suggests automated, bulk queries over a long period rather than targeted lookups.",
    control: "Rate-limit and cap how many records a single account can read per hour, and alert on unusual volumes.",
    src: ["techradar", "star", "nst"]
  },
  {
    id: "dwell",
    n: 5,
    name: "Stay undetected for 3+ years",
    tactic: "Defense Evasion / Persistence",
    tag: "confirmed",
    what: "Access ran from August 2023 to September 2026 before anyone noticed.",
    confirmed: "The access window has been confirmed by JAL, Cathay and Malaysia Airlines.",
    unknown: "What finally triggered detection.",
    likely: "A system account behaving 'normally' does not trip signature-based tools. Only behaviour analytics (UEBA) would notice it reading other airlines' data, or reading far more than its job needs.",
    control: "UEBA on service accounts, plus regular access reviews that ask: does this account still need this access?",
    src: ["nst", "esp"]
  },
  {
    id: "exfil",
    n: 6,
    name: "Take the data out",
    tactic: "Exfiltration (TA0010)",
    tag: "inferred",
    what: "JAL and Cathay describe the records as stolen. SIA uses the word accessed.",
    confirmed: "Records were accessed. Several airlines say data was stolen.",
    unknown: "The exfiltration method, the destination, and whether any data has been sold or leaked. No group has claimed it.",
    likely: "Data read through a legitimate display interface can be saved straight from the responses, so there may have been no separate exfiltration step to catch.",
    control: "Data loss prevention (DLP) and egress monitoring on the vendor side. Data minimisation on the airline side: what is not stored cannot be stolen.",
    src: ["record", "techradar"]
  },
  {
    id: "respond",
    n: 7,
    name: "Detect, contain, notify",
    tactic: "Incident response: containment to recovery",
    tag: "confirmed",
    what: "Amadeus fixed the vulnerability, reset the password and added monitoring. Airlines notified customers and regulators.",
    confirmed: "Password reset and enhanced detection (Amadeus). SIA is changing booking references for customers with upcoming travel. The PDPC is investigating (The Straits Times, via RecordOwl).",
    unknown: "Whether all affected passengers will be notified directly. Reports disagree.",
    likely: "Changing booking references is the right move. On most airline sites a booking reference plus surname is enough to open 'Manage Booking', so a leaked reference works almost like a password.",
    control: "Treat the booking reference as a credential: rotate it after a leak and add a second factor for changes to a booking.",
    src: ["esp", "star", "recordowl"]
  },
  {
    id: "impact",
    n: 8,
    name: "Downstream risk to passengers",
    tactic: "Impact: phishing and fraud",
    tag: "inferred",
    what: "Accurate names, flights and booking references make very convincing phishing: 'Your flight SQ xxx needs re-confirmation, click here.'",
    confirmed: "Several airlines warn customers about suspicious emails, calls and messages asking for personal or financial information.",
    unknown: "Whether any phishing campaigns have used this data yet.",
    likely: "Expect fake 'booking reference change' messages copying SIA's own precautionary outreach.",
    control: "Customers should check bookings only through the official app or site, never through links in messages.",
    src: ["nst", "record"]
  }
];

// Network diagram (vertical layout). x/y are centres in the SVG viewBox (0 0 440 640).
const NODES = [
  { id: "attacker", label: "Attacker", sub: "unidentified", x: 220, y: 50, w: 180, kind: "threat" },
  { id: "account", label: "System account", sub: "valid credentials", x: 220, y: 160, w: 180, kind: "pivot" },
  { id: "display", label: "Booking display", sub: "contains the flaw", x: 220, y: 260, w: 180, kind: "vendor" },
  { id: "pnr", label: "Booking records", sub: "shared by airlines", x: 220, y: 360, w: 180, kind: "vendor" },
  { id: "sia", label: "SIA", sub: "46,000", x: 62, y: 480, w: 96, kind: "victim" },
  { id: "cx", label: "Cathay", sub: "~53,000", x: 168, y: 480, w: 96, kind: "victim" },
  { id: "jal", label: "JAL", sub: "~92,000", x: 274, y: 480, w: 96, kind: "victim" },
  { id: "more", label: "+5 more", sub: "airlines", x: 380, y: 480, w: 96, kind: "victim" },
  { id: "siait", label: "SIA's own IT", sub: "not breached", x: 110, y: 590, w: 180, kind: "safe" }
];

const EDGES = [
  ["attacker", "account"],
  ["account", "display"],
  ["display", "pnr"],
  ["pnr", "sia"],
  ["pnr", "cx"],
  ["pnr", "jal"],
  ["pnr", "more"]
];

// Which parts of the diagram light up for each lifecycle stage.
const FOCUS = {
  creds: ["attacker"],
  access: ["attacker", "account"],
  vuln: ["account", "display"],
  collect: ["display", "pnr"],
  dwell: ["account", "display", "pnr", "zone"],
  exfil: ["pnr", "attacker", "exfil"],
  respond: ["display", "account", "siait", "sia"],
  impact: ["pnr", "sia", "cx", "jal", "more"]
};

// What could have been done differently, split by who owns the control.
// Mapped to CompTIA Security+ SY0-701 domains.
const CONTROLS = [
  {
    owner: "Amadeus (the vendor)",
    items: [
      {
        title: "Manage non-human identities properly",
        body: "Keep system-account secrets in a vault, rotate them automatically, and replace static passwords with short-lived tokens or certificates. A credential that changes every hour cannot be quietly reused for three years.",
        domain: "SY0-701 Domain 4: Security Operations (identity and access management)"
      },
      {
        title: "Least privilege and tenant isolation",
        body: "A single system account should only ever see the bookings it needs. Strict per-airline (per-tenant) authorisation would have turned an eight-airline breach into, at worst, a one-airline breach.",
        domain: "SY0-701 Domain 1: General Security Concepts (Zero Trust) and Domain 3: Security Architecture"
      },
      {
        title: "Behaviour monitoring on service accounts",
        body: "Baseline what each system account normally does (volume, time of day, source IP, which airlines' data) and alert on change. This is how a 'normal-looking' login gets caught within weeks, not years.",
        domain: "SY0-701 Domain 4: Security Operations (monitoring, UEBA, SIEM)"
      },
      {
        title: "Rate limits and query caps",
        body: "Cap how many booking records one account can read per hour. Bulk harvesting then becomes slow and noisy.",
        domain: "SY0-701 Domain 2: Threats, Vulnerabilities and Mitigations"
      },
      {
        title: "Test the display layer like an attacker",
        body: "Regular penetration tests and code reviews focused on authorisation (OWASP API Top 10: broken object-level authorisation) on every customer-facing and partner-facing interface.",
        domain: "SY0-701 Domain 4: Security Operations (vulnerability management)"
      }
    ]
  },
  {
    owner: "Singapore Airlines (the customer)",
    items: [
      {
        title: "Third-party risk management with teeth",
        body: "Contracts should include security requirements, a right to audit, and a short, fixed deadline for breach notification. SIA's own systems were clean, but its customers' data still leaked. Outsourcing the system does not outsource the accountability.",
        domain: "SY0-701 Domain 5: Security Program Management and Oversight (vendor assessment, SLAs, MOU/MSA)"
      },
      {
        title: "Data minimisation and retention",
        body: "Bookings dating back to 2023 were exposed. Only share the data a vendor needs, and agree to purge completed trips after a set period. Fewer records stored means fewer records lost.",
        domain: "SY0-701 Domain 5: data governance and retention"
      },
      {
        title: "Treat the booking reference as a credential",
        body: "A booking reference plus surname often unlocks 'Manage Booking'. Requiring a one-time code by email or SMS for changes would make leaked references much less useful. SIA's move to change references is the right short-term fix.",
        domain: "SY0-701 Domain 4: authentication (MFA)"
      },
      {
        title: "Prepare customers for the phishing wave",
        body: "Tell customers clearly how SIA will and will not contact them, before the fake messages arrive.",
        domain: "SY0-701 Domain 5: security awareness"
      }
    ]
  }
];

const TAKEAWAYS = [
  "Your security is only as strong as your weakest vendor. SIA was never breached, yet 46,000 of its customers' bookings were.",
  "Valid accounts are the quietest way in. Without malware or exploit alerts, three years passed before anyone noticed.",
  "Service accounts are identities too. They need rotation, least privilege and monitoring just like human users.",
  "Shared platforms concentrate risk. One flaw in a multi-airline system became eight separate breach announcements.",
  "Public facts this early are thin. Separating confirmed from inferred is part of doing an honest analysis."
];
