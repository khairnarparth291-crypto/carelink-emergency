# CareLink Emergency — Part 1 (Patient/Family Portal MVP)

> **Find the Right Emergency Care, Faster.**
> Check hospital-reported facilities, bed availability, specialists, estimated cost and travel time in one place.

---

## ⚠️ Important Medical Disclaimer & Demo Data Notice

* **Prototype Demonstration Data:** All hospital names, bed counts, specialist rosters, availability statuses, and costs in this MVP are **DEMO DATA** located in `src/data/hospitals.js`.
* **Medical Disclaimer:** This platform is intended to help users find and compare hospital-reported information. It does not provide medical diagnosis or medical advice. Hospital availability can change rapidly. Always confirm availability and emergency acceptance directly with the hospital. In a life-threatening emergency, contact local emergency services (**112** / **108** in India).

---

## 1. How to Install

Ensure you have **Node.js** (v18+ or v20+) installed on your machine.

Clone or navigate to the project directory:

```bash
cd hospital
```

Install the dependencies:

```bash
npm install
```

Installed packages include:
* `react` & `react-dom` (React 19)
* `react-router-dom` (v7 for multi-page routing)
* `lucide-react` (Lightweight icon library)
* `vite` (Next-generation frontend tooling)

---

## 2. How to Run

### Development Server

Start the local development server:

```bash
npm run dev
```

Open your browser at:
`http://localhost:5173/`

### Production Build

To test and compile the production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 3. Project Structure

```text
hospital/
├── index.html                     # HTML entry point with fonts and metadata
├── package.json                   # Project scripts and dependencies
├── vite.config.js                 # Vite configuration
├── src/
│   ├── main.jsx                   # React root entry
│   ├── App.jsx                    # Routing, layout, context & modals
│   ├── index.css                  # Modern healthcare design system & tokens
│   │
│   ├── context/
│   │   └── EmergencyContext.jsx   # Shared state for requirements & modals
│   │
│   ├── data/
│   │   └── hospitals.js           # 8+ realistic Pune DEMO hospitals dataset
│   │
│   ├── utils/
│   │   └── matching.js            # Objective requirement matching & sorting engine
│   │
│   ├── components/
│   │   ├── Navbar.jsx             # Responsive navigation with emergency CTA & mobile menu
│   │   ├── Footer.jsx             # Footnotes, emergency numbers & safety disclaimer
│   │   ├── DemoNoticeBanner.jsx   # Prominent prototype banner
│   │   ├── EmergencyButton.jsx    # Floating 🚨 Emergency button (hidden on /emergency)
│   │   ├── HospitalCard.jsx       # Card with beds, freshness, match breakdown & actions
│   │   ├── AvailabilityBadge.jsx  # 🟢 Available, 🟡 Limited, 🔴 Unavailable
│   │   ├── SpecialistCard.jsx     # Doctor status, on-call indicator, qualifications
│   │   ├── FacilityGrid.jsx       # Interactive grid of hospital facilities & diagnostics
│   │   ├── FilterPanel.jsx        # Search bar, sort dropdown & capability filter chips
│   │   ├── RequirementSummary.jsx # Top patient requirements pill summary
│   │   ├── CallModal.jsx          # Casualty desk contact dialog
│   │   └── DirectionsModal.jsx    # Emergency transit simulator & Maps link
│   │
│   └── pages/
│       ├── Home.jsx               # Hero, emergency callout, 4-step How It Works, preview
│       ├── Emergency.jsx          # Multi-section patient emergency request form
│       ├── FindHospital.jsx       # Non-emergency elective search interface
│       ├── Hospitals.jsx          # Search results with exact matches & alternatives
│       └── HospitalDetails.jsx    # In-depth hospital profile with live beds & costs
└── README.md
```

---

## 4. What is Implemented in Part 1

