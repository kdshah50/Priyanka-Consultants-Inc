import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, CheckCircle, Phone, ArrowRight, Globe, 
  BrainCircuit, Workflow, Activity, Sparkles, Rocket,
  Box, Database, Layers, ChevronLeft, Clock, DollarSign, Gavel, Scale,
  Calendar, Video, Loader2, CreditCard
} from 'lucide-react';

const ENROLL_MAILTO = 'mailto:';

/** Default Stripe Payment Link (Dashboard → Payment links). Per-course override on each course: stripePaymentLink */
const defaultStripePaymentLink = () => (import.meta.env.VITE_STRIPE_PAYMENT_LINK || '').trim();

const buildStripePaymentUrl = (paymentLinkBase, email) => {
  try {
    const u = new URL(paymentLinkBase);
    if (email) u.searchParams.set('prefilled_email', email);
    return u.toString();
  } catch {
    return paymentLinkBase;
  }
};

const buildEnrollmentPlainText = (course, { name, email, phone, company }) =>
  [
    `Enrollment / payment intent — Priyanka Consultants Academy`,
    ``,
    `Course: ${course.name}`,
    `Course ID: ${course.id}`,
    `Listed price: ${course.price}`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    company ? `Company: ${company}` : null,
    ``,
    `Format: Live virtual (NJ cohort)`,
    `— Submitted from website registration form`,
  ]
    .filter(Boolean)
    .join('\n');

const buildEnrollmentMailto = (course, { name, email, phone, company }) => {
  const subject = encodeURIComponent(`Enrollment request: ${course.name}`);
  const body = encodeURIComponent(buildEnrollmentPlainText(course, { name, email, phone, company }));
  return `${ENROLL_MAILTO}?subject=${subject}&body=${body}`;
};

