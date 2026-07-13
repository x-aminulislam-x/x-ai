# Xai – Intelligence Workspace (Experience Prototype)

A high-fidelity, interactive single-page product experience demonstrating how Xai transforms raw data into structured intelligence, actionable insights, and automated workflows. This prototype focuses on design-to-code execution, advanced motion, and strict engineering discipline.

Rather than a standard marketing landing page, this repository contains a product-quality interactive UI built with custom motion pipelines and deep 3D spatial interactions.

## 🚀 Live Project Links

- **Live Deployment:** [https://xai-intelligence-work-space.vercel.app/](https://xai-intelligence-work-space.vercel.app/)
- **Video Walkthrough (Design & Motion Decisions):** [Google Drive Video Link](https://drive.google.com/file/d/1-4U0ijNyP4rzalGSp9H9x8CclrlE5w9_/view?usp=sharing)

---

## 🛠️ Project Overview & Technical Approach

The core objective of this application is to walk a decision-maker through an abstract data transformation narrative (_Raw Data → Structured Intelligence → Actionable Insight_) using calm, technically confident visual cues.

### Engineering Approach

- **Direct WebGL Integration:** By leveraging vanilla **Three.js** instead of high-level React abstractions, the 3D scene lifecycle is controlled directly. This prevents unnecessary React re-renders and ensures optimal memory management when animating complex geometries.
- **Unified Animation Timeline:** Global scroll choreography and complex step-by-step state animations are unified using **GSAP** and **ScrollTrigger**. This guarantees perfectly deterministic, smooth rendering that scales natively with the browser's refresh rate.
- **Component Architecture:** Developed using **Next.js** for a clean, modular file structure. Global styles are driven entirely by a customized **Tailwind CSS** configuration to maintain a strict layout system, premium typography spacing, and a restrained color palette.
- **Data Visualization:** The mock product workspace features high-fidelity, interactive charts implemented via **Recharts**, presenting analytical insights without sacrificing layout performance.

---

## 🧰 Technology Stack

- **Core Framework:** Next.js
- **3D/Graphics:** Three.js (Vanilla WebGL Context)
- **Animation Engine:** GSAP (with ScrollTrigger)
- **Data Visualization:** Recharts
- **Iconography:** Lucide React
- **Styling:** Tailwind CSS

---

## 💻 Local Setup Instructions

Follow these instructions to clone, install, and run the project environment locally.

### Prerequisites

- Node.js (v18.x or higher recommended)
- npm or pnpm

### 1. Clone the Repository

```bash
git clone [https://github.com/x-aminulislam-x/Xai_Intelligence_Workspace.git](https://github.com/x-aminulislam-x/Xai_Intelligence_Workspace.git)
cd your-repo-name
```

### 2. Install Project Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Spin Up the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:3000 in your web browser to experience the interactive workspace.