### Pages & Routes
1. **Home (`/`)**:
   * Hero with headline: *"Find the Right Emergency Care, Faster."*
   * Primary CTA *"Find Emergency Care"* & Secondary CTA *"Find a Hospital"*.
   * High-urgency emergency triage callout banner.
   * 4 Feature cards: Live Bed Visibility, On-Duty Specialists, Verified Freshness Timestamps, Cost & Scheme Transparency.
   * Visual 4-Step **How It Works** section:
     1. Tell us the requirement
     2. We match hospitals
     3. Check current status
     4. Contact and navigate
   * Recent live network hospital preview.
   * Safety disclaimer.

2. **Emergency Care Request Form (`/emergency`)**:
   * Fast-track triage presets (Cardiac, Trauma, Stroke, Breathing).
   * **Patient Information:** Patient age, gender, emergency type dropdown.
   * **Required Facilities:** Interactive checkboxes (General Bed, ICU, Ventilator, Emergency/Trauma Care, Operation Theatre, Blood Bank).
   * **Specialist Required:** Dropdown with medical specialties.
   * **Budget & Insurance:** Daily cost tiers and insurance schemes (Ayushman Bharat, Private, Government).
   * **Patient Location:** Input with *"Use My Location"* button and default fallback to Pune, Maharashtra.
   * Complete client-side validation with error messages.

3. **Hospital Search Results (`/hospitals`)**:
   * Dynamic loading transition: *"Finding hospitals that match your requirements..."*.
   * Summary of active patient requirements at top with quick modification link.
   * Real-time search bar (by hospital name or area e.g. Baner, Sassoon Rd).
   * Sort dropdown:
     * Best Match
     * Nearest First
     * Fastest ETA
     * Lowest Estimated Cost
     * Recently Verified
   * Capability filter chips: ICU available, Ventilator available, Emergency care active, Blood bank in-house, Specialist available, Insurance accepted.
   * **Exact Matches:** Hospitals reporting 100% of user criteria.
   * **Alternative Hospitals:** When criteria are not fully met, alternative hospitals are listed showing matched criteria (`✓`) and missing criteria (`✕`) (e.g. `Ventilator ✕`). Hospitals are never hidden arbitrarily.

4. **Hospital Cards (`HospitalCard.jsx`)**:
   * Hospital Name & address.
   * Emergency status badge (🟢 Available / 🟡 Limited / 🔴 Not currently available).
   * Prominent **Data Freshness** pill (e.g., `Verified 4 min ago`).
   * Distance and estimated travel ETA.
   * Live Bed counts: General Beds, ICU Beds, Ventilators.
   * Specialist on-duty status.
   * Estimated daily cost and insurance schemes accepted.
   * Match breakdown (`5/5 requirements matched`).
   * 3 Action buttons: **View Hospital**, **Get Directions**, **Call Hospital**.

5. **Hospital Details Page (`/hospital/:id`)**:
   * Complete hospital profile with header and transit metrics.
   * Real-time bed availability cards with timestamped verification.
   * Specialist roster cards with duty and on-call status.
   * Comprehensive facility grid with icons (ICU, Ventilator, Emergency, OT, Blood Bank, CT Scan, MRI, Pharmacy, Ambulance).
   * Cost breakdown (General Bed, ICU Bed, OPD Consultation, Emergency Consultation) with hospital estimate disclaimer.
   * Supported insurance and cashless TPA schemes.
   * Emergency contact action bar with direct casualty triage calling.

6. **Find Hospital Page (`/find-hospital`)**:
   * Simplified interface for non-emergency or planned admissions.

7. **Floating Emergency Button**:
   * Fixed bottom-right 🚨 Emergency button with pulsating glow on all pages except `/emergency`.

8. **Interactive Modals**:
   * **Call Hospital Modal:** Displays casualty triage phone, ambulance dispatch number, and admission verification reminder.
   * **Directions Modal:** Displays distance, ETA in traffic, simulated route instructions, and link to external Google Maps navigation.

---

## 5. Which Data is Demo Data

All data in `src/data/hospitals.js` (Part 1) and `src/data/hospitalPortalData.js` (Part 2) is simulated demonstration data representing hospitals in the Pune Metropolitan Region.

The data includes varying ICU beds, ventilator availability, specialist rosters, pricing tiers, and verification timestamps to demonstrate the matching, filtering, and hospital-side administrative workflow.

