import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Shield, Zap, CheckCircle, Phone, ArrowRight, Globe, 
  BrainCircuit, Workflow, Activity, Sparkles, Rocket,
  Box, Database, Layers, ChevronLeft, Clock, DollarSign, Gavel, Scale,
  Calendar, Video, Loader2, CreditCard, ChevronDown
} from 'lucide-react';

const ENROLL_MAILTO = 'mailto:';

/** Fallback if a course has no per-course link (same price for all, or testing). */
const defaultStripePaymentLink = () => (import.meta.env.VITE_STRIPE_PAYMENT_LINK || '').trim();

/**
 * One Stripe Payment Link per course ID — set each amount in Stripe Dashboard, paste full URL here and in Vercel.
 * Keys match `id` on each course in `academyData`.
 */
const stripePaymentLinkByCourseId = {
  'leading-safe': (import.meta.env.VITE_STRIPE_LINK_LEADING_SAFE || '').trim(),
  'safe-po-pm': (import.meta.env.VITE_STRIPE_LINK_SAFE_PO_PM || '').trim(),
  'safe-rte': (import.meta.env.VITE_STRIPE_LINK_SAFE_RTE || '').trim(),
  'safe-lpm': (import.meta.env.VITE_STRIPE_LINK_SAFE_LPM || '').trim(),
  'safe-sm': (import.meta.env.VITE_STRIPE_LINK_SAFE_SM || '').trim(),
  'safe-devops': (import.meta.env.VITE_STRIPE_LINK_SAFE_DEVOPS || '').trim(),
  'gen-ai-rag': (import.meta.env.VITE_STRIPE_LINK_GEN_AI_RAG || '').trim(),
  'prompt-eng': (import.meta.env.VITE_STRIPE_LINK_PROMPT_ENG || '').trim(),
  'ai-agents': (import.meta.env.VITE_STRIPE_LINK_AI_AGENTS || '').trim(),
  'modern-eng': (import.meta.env.VITE_STRIPE_LINK_MODERN_ENG || '').trim(),
  'cloud-migration': (import.meta.env.VITE_STRIPE_LINK_CLOUD_MIGRATION || '').trim(),
  'finops': (import.meta.env.VITE_STRIPE_LINK_FINOPS || '').trim(),
  'azure-devops': (import.meta.env.VITE_STRIPE_LINK_AZURE_DEVOPS || '').trim(),
  'agile-scrum': (import.meta.env.VITE_STRIPE_LINK_AGILE_SCRUM || '').trim(),
  'jira-align': (import.meta.env.VITE_STRIPE_LINK_JIRA_ALIGN || '').trim(),
};

const paymentLinkForCourse = (course) =>
  (stripePaymentLinkByCourseId[course.id] || course.stripePaymentLink || defaultStripePaymentLink() || '').trim();

/** Stripe Payment Link query params — see https://stripe.com/docs/payment-links/customize */
const buildStripePaymentUrl = (paymentLinkBase, { email, courseId }) => {
  try {
    const u = new URL(paymentLinkBase);
    if (email) u.searchParams.set('prefilled_email', email);
    if (courseId) {
      const safe = String(courseId).replace(/[^a-zA-Z0-9_-]/g, '');
      const ref = `pci_${safe}_${Date.now()}`.slice(0, 200);
      u.searchParams.set('client_reference_id', ref);
    }
    return u.toString();
  } catch {
    return paymentLinkBase;
  }
};

/** Live virtual class times (ET). Next public cohort anchor. */
const COHORT_START_LABEL = 'May 1, 2026';
const SCHEDULE_2_DAY = `Saturday & Sunday · 9:00 AM – 5:00 PM ET · Cohort week of ${COHORT_START_LABEL}`;
const SCHEDULE_3_DAY = `Friday, Saturday & Sunday · 9:00 AM – 5:00 PM ET · Starting ${COHORT_START_LABEL}`;
const SCHEDULE_1_DAY = `Saturday · 9:00 AM – 5:00 PM ET · Week of ${COHORT_START_LABEL}`;