const App = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollFromListing, setEnrollFromListing] = useState(false);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  };

  const academyData = {
    "safe": [
      { 
        id: "leading-safe", 
        name: "Leading SAFe® 6.0", 
        detail: "Thriving in the Digital Age", 
        price: "$895", 
        duration: "2 Days", 
        audience: "Executives, Managers, Consultants, and Agile Change Agents.", 
        requirements: [
          "Thrive in the Digital Age with Business Agility",
          "Become a Lean-Agile Leader",
          "Establish Team and Technical Agility",
          "Build Solutions with Agile Product Delivery",
          "Explore Lean Portfolio Management",
          "Lead the SAFe® Transformation",
          "Exam: 45 Questions | 90 Mins | 80% Passing Score"
        ] 
      },
      { 
        id: "safe-po-pm", 
        name: "SAFe® PO/PM", 
        detail: "Delivering Value", 
        price: "$950", 
        duration: "2 Days", 
        audience: "Product Owners, Product Managers, Business Analysts, and Solution Managers.", 
        requirements: [
          "Articulate the Product Owner and Product Manager roles",
          "Connect SAFe® Lean-Agile principles to the PO/PM roles",
          "Decompose Epics into Features and Stories",
          "Manage Program and Team backlogs",
          "Collaborate with Agile teams to estimate work",
          "Execute Planning Intervals (PI) and deliver value",
          "Exam: 45 Questions | 90 Mins | 78% Passing Score"
        ] 
      },
      { 
        id: "safe-rte", 
        name: "SAFe® RTE", 
        detail: "Value Stream Execution", 
        price: "$2,195", 
        duration: "3 Days", 
        audience: "RTEs, STEs, Program Managers, and Agile Coaches.", 
        requirements: [
          "Facilitate PI Planning and execution",
          "Coach leaders and teams in Lean-Agile mindsets",
          "Optimize the flow of value through the ART",
          "Foster relentless improvement via Inspect & Adapt",
          "Apply Lean-Agile coaching for high performance",
          "Harness AI to accelerate ART problem-solving",
          "Exam: 60 Questions | 120 Mins | 75% Passing Score"
        ] 
      },
      { 
        id: "safe-lpm", 
        name: "SAFe® LPM", 
        detail: "Strategy to Execution", 
        price: "$1,350", 
        duration: "2 Days", 
        audience: "Portfolio Managers, PMO Personnel, and Business Owners.", 
        requirements: [
          "Connect the portfolio to enterprise strategy",
          "Implement Lean Budgeting and Guardrails",
          "Establish portfolio flow with the Portfolio Kanban",
          "Coordinate Value Streams for maximum benefit",
          "Measure Lean Portfolio performance",
          "Build a plan for LPM implementation",
          "Exam: 45 Questions | 90 Mins | 71% Passing Score"
        ] 
      },
      { 
        id: "safe-sm", 
        name: "SAFe® Scrum Master", 
        detail: "Lean-Agile Excellence", 
        price: "$850", 
        duration: "2 Days", 
        audience: "New or existing Scrum Masters and Team Leads.", 
        requirements: [
          "Facilitate Scrum events and Iteration execution",
          "Support PI Planning and alignment",
          "Coach teams to deliver business value",
          "Build high-performing, engaged teams",
          "Support DevOps implementation and flow",
          "Use AI to streamline retrospectives and refinement",
          "Exam: 45 Questions | 90 Mins | 73% Passing Score"
        ] 
      },
      { 
        id: "safe-devops", 
        name: "SAFe® DevOps", 
        detail: "Delivery Pipeline", 
        price: "$995", 
        duration: "2 Days", 
        audience: "Developers, Testers, Operations, and System Architects.", 
        requirements: [
          "Apply the CALMR approach to DevOps",
          "Understand Continuous Exploration and Integration",
          "Implement Continuous Deployment and Release on Demand",
          "Incorporate Continuous Testing and Security",
          "Map value streams to identify bottlenecks",
          "Build an actionable transformation plan",
          "Exam: 45 Questions | 90 Mins | 73% Passing Score"
        ] 
      }
    ],
    "ai": [
      { id: "gen-ai-rag", name: "Gen AI & RAG", detail: "Architecture", price: "$1,495", duration: "3 Days", audience: "Architects.", requirements: ["RAG Architecture", "Vector DB Performance", "Privacy Guardrails"] },
      { id: "prompt-eng", name: "Prompt Engineering", detail: "LLM Interfacing", price: "$795", duration: "1 Day", audience: "Business Leaders.", requirements: ["Zero/Few-shot Mastery", "Context Optimization", "Prompt Libraries"] },
      { id: "ai-agents", name: "AI Agents", detail: "Agentic Workflows", price: "$1,295", duration: "2 Days", audience: "AI Engineers.", requirements: ["Autonomous Chains", "Self-correcting logic", "Agent Monitoring"] },
      { id: "modern-eng", name: "Modern Engineering", detail: "TDD & BDD", price: "$1,150", duration: "2 Days", audience: "Developers.", requirements: ["TDD Cycles", "Cucumber/Gherkin", "CI/CD Automation"] }
    ],
    "cloud": [
      { id: "cloud-migration", name: "Cloud Migration", detail: "AWS/Azure/GCP", price: "$1,250", duration: "2 Days", audience: "IT Managers.", requirements: ["The 6 Rs of Migration", "Cloud Readiness", "Secure Data Transfer"] },
      { id: "finops", name: "FinOps", detail: "Cost Optimization", price: "$950", duration: "2 Days", audience: "Finance/Cloud Leads.", requirements: ["Cost Accountability", "Optimization Plans", "Real-time Dashboards"] },
      { id: "azure-devops", name: "Azure DevOps", detail: "Enterprise CI/CD", price: "$1,100", duration: "2 Days", audience: "DevOps Engineers.", requirements: ["Automated Pipelines", "Azure Artifacts", "Bicep/Terraform"] }
    ],
    "mastery": [
      { id: "agile-scrum", name: "Agile Foundations", detail: "Scrum & Kanban", price: "$750", duration: "2 Days", audience: "New Teams.", requirements: ["Roles & Artifacts", "WIP Limits", "Team Dynamics"] },
      { id: "jira-align", name: "Jira & Jira Align", detail: "Enterprise Visibility", price: "$1,300", duration: "2 Days", audience: "Program Managers.", requirements: ["Cross-team Tracking", "Portfolio Visibility", "Executive Reporting"] }
    ]
  };

  const CoursePage = ({ course, onBack, scrollToEnroll }) => {
    const enrollRef = useRef(null);
    const [enroll, setEnroll] = useState({ name: '', email: '', phone: '', company: '' });
    const [payRedirecting, setPayRedirecting] = useState(false);
    const [enrollNotice, setEnrollNotice] = useState(null);

    useEffect(() => {
      if (scrollToEnroll && enrollRef.current) {
        enrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, [scrollToEnroll, course?.id]);

    const stripeUrlForCourse = (course.stripePaymentLink || defaultStripePaymentLink() || '').trim();

    const submitEnroll = async (e) => {
      e.preventDefault();
      setEnrollNotice(null);

      if (stripeUrlForCourse) {
        setPayRedirecting(true);
        try {
          sessionStorage.setItem(
            'pci_enroll_pending',
            JSON.stringify({
              courseId: course.id,
              courseName: course.name,
              price: course.price,
              name: enroll.name,
              email: enroll.email,
              phone: enroll.phone,
              company: enroll.company || '',
              at: Date.now(),
            })
          );
        } catch {
          /* ignore quota / private mode */
        }
        window.location.assign(buildStripePaymentUrl(stripeUrlForCourse, enroll.email));
        return;
      }

      const summary = buildEnrollmentPlainText(course, enroll);
      let copied = false;
      try {
        await navigator.clipboard.writeText(summary);
        copied = true;
      } catch {
        copied = false;
      }
      const mailto = buildEnrollmentMailto(course, enroll);
      window.open(mailto, '_blank', 'noopener,noreferrer');
      setEnrollNotice(copied ? 'no-stripe-copied' : 'no-stripe');
    };

    return (
      <motion.div {...fadeIn} className="min-h-screen bg-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-[10px] tracking-widest mb-12 hover:gap-4 transition-all">
            <ChevronLeft size={16} /> Back to Academy
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-emerald-200">
              <Video size={12} className="shrink-0" /> Live virtual
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
              <Calendar size={12} /> Request upcoming dates
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4 italic leading-none">{course.name}</h1>
          <div className="flex flex-wrap items-center gap-6 mb-12 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xl"><DollarSign size={20}/> {course.price}</div>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"><Clock size={16}/> {course.duration} Session</div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase italic border-b-2 border-indigo-600 inline-block mb-6">Target Audience</h2>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{course.audience}</p>
            </section>
            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase italic border-b-2 border-indigo-600 inline-block mb-6">Learning Objectives</h2>
              <ul className="space-y-3">
                {course.requirements.map((r, i) => (
                  <li key={`req-${i}`} className="flex gap-3 text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <CheckCircle className="text-indigo-600 shrink-0" size={14}/> {r}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section id="enroll" ref={enrollRef} className="rounded-[2rem] border-2 border-indigo-100 bg-gradient-to-b from-white to-slate-50 p-8 md:p-10 shadow-lg mb-12">
            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">Register for this class</h3>
            <p className="text-slate-500 text-sm font-medium mb-4 max-w-xl">
              {stripeUrlForCourse ? (
                <>
                  After you submit, you are sent to <strong className="text-slate-700">Stripe</strong> to pay securely. Use the same email here and at checkout so we can match your enrollment.
                </>
              ) : (
                <>
                  Add <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-800">VITE_STRIPE_PAYMENT_LINK</code> in your <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-800">.env</code> file with your Stripe Payment Link URL, then restart the dev server—otherwise we copy your details and open your email app as a fallback.
                </>
              )}
            </p>
            {stripeUrlForCourse && (
              <div className="mb-8 flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-xs font-bold text-indigo-900">
                <CreditCard size={18} className="shrink-0 text-indigo-600" />
                Stripe checkout is connected — Complete registration opens payment.
              </div>
            )}
            <form onSubmit={submitEnroll} className="grid sm:grid-cols-2 gap-4 max-w-2xl">
              <label className="sm:col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Full name
                <input required value={enroll.name} onChange={(e) => setEnroll((p) => ({ ...p, name: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="Jane Doe" />
              </label>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Work email
                <input required type="email" value={enroll.email} onChange={(e) => setEnroll((p) => ({ ...p, email: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="you@company.com" />
              </label>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Phone
                <input required type="tel" value={enroll.phone} onChange={(e) => setEnroll((p) => ({ ...p, phone: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="+1 …" />
              </label>
              <label className="sm:col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Company <span className="font-bold text-slate-300 normal-case">(optional)</span>
                <input value={enroll.company} onChange={(e) => setEnroll((p) => ({ ...p, company: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="Organization" />
              </label>
              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={payRedirecting}
                  className="register-class inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md disabled:opacity-70 disabled:pointer-events-none"
                >
                  {payRedirecting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Opening Stripe…
                    </>
                  ) : (
                    <>
                      {stripeUrlForCourse ? 'Complete registration & pay' : 'Complete registration'}
                      {!stripeUrlForCourse ? <ArrowRight size={16} /> : <CreditCard size={16} />}
                    </>
                  )}
                </button>
                <a href="tel:7329983418" className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-800 px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all">
                  <Phone size={14} /> Call to enroll
                </a>
              </div>
            </form>
            {enrollNotice === 'no-stripe-copied' && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <strong className="font-black">Stripe URL not set.</strong> Your registration text was copied to the clipboard. We also tried to open your email app—if nothing opened, paste the clipboard into an email to your team or call{' '}
                <a href="tel:7329983418" className="font-black text-indigo-700 underline">732-998-3418</a>.
                Set <code className="rounded bg-white/80 px-1 font-mono text-xs">VITE_STRIPE_PAYMENT_LINK</code> in <code className="rounded bg-white/80 px-1 font-mono text-xs">.env</code> to go straight to Stripe checkout.
              </div>
            )}
            {enrollNotice === 'no-stripe' && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <strong className="font-black">Add your Stripe Payment Link</strong> as <code className="rounded bg-white/80 px-1 font-mono text-xs">VITE_STRIPE_PAYMENT_LINK</code> in <code className="rounded bg-white/80 px-1 font-mono text-xs">.env</code>, restart Vite, and submit again to pay on Stripe. We tried to open your email app—call{' '}
                <a href="tel:7329983418" className="font-black text-indigo-700 underline">732-998-3418</a> if needed.
              </div>
            )}
          </section>

          <section className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-12 text-center md:text-left">
            <h3 className="text-xl font-black mb-4 uppercase italic">Prefer a quick call?</h3>
            <p className="text-slate-400 mb-8 max-w-xl text-sm leading-relaxed font-medium italic">Join our next elite virtual cohort based in New Jersey. Expert-led training for modern professionals.</p>
            <a href="tel:7329983418" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-xl">
              732-998-3418 <ArrowRight size={18} />
            </a>
          </section>
          <footer className="pt-10 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">
              This course curriculum and proprietary delivery methodology are properties of Priyanka Consultants, Inc.
            </p>
          </footer>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen text-slate-900 bg-white selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans">
      <AnimatePresence mode="wait">
        {selectedCourse ? (
          <CoursePage
            key="page"
            course={selectedCourse}
            onBack={() => { setSelectedCourse(null); setEnrollFromListing(false); }}
            scrollToEnroll={enrollFromListing}
          />
        ) : (
          <motion.div key="main" {...fadeIn}>
            {/* NAVIGATION */}
            <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-indigo-500/10 h-16 flex items-center">
              <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
                <div className="flex flex-col cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                  <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 italic uppercase">Priyanka</span>
                  <span className="text-[8px] font-bold tracking-[0.4em] text-slate-900 uppercase">Consultants, Inc.</span>
                </div>
                <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <a href="#services" className="hover:text-fuchsia-600 transition-colors">Services</a>
                  <a href="#compliance" className="hover:text-amber-600 transition-colors">Compliance</a>
                  <a href="#approach" className="hover:text-indigo-600 transition-all">Approach</a>
                  <a href="#trainings" className="hover:text-emerald-600 transition-all font-black text-indigo-600">Academy</a>
                  <a href="tel:7329983418" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition-all shadow-lg">
                    <Phone size={12} /> 732-998-3418
                  </a>
                </div>
              </div>
            </nav>

            {/* HERO */}
            <section className="relative pt-40 pb-32 px-6 bg-slate-950 overflow-hidden text-center text-white">
              <div className="max-w-5xl mx-auto relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white mb-8">
                  <Sparkles size={12} className="text-fuchsia-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em]">The New Standard in Advisory</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight leading-tight uppercase italic">
                  Scale <span className="text-indigo-400">Faster.</span> Build <span className="text-fuchsia-500">Smarter.</span>
                </h1>
                <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Architecting <span className="text-white font-semibold">Agile Value Streams</span>, <span className="text-white font-semibold">DevSecOps Pipelines</span>, and <span className="text-white font-semibold">Agentic AI Models</span>.
                </p>
                <a href="#trainings" className="inline-flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black hover:bg-fuchsia-500 hover:text-white transition-all shadow-xl">
                  Access Catalog <Rocket size={20} />
                </a>
              </div>
            </section>

            {/* ADVISORY SERVICES */}
            <section id="services" className="py-24 px-6 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic mb-16 underline decoration-indigo-500 underline-offset-8">Advisory Services</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { c: "bg-indigo-600", i: <Workflow />, t: "Agile & VSM", b: ["Value Stream Mgt", "OKR Alignment", "Agile Transformation"] },
                    { c: "bg-fuchsia-600", i: <Sparkles />, t: "AI Enablement", b: ["Opportunity Mapping", "AI Leadership", "Rapid Prototyping"] },
                    { c: "bg-slate-900", i: <BrainCircuit />, t: "AI/MLOps", b: ["Agentic Scaling", "Model Monitoring", "Infrastructure ROI"] },
                    { c: "bg-emerald-600", i: <Shield />, t: "DevSecOps", b: ["Security Left-Shift", "Cloud Resilience", "SRE Performance"] },
                    { c: "bg-amber-600", i: <Gavel />, t: "Gov & Risk", b: ["Compliance Audits", "Ethics Framework", "Data Sovereignty"] }
                  ].map((p, i) => (
                    <div key={`pillar-${i}`} className={`p-6 rounded-[2rem] ${p.c} text-white shadow-lg text-left`}>
                      <div className="mb-4 opacity-70">{p.i}</div>
                      <h3 className="text-sm font-black mb-4 tracking-tighter uppercase italic">{p.t}</h3>
                      <div className="space-y-4">
                        {p.b.map((bullet, j) => (
                          <div key={`bullet-${i}-${j}`} className="border-l border-white/30 pl-3">
                            <div className="font-bold text-[9px] uppercase tracking-widest leading-tight">{bullet}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* COMPLIANCE SECTION */}
            <section id="compliance" className="py-24 px-6 bg-slate-950 text-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-black tracking-tight uppercase italic mb-4">
                    Regulatory <span className="text-indigo-500">Guardrails</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium tracking-widest uppercase italic">Certified Excellence in Every Deployment</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "ISO 42001 & 27001", subtitle: "AI & Information Security", icon: <Shield className="text-indigo-400" />, points: ["AIMS Management", "Risk Assessment", "Annex A Controls"] },
                    { title: "HIPAA Compliance", subtitle: "Health Tech Governance", icon: <Activity className="text-emerald-400" />, points: ["Business Associate Agreements", "ePHI Safeguards", "Admin Security"] },
                    { title: "GDPR & CCPA MASTER", subtitle: "Global Data Privacy", icon: <Globe className="text-fuchsia-400" />, points: ["Data Residency", "Privacy by Design", "Consent Management"] },
                    { title: "Financial (SEC/SOX)", subtitle: "US Regulatory Standards", icon: <Scale className="text-amber-400" />, points: ["FINRA Record-keeping", "AML/KYC Automation", "SOX 404 Controls"] }
                  ].map((item, i) => (
                    <div key={`comp-${i}`} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group">
                      <div className="mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                      <h3 className="text-lg font-black uppercase italic mb-1 leading-tight">{item.title}</h3>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6">{item.subtitle}</p>
                      <ul className="space-y-3">
                        {item.points.map((point, j) => (
                          <li key={`pt-${i}-${j}`} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                            <CheckCircle size={12} className="text-indigo-500 shrink-0" /> {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* TECH STACK */}
            <section id="tech" className="py-24 px-6 bg-slate-900 text-white">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-black tracking-tight mb-16 uppercase italic underline decoration-cyan-500 underline-offset-8">Enterprise Tech Stack</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                  {[
                    { n: "Docker", i: <Box />, c: "text-blue-400" },
                    { n: "Kubernetes", i: <Layers />, c: "text-blue-500" },
                    { n: "Terraform", i: <Database />, c: "text-purple-400" },
                    { n: "FastAPI", i: <Zap />, c: "text-emerald-400" },
                    { n: "LangChain", i: <BrainCircuit />, c: "text-fuchsia-400" },
                    { n: "Azure", i: <Globe />, c: "text-cyan-400" },
                    { n: "Jenkins", i: <Activity />, c: "text-red-400" }
                  ].map((t, i) => (
                    <div key={`tech-${i}`} className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                      <div className={`${t.c} mb-3 group-hover:scale-110 transition-transform`}>{t.i}</div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ACADEMY */}
            <section id="trainings" className="py-24 px-6 bg-slate-50">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-black tracking-tight mb-4 text-center uppercase italic">Academy <span className="text-indigo-600 text-3xl">Catalog</span></h2>
                <p className="text-center text-slate-500 text-sm font-medium max-w-2xl mx-auto mb-10">
                  Pick a course, review objectives, then <strong className="text-slate-700">enroll</strong> or <strong className="text-slate-700">register</strong> for the next live virtual cohort—same idea as major training marketplaces.
                </p>

                <div className="mb-14 rounded-[2rem] bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-indigo-500/20 shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-indigo-600/30 p-3 border border-indigo-400/30">
                      <Calendar className="text-indigo-300" size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase italic tracking-tight mb-1">Training schedule</h3>
                      <p className="text-slate-400 text-sm font-medium max-w-xl">
                        Dates rotate by demand. Browse the catalog below, then request your preferred week—we confirm availability by email or phone.
                      </p>
                    </div>
                  </div>
                  <a href="#catalog-grid" className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">
                    Browse schedules <ArrowRight size={16} />
                  </a>
                </div>

                <div id="catalog-grid" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries({ 
                    "SAFe® 6.0": academyData.safe, 
                    "AI Engineering": academyData.ai, 
                    "Cloud Infra": academyData.cloud, 
                    "Agile Mastery": academyData.mastery 
                  }).map(([name, courses], idx) => (
                    <div key={`cat-${idx}`} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-black mb-6 text-slate-900 uppercase italic tracking-tight border-b border-slate-200 pb-2">{name}</h3>
                      <ul className="space-y-4">
                        {courses.map((c) => (
                          <li key={c.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 hover:border-indigo-200 hover:bg-white transition-all">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Live virtual</span>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{c.duration}</span>
                            </div>
                            <button type="button" onClick={() => { setEnrollFromListing(false); setSelectedCourse(c); }} className="text-left w-full text-[11px] font-black text-slate-800 hover:text-indigo-600 transition-colors">
                              {c.name}
                            </button>
                            <p className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-1 italic leading-tight mb-3">{c.detail}</p>
                            <div className="flex items-baseline justify-between gap-2 mb-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Investment</span>
                              <span className="text-lg font-black text-indigo-600">{c.price}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                className="register-class w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm"
                                onClick={() => { setEnrollFromListing(true); setSelectedCourse(c); }}
                              >
                                Enroll
                              </button>
                              <button
                                type="button"
                                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 py-1"
                                onClick={() => { setEnrollFromListing(false); setSelectedCourse(c); }}
                              >
                                View course details
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PERFORMANCE SHIFT GRID */}
            <section id="approach" className="py-24 px-6 bg-white">
              <div className="max-w-5xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-black tracking-tight mb-3 italic uppercase text-slate-900">The Performance Shift</h2>
                <p className="text-indigo-600 text-xs font-bold tracking-widest uppercase">Methodology Framework</p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                {/* Headers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 hidden md:grid">
                  <div className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Pillar</div>
                  <div className="text-center font-black text-[11px] uppercase tracking-[0.2em] text-slate-500">Traditional Approach</div>
                  <div className="text-center font-black text-[11px] uppercase tracking-[0.2em] text-indigo-600 italic">Our Approach</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                  {[
                    { f: "Agile Delivery", l: "Velocity & Points", o: "Flow Efficiency & TTM", color: "bg-cyan-500", border: "border-cyan-500/20" },
                    { f: "Alignment", l: "Annual Planning", o: "Dynamic OKRs & VSM", color: "bg-indigo-600", border: "border-indigo-600/20" },
                    { f: "AI Strategy", l: "Ad-hoc Chatbots", o: "Secure AIOM & Agents", color: "bg-fuchsia-600", border: "border-fuchsia-600/20" },
                    { f: "Security", l: "Periodic Audits", o: "Automated DevSecOps", color: "bg-emerald-600", border: "border-emerald-600/20" }
                  ].map((row, i) => (
                    <React.Fragment key={`row-${i}`}>
                      {/* Domain Column */}
                      <div className="group bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-3 transition-all hover:bg-white hover:shadow-md">
                        <div className={`w-2.5 h-2.5 rounded-full ${row.color} shadow-sm`}></div>
                        <div className="font-black text-[11px] uppercase italic tracking-tight text-slate-800">{row.f}</div>
                      </div>
                      
                      {/* Traditional Column - Improved Contrast + Hover */}
                      <div className="group/trad bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-600 text-[10px] font-bold italic text-center flex flex-col justify-center leading-tight transition-all hover:bg-white hover:text-slate-900 hover:shadow-lg hover:border-slate-300">
                        <span className="md:hidden block text-[8px] text-slate-400 mb-2 tracking-widest font-black">TRADITIONAL</span>
                        {row.l}
                      </div>
                      
                      {/* Our Approach Column */}
                      <div className={`${row.color} p-6 rounded-2xl text-white font-black text-[11px] shadow-md italic text-center flex flex-col justify-center leading-tight transition-all hover:scale-[1.02] hover:shadow-xl`}>
                        <span className="md:hidden block text-[8px] opacity-70 mb-2 uppercase tracking-widest">OUR APPROACH</span>
                        {row.o}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="py-20 bg-slate-950 text-white px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-80">
                <div className="mb-8 md:mb-0 text-center md:text-left">
                   <div className="text-3xl font-black italic tracking-tighter mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 uppercase leading-none">PRIYANKA</div>
                   <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">Consultants, Inc. — Excellence 2026</p>
                </div>
                <div className="flex flex-col items-center md:items-end gap-3 text-right">
                   <div className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Advisory Hotline</div>
                   <a href="tel:7329983418" className="text-2xl font-black hover:text-cyan-400 transition-all italic tracking-tight">732.998.3418</a>
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;