---

## 6. Part 2 — Hospital Portal (Completed)

Part 2 introduces a dedicated, operational **Hospital Operations Portal** for hospitals to view incoming emergency cases, manage live bed availability, manage doctors/specialists, update facilities, adjust tariffs, and review accepted insurance schemes.

### What Was Added

1. **Hospital Dashboard (`/hospital-portal`):**
   * Overview of Hospital Status (`ACTIVE`), Emergency Readiness score, last updated timestamp (`Just now`), and profile completion percentage.
   * Large availability cards for **General Beds**, **ICU**, **Ventilators**, and **Emergency Beds** showing Total, Occupied, and dynamically calculated Available capacity with visual occupancy bars.
   * Dynamic Availability Status badges: 🟢 Available (>30%), 🟡 Limited (<=30%), 🔴 Full / Unavailable (0).
   * Emergency Readiness Panel displaying operational readiness across ICU, Ventilator, On-Call Cardiologist, Emergency Beds, OT, and Blood Bank.
   * Recent incoming emergency requests feed with status previews.

2. **Demo Hospital Login (`/hospital-portal/login`):**
   * Demo authentication page with simulated login credentials box.
   * Clear **Demo Hospital Account** labeling.
   * One-click auto-fill for testing.
   * Demo Credentials:
     * **Hospital ID / Email:** `demo@carehospital.com` (Local-development demo account)
     * Demo credentials must be explicitly configured locally and must never be used in production.

3. **Bed & Resource Availability Management (`/hospital-portal/availability`):**
   * Full input form for General Beds, ICU, Ventilators, and Emergency Beds (Total & Occupied).
   * **Automatic calculation of Available beds** (`Total - Occupied`).
   * Operation Theatre status (Available: Yes/No, Number of active suites).
   * Blood Bank status and unit counters for all 8 blood groups (A+, A-, B+, B-, O+, O-, AB+, AB-).
   * "Update Availability" button with confirmation alert and dynamic "Last verified: Just now" update.

4. **Doctor & Specialist Management (`/hospital-portal/doctors`):**
   * Specialist catalog supporting Cardiologist, Neurologist, Neurosurgeon, Pulmonologist, Orthopedic, General Surgeon, Pediatrician, Gynecologist, Nephrologist, Oncologist, Gastroenterologist, and Other.
   * Doctor cards with qualification, experience, working hours, and emergency on-call status.
   * One-click **Toggle Availability** button (cycles between 🟢 On Duty, 🟡 On Call, and 🔴 Unavailable).
   * Add Specialist modal dialog to register new doctors onto the live roster.

5. **Facility & Unit Management (`/hospital-portal/facilities`):**
   * Operational readiness cards for 12 facilities: Emergency / Trauma Care, ICU, Ventilator, Operation Theatre, Blood Bank, CT Scan, MRI, Pharmacy, Ambulance, Dialysis, NICU, PICU.
   * Quick status toggles (Available / Limited / Unavailable) and equipment capability notes.

6. **Costs & Insurance Management (`/hospital-portal/costs`):**
   * Daily charges for General Bed, ICU, Ventilator, Emergency Consultation, Specialist Consultation, and Operation Theatre.
   * Minimum and maximum estimated daily emergency cost range.
   * Official mandatory tariff disclaimer notice.
   * Checkbox manager for accepted insurance policies (Private Insurance, Cashless Insurance, Ayushman Bharat, Government Schemes, Corporate Insurance, Other).

7. **Emergency Requests Management (`/hospital-portal/emergency-requests`):**
   * Live feed of incoming emergency cases (such as `#ER-1024` Cardiac Emergency, `#ER-1025` Trauma).
   * Case details including patient age, symptoms, required facilities, origin location, travel ETA, and insurance type.
   * **Accept Case Modal:** Prompts hospital verification before marking status as 🟢 **Hospital Confirmed** (`Confirmed just now`).
   * **Cannot Accept Modal:** Allows selecting operational reasons (ICU unavailable, Specialist unavailable, Ventilator unavailable, Emergency capacity full, Other) before marking status as 🔴 **Cannot Accept**.
   * Filters (All, New, Accepted, Cannot Accept, Pending) and multi-attribute sorting (Newest, Arrival Time, Requires ICU, Requires Specialist).