const buildEnrollmentPlainText = (course, { name, email, phone, company }) =>
  [
    `Enrollment / payment intent — Priyanka Consultants Academy`,
    ``,
    `Course: ${course.name}`,
    `Course ID: ${course.id}`,
    `Listed price: ${course.price}`,
    `Schedule: ${course.schedule ?? 'TBD'}`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    company ? `Company: ${company}` : null,
    ``,
    `Payment: Pay by credit card over the phone — call 732-998-3418 (we'll confirm your seat and take card payment securely).`,
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

const EASE_PREMIUM = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-12%', amount: 0.22 };

const App = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollFromListing, setEnrollFromListing] = useState(false);
  const reduceMotion = useReducedMotion();

  const heroMouseX = useMotionValue(0.5);
  const heroMouseY = useMotionValue(0.5);
  const heroSpringX = useSpring(heroMouseX, { stiffness: 38, damping: 32, mass: 0.8 });
  const heroSpringY = useSpring(heroMouseY, { stiffness: 38, damping: 32, mass: 0.8 });
  const parallaxMainX = useTransform(heroSpringX, [0, 1], reduceMotion ? [0, 0] : [52, -52]);
  const parallaxMainY = useTransform(heroSpringY, [0, 1], reduceMotion ? [0, 0] : [36, -36]);
  const parallaxAltX = useTransform(heroSpringX, [0, 1], reduceMotion ? [0, 0] : [-28, 28]);
  const parallaxAltY = useTransform(heroSpringY, [0, 1], reduceMotion ? [0, 0] : [-22, 22]);

  const onHeroPointer = (e) => {
    if (reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    heroMouseX.set((e.clientX - r.left) / r.width);
    heroMouseY.set((e.clientY - r.top) / r.height);
  };
  const onHeroLeave = () => {
    heroMouseX.set(0.5);
    heroMouseY.set(0.5);
  };

  const tr = (duration = 0.5, delay = 0) => ({
    duration: reduceMotion ? 0 : duration,
    delay: reduceMotion ? 0 : delay,
    ease: EASE_PREMIUM,
  });

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: tr(0.5),
  };

  const staggerContainer = (stagger = 0.07) => ({
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : stagger, delayChildren: reduceMotion ? 0 : 0.12 },
    },
  });

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 44 },
    show: { opacity: 1, y: 0, transition: tr(0.62) },
  };

  const fadeUpSm = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: tr(0.5) },
  };

  const blurHeroLine = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 36, filter: reduceMotion ? 'blur(0px)' : 'blur(14px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: tr(0.75, 0.06),
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: reduceMotion ? 1 : 0.88 },
    show: {
      opacity: 1,
      scale: 1,
      transition: reduceMotion ? tr(0.5) : { type: 'spring', stiffness: 160, damping: 22, mass: 0.85 },
    },
  };

  const academyData = {
    "safe": [
      { 
        id: "leading-safe", 
        name: "Leading SAFe® 6.0", 
        detail: "Thriving in the Digital Age", 
        price: "$895", 
        duration: "2 Days",
        schedule: SCHEDULE_2_DAY,
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
        schedule: SCHEDULE_2_DAY,
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
        schedule: SCHEDULE_3_DAY,
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
        schedule: SCHEDULE_2_DAY,
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
        schedule: SCHEDULE_2_DAY,
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
        schedule: SCHEDULE_2_DAY,
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
      { id: "gen-ai-rag", name: "Gen AI & RAG", detail: "Architecture", price: "$1,495", duration: "3 Days", schedule: SCHEDULE_3_DAY, audience: "Architects.", requirements: ["RAG Architecture", "Vector DB Performance", "Privacy Guardrails"] },
      { id: "prompt-eng", name: "Prompt Engineering", detail: "LLM Interfacing", price: "$795", duration: "1 Day", schedule: SCHEDULE_1_DAY, audience: "Business Leaders.", requirements: ["Zero/Few-shot Mastery", "Context Optimization", "Prompt Libraries"] },
      { id: "ai-agents", name: "AI Agents", detail: "Agentic Workflows", price: "$1,295", duration: "2 Days", schedule: SCHEDULE_2_DAY, audience: "AI Engineers.", requirements: ["Autonomous Chains", "Self-correcting logic", "Agent Monitoring"] },
      { id: "modern-eng", name: "Modern Engineering", detail: "TDD & BDD", price: "$1,150", duration: "2 Days", schedule: SCHEDULE_2_DAY, audience: "Developers.", requirements: ["TDD Cycles", "Cucumber/Gherkin", "CI/CD Automation"] }
    ],
    "cloud": [
      { id: "cloud-migration", name: "Cloud Migration", detail: "AWS/Azure/GCP", price: "$1,250", duration: "2 Days", schedule: SCHEDULE_2_DAY, audience: "IT Managers.", requirements: ["The 6 Rs of Migration", "Cloud Readiness", "Secure Data Transfer"] },
      { id: "finops", name: "FinOps", detail: "Cost Optimization", price: "$950", duration: "2 Days", schedule: SCHEDULE_2_DAY, audience: "Finance/Cloud Leads.", requirements: ["Cost Accountability", "Optimization Plans", "Real-time Dashboards"] },
      { id: "azure-devops", name: "Azure DevOps", detail: "Enterprise CI/CD", price: "$1,100", duration: "2 Days", schedule: SCHEDULE_2_DAY, audience: "DevOps Engineers.", requirements: ["Automated Pipelines", "Azure Artifacts", "Bicep/Terraform"] }
    ],
    "mastery": [
      { id: "agile-scrum", name: "Agile Foundations", detail: "Scrum & Kanban", price: "$750", duration: "2 Days", schedule: SCHEDULE_2_DAY, audience: "New Teams.", requirements: ["Roles & Artifacts", "WIP Limits", "Team Dynamics"] },
      { id: "jira-align", name: "Jira & Jira Align", detail: "Enterprise Visibility", price: "$1,300", duration: "2 Days", schedule: SCHEDULE_2_DAY, audience: "Program Managers.", requirements: ["Cross-team Tracking", "Portfolio Visibility", "Executive Reporting"] }
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

    const stripeUrlForCourse = paymentLinkForCourse(course);

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
              schedule: course.schedule,
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
        window.location.assign(
          buildStripePaymentUrl(stripeUrlForCourse, { email: enroll.email, courseId: course.id })
        );
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
      <motion.div {...fadeIn} className="min-h-screen bg-white pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.button
            type="button"
            onClick={onBack}
            whileHover={reduceMotion ? {} : { x: -4 }}
            whileTap={reduceMotion ? {} : { scale: 0.98 }}
            className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-[10px] tracking-widest mb-12 hover:gap-4 transition-all"
          >
            <ChevronLeft size={16} /> Back to Academy
          </motion.button>
          <motion.div
            className="flex flex-wrap items-center gap-2 mb-4"
            initial="hidden"
            animate="show"
            variants={staggerContainer(0.06)}
          >
            <motion.span variants={fadeUpSm} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-emerald-200">
              <Video size={12} className="shrink-0" /> Live virtual
            </motion.span>
            <motion.span variants={fadeUpSm} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
              <Calendar size={12} /> {COHORT_START_LABEL} cohort
            </motion.span>
          </motion.div>
          <motion.h1
            className="text-5xl font-black tracking-tight text-slate-900 mb-4 italic leading-none"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={tr(0.55, 0.05)}
          >
            {course.name}
          </motion.h1>
          <motion.div
            className="mb-12 border-b border-slate-100 pb-8 space-y-4"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={tr(0.45, 0.12)}
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-xl"><DollarSign size={20}/> {course.price}</div>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest"><Clock size={16}/> {course.duration} Session</div>
            </div>
            <p className="flex items-start gap-3 text-sm font-semibold text-slate-700 leading-relaxed max-w-2xl">
              <Calendar className="shrink-0 text-indigo-600 mt-0.5" size={18} strokeWidth={2} />
              <span>{course.schedule}</span>
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <motion.section initial="hidden" whileInView="show" viewport={VIEWPORT} variants={staggerContainer(0.08)}>
              <motion.h2 variants={fadeUp} className="text-xl font-black text-slate-900 uppercase italic border-b-2 border-indigo-600 inline-block mb-6">Target Audience</motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 text-sm font-medium leading-relaxed">{course.audience}</motion.p>
            </motion.section>
            <motion.section initial="hidden" whileInView="show" viewport={VIEWPORT} variants={staggerContainer(0.05)}>
              <motion.h2 variants={fadeUpSm} className="text-xl font-black text-slate-900 uppercase italic border-b-2 border-indigo-600 inline-block mb-6">Learning Objectives</motion.h2>
              <ul className="space-y-3">
                {course.requirements.map((r, i) => (
                  <motion.li
                    key={`req-${i}`}
                    variants={fadeUpSm}
                    custom={i}
                    whileHover={reduceMotion ? {} : { scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.35)' }}
                    className="flex gap-3 text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors"
                  >
                    <CheckCircle className="text-indigo-600 shrink-0" size={14}/> {r}
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          </div>

          <motion.section
            id="enroll"
            ref={enrollRef}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={tr(0.55)}
            className="rounded-[2rem] border-2 border-indigo-100 bg-gradient-to-b from-white to-slate-50 p-8 md:p-10 shadow-lg mb-12"
          >
            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">Register for this class</h3>
            <p className="text-slate-500 text-sm font-medium mb-4 max-w-xl">
              {stripeUrlForCourse ? (
                <>
                  Submit the form, then you’ll continue to <strong className="text-slate-800">Stripe Checkout</strong> to pay online with a card (and Apple Pay / Google Pay where Stripe offers them).{' '}
                  <strong className="text-slate-800">Use the same work email</strong> here and on Stripe so we can match your payment to this registration.
                </>
              ) : (
                <>
                  <strong className="text-slate-800">Online checkout is not set up for this course yet.</strong> Submit your details—we’ll confirm your seat.{' '}
                  <strong className="text-slate-700">Pay by credit card</strong> by calling{' '}
                  <a href="tel:7329983418" className="font-black text-indigo-700 underline decoration-indigo-300 underline-offset-2">732-998-3418</a>
                  {' '}(card over the phone). We can also open your email with your enrollment details, or copy them to the clipboard.
                </>
              )}
            </p>
            {!stripeUrlForCourse && (
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs font-bold text-emerald-950">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="shrink-0 text-emerald-700" />
                  <span>Pay by card over the phone</span>
                </div>
                <a href="tel:7329983418" className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-800 transition-colors">
                  <Phone size={14} className="mr-1.5" /> 732-998-3418
                </a>
              </div>
            )}
            {stripeUrlForCourse && (
              <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 px-4 py-3 text-xs text-indigo-950">
                <div className="flex items-start gap-2 font-bold">
                  <CreditCard size={18} className="shrink-0 text-indigo-600 mt-0.5" />
                  <span>
                    <strong className="font-black">Stripe web checkout is on.</strong> After submit, your browser goes to Stripe’s hosted payment page—you pay there, not on this form.
                  </span>
                </div>
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
                      <Loader2 size={16} className="animate-spin" /> Redirecting to Stripe…
                    </>
                  ) : (
                    <>
                      {stripeUrlForCourse ? 'Continue to Stripe to pay online' : 'Submit registration'}
                      {!stripeUrlForCourse ? <ArrowRight size={16} /> : <CreditCard size={16} />}
                    </>
                  )}
                </button>
                <a
                  href="tel:7329983418"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                    stripeUrlForCourse
                      ? 'border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'
                      : 'border-2 border-slate-200 text-slate-800 hover:border-indigo-600 hover:text-indigo-600'
                  }`}
                >
                  <Phone size={14} /> {stripeUrlForCourse ? 'Call us instead' : 'Pay by card — call'}
                </a>
              </div>
            </form>
            {enrollNotice === 'no-stripe-copied' && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                <strong className="font-black">Registration details copied.</strong> We also tried to open your email—if nothing opened, paste from the clipboard into an email to us.{' '}
                <strong className="font-black">To pay by credit card,</strong> call{' '}
                <a href="tel:7329983418" className="font-black text-emerald-800 underline">732-998-3418</a>.
              </div>
            )}
            {enrollNotice === 'no-stripe' && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                <strong className="font-black">Registration sent.</strong> We tried to open your email app—if it didn’t open, call{' '}
                <a href="tel:7329983418" className="font-black text-emerald-800 underline">732-998-3418</a>
                {' '}to confirm and <strong className="font-black">pay by credit card</strong> over the phone.
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={tr(0.5)}
            className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mb-12 text-center md:text-left"
          >
            <motion.div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl"
              animate={reduceMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <h3 className="text-xl font-black mb-4 uppercase italic relative z-10">Prefer a quick call?</h3>
            <p className="text-slate-400 mb-8 max-w-xl text-sm leading-relaxed font-medium italic relative z-10">Join our next elite virtual cohort based in New Jersey. Expert-led training for modern professionals.</p>
            <motion.a
              href="tel:7329983418"
              whileHover={reduceMotion ? {} : { scale: 1.03 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
              className="relative z-10 inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors shadow-xl"
            >
              732-998-3418 <ArrowRight size={18} />
            </motion.a>
          </motion.section>
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
            <motion.nav
              initial={{ y: reduceMotion ? 0 : -24, opacity: reduceMotion ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={tr(0.55)}
              className="fixed w-full z-50 bg-white/70 backdrop-blur-2xl border-b border-indigo-500/10 h-16 flex items-center"
            >
              <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
                <motion.div
                  className="flex flex-col cursor-pointer"
                  onClick={() => window.scrollTo(0, 0)}
                  whileHover={reduceMotion ? {} : { scale: 1.02 }}
                  whileTap={reduceMotion ? {} : { scale: 0.98 }}
                >
                  <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 italic uppercase">Priyanka</span>
                  <span className="text-[8px] font-bold tracking-[0.4em] text-slate-900 uppercase">Consultants, Inc.</span>
                </motion.div>
                <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <motion.a href="#services" whileHover={reduceMotion ? {} : { y: -2 }} className="hover:text-fuchsia-600 transition-colors">Services</motion.a>
                  <motion.a href="#compliance" whileHover={reduceMotion ? {} : { y: -2 }} className="hover:text-amber-600 transition-colors">Compliance</motion.a>
                  <motion.a href="#approach" whileHover={reduceMotion ? {} : { y: -2 }} className="hover:text-indigo-600 transition-all">Approach</motion.a>
                  <motion.a href="#trainings" whileHover={reduceMotion ? {} : { y: -2 }} className="hover:text-emerald-600 transition-all font-black text-indigo-600">Academy</motion.a>
                  <motion.a
                    href="tel:7329983418"
                    whileHover={reduceMotion ? {} : { scale: 1.04 }}
                    whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition-colors shadow-lg"
                  >
                    <Phone size={12} /> 732-998-3418
                  </motion.a>
                </div>
              </div>
            </motion.nav>

            {/* HERO — motion graphics layer + pointer parallax */}
            <section
              className="relative min-h-[88vh] flex flex-col justify-center pt-32 pb-28 px-6 overflow-hidden text-center text-white"
              onMouseMove={onHeroPointer}
              onMouseLeave={onHeroLeave}
            >
              <div className="absolute inset-0 pci-hero-mesh" aria-hidden />
              <div className="absolute inset-0 pci-hero-grid pointer-events-none" aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
                aria-hidden
              />

              {!reduceMotion && (
                <>
                  <motion.div
                    style={{ x: parallaxMainX, y: parallaxMainY }}
                    className="pointer-events-none absolute left-[8%] top-[18%] h-[min(55vw,420px)] w-[min(55vw,420px)] rounded-full bg-indigo-500/35 blur-[80px] pci-float-orb"
                    aria-hidden
                  />
                  <motion.div
                    style={{ x: parallaxAltX, y: parallaxAltY }}
                    className="pointer-events-none absolute right-[5%] bottom-[12%] h-[min(50vw,380px)] w-[min(50vw,380px)] rounded-full bg-fuchsia-500/30 blur-[72px] pci-float-orb-delayed"
                    aria-hidden
                  />
                  <motion.div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[min(95vw,640px)] w-[min(95vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08] pci-ring-pulse"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
                    aria-hidden
                  />
                  <motion.div
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[min(75vw,520px)] w-[min(75vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
                    aria-hidden
                  />
                </>
              )}

              <motion.div
                className="max-w-5xl mx-auto relative z-10 flex flex-col items-center"
                initial="hidden"
                animate="show"
                variants={staggerContainer(0.12)}
              >
                <motion.div
                  variants={fadeUpSm}
                  className="pci-badge-shine inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white mb-10 shadow-[0_0_40px_-8px_rgba(99,102,241,0.5)]"
                >
                  <motion.span
                    animate={reduceMotion ? {} : { rotate: [0, 18, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles size={14} className="text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" />
                  </motion.span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.35em]">The New Standard in Advisory</span>
                </motion.div>

                <motion.h1
                  variants={blurHeroLine}
                  className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight leading-[1.05] uppercase italic px-2"
                >
                  <span className="block md:inline">Scale </span>
                  <span className="pci-text-shimmer">Faster.</span>
                  <span className="block md:inline md:ml-2 mt-2 md:mt-0"> Build </span>
                  <span className="pci-text-shimmer">Smarter.</span>
                </motion.h1>

                <motion.p
                  variants={blurHeroLine}
                  className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
                >
                  Architecting{' '}
                  <span className="text-white font-semibold drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">Agile Value Streams</span>,{' '}
                  <span className="text-white font-semibold drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">DevSecOps Pipelines</span>, and{' '}
                  <span className="text-white font-semibold drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">Agentic AI Models</span>.
                </motion.p>

                <motion.div variants={blurHeroLine} className="relative">
                  {!reduceMotion && (
                    <motion.div
                      className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 opacity-90 blur-[2px]"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      aria-hidden
                    />
                  )}
                  <motion.a
                    href="#trainings"
                    whileHover={reduceMotion ? {} : { scale: 1.06, y: -2 }}
                    whileTap={reduceMotion ? {} : { scale: 0.97 }}
                    className="relative z-10 inline-flex items-center gap-3 bg-white text-slate-950 px-10 py-4 rounded-2xl font-black hover:bg-slate-100 transition-colors pci-cta-glow text-sm md:text-base"
                  >
                    Access Catalog <Rocket size={20} className="text-indigo-600" />
                  </motion.a>
                </motion.div>

                <motion.a
                  href="#services"
                  variants={fadeUpSm}
                  className={`mt-16 flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-500 hover:text-slate-300 transition-colors ${reduceMotion ? '' : 'pci-scroll-cue'}`}
                  aria-label="Scroll to services"
                >
                  <span>Explore</span>
                  <ChevronDown size={22} className="text-indigo-400/90" />
                </motion.a>
              </motion.div>
            </section>

            {/* ADVISORY SERVICES */}
            <motion.section id="services" className="py-24 px-6 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto text-center">
                <div className="mb-16">
                  <motion.h2
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 32, filter: reduceMotion ? 'none' : 'blur(10px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={VIEWPORT}
                    transition={tr(0.65)}
                    className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase italic"
                  >
                    Advisory Services
                  </motion.h2>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={VIEWPORT}
                    transition={tr(0.8, 0.1)}
                    className="mt-4 h-1.5 max-w-xs mx-auto rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 origin-center"
                  />
                </div>
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-5 gap-3"
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  variants={staggerContainer(0.08)}
                >
                  {[
                    { c: "bg-indigo-600", i: <Workflow />, t: "Agile & VSM", b: ["Value Stream Mgt", "OKR Alignment", "Agile Transformation"] },
                    { c: "bg-fuchsia-600", i: <Sparkles />, t: "AI Enablement", b: ["Opportunity Mapping", "AI Leadership", "Rapid Prototyping"] },
                    { c: "bg-slate-900", i: <BrainCircuit />, t: "AI/MLOps", b: ["Agentic Scaling", "Model Monitoring", "Infrastructure ROI"] },
                    { c: "bg-emerald-600", i: <Shield />, t: "DevSecOps", b: ["Security Left-Shift", "Cloud Resilience", "SRE Performance"] },
                    { c: "bg-amber-600", i: <Gavel />, t: "Gov & Risk", b: ["Compliance Audits", "Ethics Framework", "Data Sovereignty"] }
                  ].map((p, i) => (
                    <motion.div
                      key={`pillar-${i}`}
                      variants={scaleIn}
                      whileHover={reduceMotion ? {} : { y: -6, transition: { duration: 0.25 } }}
                      className={`p-6 rounded-[2rem] ${p.c} text-white shadow-lg text-left will-change-transform`}
                    >
                      <motion.div className="mb-4 opacity-70" whileHover={reduceMotion ? {} : { scale: 1.08, rotate: -3 }}>{p.i}</motion.div>
                      <h3 className="text-sm font-black mb-4 tracking-tighter uppercase italic">{p.t}</h3>
                      <div className="space-y-4">
                        {p.b.map((bullet, j) => (
                          <div key={`bullet-${i}-${j}`} className="border-l border-white/30 pl-3">
                            <div className="font-bold text-[9px] uppercase tracking-widest leading-tight">{bullet}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* COMPLIANCE SECTION */}
            <motion.section id="compliance" className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
              {!reduceMotion && (
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-0 h-64 w-[120%] -translate-x-1/2 bg-gradient-to-b from-indigo-600/15 to-transparent"
                  animate={{ opacity: [0.5, 0.85, 0.5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={tr(0.5)}
                >
                  <h2 className="text-4xl font-black tracking-tight uppercase italic mb-4">
                    Regulatory <span className="text-indigo-500">Guardrails</span>
                  </h2>
                  <p className="text-slate-400 text-sm font-medium tracking-widest uppercase italic">Certified Excellence in Every Deployment</p>
                </motion.div>
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  variants={staggerContainer(0.1)}
                >
                  {[
                    { title: "ISO 42001 & 27001", subtitle: "AI & Information Security", icon: <Shield className="text-indigo-400" />, points: ["AIMS Management", "Risk Assessment", "Annex A Controls"] },
                    { title: "HIPAA Compliance", subtitle: "Health Tech Governance", icon: <Activity className="text-emerald-400" />, points: ["Business Associate Agreements", "ePHI Safeguards", "Admin Security"] },
                    { title: "GDPR & CCPA MASTER", subtitle: "Global Data Privacy", icon: <Globe className="text-fuchsia-400" />, points: ["Data Residency", "Privacy by Design", "Consent Management"] },
                    { title: "Financial (SEC/SOX)", subtitle: "US Regulatory Standards", icon: <Scale className="text-amber-400" />, points: ["FINRA Record-keeping", "AML/KYC Automation", "SOX 404 Controls"] }
                  ].map((item, i) => (
                    <motion.div
                      key={`comp-${i}`}
                      variants={fadeUp}
                      whileHover={reduceMotion ? {} : { y: -8, borderColor: 'rgba(99, 102, 241, 0.45)' }}
                      className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group"
                    >
                      <motion.div className="mb-6" whileHover={reduceMotion ? {} : { scale: 1.12, rotate: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>{item.icon}</motion.div>
                      <h3 className="text-lg font-black uppercase italic mb-1 leading-tight">{item.title}</h3>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6">{item.subtitle}</p>
                      <ul className="space-y-3">
                        {item.points.map((point, j) => (
                          <li key={`pt-${i}-${j}`} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                            <CheckCircle size={12} className="text-indigo-500 shrink-0" /> {point}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* TECH STACK */}
            <motion.section id="tech" className="py-24 px-6 bg-slate-900 text-white">
              <div className="max-w-7xl mx-auto text-center">
                <motion.h2
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={VIEWPORT}
                  transition={tr(0.5)}
                  className="text-3xl font-black tracking-tight mb-16 uppercase italic underline decoration-cyan-500 underline-offset-8"
                >
                  Enterprise Tech Stack
                </motion.h2>
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6"
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  variants={staggerContainer(0.06)}
                >
                  {[
                    { n: "Docker", i: <Box />, c: "text-blue-400" },
                    { n: "Kubernetes", i: <Layers />, c: "text-blue-500" },
                    { n: "Terraform", i: <Database />, c: "text-purple-400" },
                    { n: "FastAPI", i: <Zap />, c: "text-emerald-400" },
                    { n: "LangChain", i: <BrainCircuit />, c: "text-fuchsia-400" },
                    { n: "Azure", i: <Globe />, c: "text-cyan-400" },
                    { n: "Jenkins", i: <Activity />, c: "text-red-400" }
                  ].map((t, i) => (
                    <motion.div
                      key={`tech-${i}`}
                      variants={fadeUpSm}
                      whileHover={reduceMotion ? {} : { y: -6, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      className="flex flex-col items-center p-6 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors"
                    >
                      <motion.div
                        className={`${t.c} mb-3`}
                        animate={reduceMotion ? {} : { y: [0, -4, 0] }}
                        transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                      >
                        {t.i}
                      </motion.div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.n}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* ACADEMY */}
            <motion.section id="trainings" className="py-24 px-6 bg-slate-50">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={tr(0.5)}
                >
                  <h2 className="text-4xl font-black tracking-tight mb-4 text-center uppercase italic">Academy <span className="text-indigo-600 text-3xl">Catalog</span></h2>
                  <p className="text-center text-slate-500 text-sm font-medium max-w-2xl mx-auto mb-10">
                    Pick a course, review objectives, then <strong className="text-slate-700">enroll</strong>. Courses marked <strong className="text-indigo-600">Stripe · Pay online</strong> continue to Stripe’s hosted checkout after you submit the form (card, Apple Pay, Google Pay where available). Otherwise we confirm by phone or email.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={tr(0.55, 0.05)}
                  className="mb-14 rounded-[2rem] bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-indigo-500/20 shadow-xl relative overflow-hidden"
                >
                  {!reduceMotion && (
                    <motion.div
                      className="pointer-events-none absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <div className="flex items-start gap-4 relative z-10">
                    <motion.div
                      className="rounded-2xl bg-indigo-600/30 p-3 border border-indigo-400/30"
                      animate={reduceMotion ? {} : { boxShadow: ['0 0 0 0 rgba(99,102,241,0.35)', '0 0 0 12px rgba(99,102,241,0)', '0 0 0 0 rgba(99,102,241,0.35)'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
                    >
                      <Calendar className="text-indigo-300" size={28} />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-black uppercase italic tracking-tight mb-1">Training schedule</h3>
                      <p className="text-slate-400 text-sm font-medium max-w-xl">
                        Dates rotate by demand. Browse the catalog below, then request your preferred week—we confirm availability by email or phone.
                      </p>
                    </div>
                  </div>
                  <motion.a
                    href="#catalog-grid"
                    whileHover={reduceMotion ? {} : { scale: 1.04 }}
                    whileTap={reduceMotion ? {} : { scale: 0.98 }}
                    className="relative z-10 shrink-0 inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                  >
                    Browse schedules <ArrowRight size={16} />
                  </motion.a>
                </motion.div>

                <div id="catalog-grid" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries({ 
                    "SAFe® 6.0": academyData.safe, 
                    "AI Engineering": academyData.ai, 
                    "Cloud Infra": academyData.cloud, 
                    "Agile Mastery": academyData.mastery 
                  }).map(([name, courses], idx) => (
                    <motion.div
                      key={`cat-${idx}`}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={VIEWPORT}
                      transition={tr(0.45, idx * 0.08)}
                      className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm"
                    >
                      <h3 className="text-lg font-black mb-6 text-slate-900 uppercase italic tracking-tight border-b border-slate-200 pb-2">{name}</h3>
                      <ul className="space-y-4">
                        {courses.map((c) => (
                          <motion.li
                            key={c.id}
                            whileHover={reduceMotion ? {} : { y: -3 }}
                            className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 hover:border-indigo-200 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Live virtual</span>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{c.duration}</span>
                              {paymentLinkForCourse(c) ? (
                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Stripe · Pay online</span>
                              ) : null}
                            </div>
                            <button type="button" onClick={() => { setEnrollFromListing(false); setSelectedCourse(c); }} className="text-left w-full text-[11px] font-black text-slate-800 hover:text-indigo-600 transition-colors">
                              {c.name}
                            </button>
                            <p className="text-[8px] uppercase tracking-widest text-slate-400 font-bold mt-1 italic leading-tight mb-2">{c.detail}</p>
                            <p className="text-[9px] font-semibold text-slate-600 leading-snug mb-3 border-l-2 border-indigo-200 pl-2">{c.schedule}</p>
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
                                {paymentLinkForCourse(c) ? 'Enroll — pay on Stripe' : 'Enroll'}
                              </button>
                              <button
                                type="button"
                                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 py-1"
                                onClick={() => { setEnrollFromListing(false); setSelectedCourse(c); }}
                              >
                                View course details
                              </button>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* PERFORMANCE SHIFT GRID */}
            <motion.section id="approach" className="py-24 px-6 bg-white overflow-hidden">
              <motion.div
                className="max-w-5xl mx-auto text-center mb-16"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={tr(0.5)}
              >
                <h2 className="text-3xl font-black tracking-tight mb-3 italic uppercase text-slate-900">The Performance Shift</h2>
                <p className="text-indigo-600 text-xs font-bold tracking-widest uppercase">Methodology Framework</p>
              </motion.div>

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 hidden md:grid">
                  <div className="px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Pillar</div>
                  <div className="text-center font-black text-[11px] uppercase tracking-[0.2em] text-slate-500">Traditional Approach</div>
                  <div className="text-center font-black text-[11px] uppercase tracking-[0.2em] text-indigo-600 italic">Our Approach</div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { f: "Agile Delivery", l: "Velocity & Points", o: "Flow Efficiency & TTM", color: "bg-cyan-500", border: "border-cyan-500/20" },
                    { f: "Alignment", l: "Annual Planning", o: "Dynamic OKRs & VSM", color: "bg-indigo-600", border: "border-indigo-600/20" },
                    { f: "AI Strategy", l: "Ad-hoc Chatbots", o: "Secure AIOM & Agents", color: "bg-fuchsia-600", border: "border-fuchsia-600/20" },
                    { f: "Security", l: "Periodic Audits", o: "Automated DevSecOps", color: "bg-emerald-600", border: "border-emerald-600/20" }
                  ].map((row, i) => (
                    <motion.div
                      key={`row-${row.f}`}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 24, x: reduceMotion ? 0 : i % 2 === 0 ? -12 : 12 }}
                      whileInView={{ opacity: 1, y: 0, x: 0 }}
                      viewport={VIEWPORT}
                      transition={tr(0.5, i * 0.07)}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch"
                    >
                      <div className="group bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-3 transition-all hover:bg-white hover:shadow-md">
                        <motion.div
                          className={`w-2.5 h-2.5 rounded-full ${row.color} shadow-sm`}
                          animate={reduceMotion ? {} : { scale: [1, 1.25, 1] }}
                          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                        />
                        <div className="font-black text-[11px] uppercase italic tracking-tight text-slate-800">{row.f}</div>
                      </div>

                      <div className="group/trad bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-600 text-[10px] font-bold italic text-center flex flex-col justify-center leading-tight transition-all hover:bg-white hover:text-slate-900 hover:shadow-lg hover:border-slate-300">
                        <span className="md:hidden block text-[8px] text-slate-400 mb-2 tracking-widest font-black">TRADITIONAL</span>
                        {row.l}
                      </div>

                      <motion.div
                        whileHover={reduceMotion ? {} : { scale: 1.02 }}
                        className={`${row.color} p-6 rounded-2xl text-white font-black text-[11px] shadow-md italic text-center flex flex-col justify-center leading-tight transition-shadow hover:shadow-xl`}
                      >
                        <span className="md:hidden block text-[8px] opacity-70 mb-2 uppercase tracking-widest">OUR APPROACH</span>
                        {row.o}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* FOOTER */}
            <motion.footer
              className="py-20 bg-slate-950 text-white px-6 relative overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={VIEWPORT}
              transition={tr(0.6)}
            >
              {!reduceMotion && (
                <motion.div
                  className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-[80%] -translate-x-1/2 bg-gradient-to-t from-indigo-600/20 to-transparent blur-2xl"
                  animate={{ opacity: [0.3, 0.55, 0.3] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-90 relative z-10">
                <motion.div
                  className="mb-8 md:mb-0 text-center md:text-left"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={tr(0.45)}
                >
                  <div className="text-3xl font-black italic tracking-tighter mb-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400 uppercase leading-none">PRIYANKA</div>
                  <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">Consultants, Inc. — Excellence 2026</p>
                </motion.div>
                <motion.div
                  className="flex flex-col items-center md:items-end gap-3 text-right"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={tr(0.45, 0.08)}
                >
                  <div className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Advisory Hotline</div>
                  <motion.a
                    href="tel:7329983418"
                    whileHover={reduceMotion ? {} : { scale: 1.03 }}
                    className="text-2xl font-black hover:text-cyan-400 transition-colors italic tracking-tight"
                  >
                    732.998.3418
                  </motion.a>
                </motion.div>
              </div>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;