8. **Hospital Profile (`/hospital-portal/profile`):**
   * Management of hospital name, facility type, full address, direct casualty helpline, total beds, and institutional description.

9. **Navigation & Operational UI:**
   * Persistent desktop sidebar with badge counter for new/pending emergency requests.
   * Responsive mobile drawer navigation.
   * Header with live hospital status, profile link, and demo alerts dropdown.
   * Cross-portal navigation linking Patient Portal and Hospital Portal.

### Hospital Portal Routes

| Route | Description |
|---|---|
| `/hospital-portal` | Main Hospital Operations Dashboard |
| `/hospital-portal/login` | Demo Hospital Login |
| `/hospital-portal/availability` | Bed, Ventilator, OT & Blood Bank Availability Management |
| `/hospital-portal/doctors` | Doctor & Specialist Roster Management |
| `/hospital-portal/facilities` | Diagnostic, Imaging & Critical Care Unit Management |
| `/hospital-portal/costs` | Estimated Tariffs & Accepted Insurance Schemes |
| `/hospital-portal/emergency-requests` | Incoming Emergency Requests (Accept/Reject workflows) |
| `/hospital-portal/profile` | Hospital Administrative Profile & Helplines |

### LocalStorage Usage & Persistence

All changes made in the Hospital Portal—including bed count updates, new specialists added, status toggles, facility updates, tariff adjustments, and emergency request acceptances/rejections—are stored locally in the browser's `localStorage` (`carelink_hospital_data_v2`).

* Refreshing the browser preserves your operational updates.
* A "Reset Demo Data" button is available in the sidebar to restore default initial simulation data at any time.

---

## 7. Part 3 — Backend, Database & REST API (Completed)

Part 3 adds the complete backend server architecture, MongoDB Mongoose data models, JWT authentication, and REST API services for both the Patient Portal and Hospital Portal.

### Technology Stack
* **Runtime:** Node.js (v18+)
* **Server Framework:** Express.js
* **Database & ODM:** MongoDB & Mongoose
* **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing
* **Configuration & Security:** `dotenv`, `cors`

### Directory Structure

```text
server/
  config/
    db.js                 # MongoDB connection & connection status detection
    mockStore.js          # In-memory store fallback for instant offline testing
  controllers/
    authController.js     # Hospital login (JWT), getMe & health check
    hospitalController.js # Hospital CRUD & joined clinical data views
    availabilityController.js # Bed, ICU, Ventilator calculation & update
    doctorController.js   # Specialist roster CRUD
    facilityController.js # Diagnostic & critical care unit readiness
    costController.js     # Tariffs and accepted insurance schemes
    emergencyController.js# Emergency request triage creation & accept/reject
  middleware/
    authMiddleware.js     # Bearer JWT verification & role authorization
    errorMiddleware.js    # 404 handler and central JSON error formatting
  models/
    User.js               # Hospital user model with bcrypt hashing
    Hospital.js           # Hospital identity, address, readiness status
    Availability.js       # Auto-calculated bed capacities (available = total - occupied)
    Doctor.js             # Specialist catalog & on-call status
    Facility.js           # 12 critical hospital facilities
    Cost.js               # Tariffs, insurance policies & government schemes
    EmergencyRequest.js   # Incoming emergency cases & acceptance states
  routes/
    authRoutes.js         # /api/auth
    hospitalRoutes.js     # /api/hospitals
    doctorRoutes.js       # /api/doctors
    availabilityRoutes.js # /api/availability
    facilityRoutes.js     # /api/facilities
    costRoutes.js         # /api/costs
    emergencyRoutes.js    # /api/emergency-requests
  seed/
    seedData.js           # Demo dataset seed script
  test-api.js             # Automated API test suite
  .env                    # Environment variables
  .env.example            # Example configuration
  package.json            # Server dependencies and scripts
  server.js               # Express application entry point
```

### Complete API Endpoints Reference

#### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/auth/health` | Public | Server and MongoDB connection health check |
| `POST` | `/api/auth/login` | Public | Hospital authentication returning JWT token |
| `GET` | `/api/auth/me` | Protected | Authenticated user profile & linked hospital |

#### Hospitals (`/api/hospitals`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/hospitals` | Public | List all hospitals (with query filters) |
| `GET` | `/api/hospitals/:id` | Public | Single hospital details with beds, specialists, facilities & costs |
| `POST` | `/api/hospitals` | Protected | Register new hospital |
| `PUT` | `/api/hospitals/:id` | Protected | Update hospital information |
| `DELETE` | `/api/hospitals/:id` | Protected | Remove hospital & associated records |

#### Availability (`/api/hospitals/:hospitalId/availability`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/hospitals/:hospitalId/availability` | Public | Retrieve bed counts & capacity |
| `PUT` | `/api/hospitals/:hospitalId/availability` | Protected | Update bed counts with auto-calculation (`available = total - occupied`) |

#### Doctors & Specialists (`/api/hospitals/:hospitalId/doctors` & `/api/doctors/:id`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/hospitals/:hospitalId/doctors` | Public | List doctors on duty/on-call |
| `POST` | `/api/hospitals/:hospitalId/doctors` | Protected | Add doctor to hospital roster |
| `PUT` | `/api/doctors/:id` | Protected | Update doctor information or status |
| `DELETE` | `/api/doctors/:id` | Protected | Remove doctor from roster |

#### Facilities (`/api/hospitals/:hospitalId/facilities`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/hospitals/:hospitalId/facilities` | Public | Retrieve 12 facility readiness states |
| `PUT` | `/api/hospitals/:hospitalId/facilities` | Protected | Update facility status & notes |

#### Costs & Insurance (`/api/hospitals/:hospitalId/costs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/hospitals/:hospitalId/costs` | Public | Retrieve tariffs & insurance schemes |
| `PUT` | `/api/hospitals/:hospitalId/costs` | Protected | Update charges & insurance policies |

#### Emergency Requests (`/api/emergency-requests`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/emergency-requests` | Public | Patient/family submits urgent emergency request |
| `GET` | `/api/hospitals/:hospitalId/emergency-requests` | Protected | Hospital views incoming triage cases |
| `PUT` | `/api/emergency-requests/:id/accept` | Protected | Hospital accepts case (Status -> `ACCEPTED`) |
| `PUT` | `/api/emergency-requests/:id/reject` | Protected | Hospital marks Cannot Accept with reason |

---

### How to Run Backend & Frontend

#### Windows PowerShell Note
On Windows systems where PowerShell execution policy blocks `.ps1` scripts, use `cmd /c npm ...` or `npm.cmd`.

#### 1. Setup Backend
```bash
# Navigate to backend directory
cd server

# Install dependencies (use npm.cmd if powershell blocks npm.ps1)
npm.cmd install

# (Optional) Seed MongoDB database with demo Pune hospitals
npm.cmd run seed

# Run automated backend test suite
npm.cmd test

# Start backend server (runs on port 5000)
npm.cmd start
```

#### 2. Setup Frontend
```bash
# In the root project directory
cd ..

# Install frontend dependencies
npm.cmd install

# Start Vite dev server (runs on port 5173)
npm.cmd run dev
```

#### 3. MongoDB Configuration
* **Local MongoDB:** Ensure MongoDB Community Server service is running locally at `mongodb://127.0.0.1:27017/carelink_emergency`.
* **MongoDB Atlas (Cloud):** Set your Atlas connection string in `server/.env`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/carelink_emergency
  ```
* **Offline / Standby Mode:** If MongoDB is not running locally, the server operates in **Resilient Mode** using the integrated mock store so development and testing never stall.

#### Demo Hospital Login Credentials
* **Email:** `demo@carehospital.com` (Local-development demo account)
* Demo credentials must be explicitly configured locally and must never be used in production.
