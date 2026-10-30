import Link from "next/link";
import { createPageMetadata } from "../lib/seo";
import styles from "./custom.module.css";

export const metadata = createPageMetadata({
  title: "Custom Robot Solutions — Built Around Your Operations",
  description:
    "ATSN Robotics builds custom autonomous robots for warehouses, hospitals, factories, airports, and large venues. We design around your space, your workflow, and your team — not the other way around.",
  path: "/custom",
  keywords: [
    "custom robot manufacturing India",
    "warehouse automation robot",
    "custom autonomous robot",
    "hospital delivery robot India",
    "factory floor robot",
    "logistics robot Gujarat",
    "bespoke service robot",
    "ATSN custom robots",
  ],
});

const SPACES = [
  {
    id: "warehouse",
    label: "Warehouses & Logistics",
    headline: "Your workers shouldn't be pushing carts all day.",
    description:
      "A lot of warehouse labour isn't skilled work — it's moving things from one end of a building to the other. We build robots that take over that movement: goods transport between zones, restocking pick stations, last-metre delivery to packing benches. Your team stays focused on the work that actually needs human judgement.",
    specs: ["Payload configuration up to 80 kg", "Works with your existing floor markings", "Connects to WMS and inventory software", "Runs continuous shifts without fatigue"],
  },
  {
    id: "hospital",
    label: "Healthcare & Hospitals",
    headline: "Nurses should be with patients, not pushing trolleys.",
    description:
      "We have spoken to hospital operations teams across India, and the same frustration comes up every time: trained clinical staff spending hours on medication runs, linen collection, and sample transport. Our healthcare robots handle those routes quietly — through wards, service corridors, and lifts — without interrupting patient care or adding noise to an already demanding environment.",
    specs: ["Smooth surfaces, easy to wipe down between runs", "Quiet drive mode for night wards", "Works with standard hospital service lifts", "Can be configured for sealed sample or medication transport"],
  },
  {
    id: "airport",
    label: "Airports & Transport Hubs",
    headline: "Terminals are large. Staffing them fully is expensive.",
    description:
      "Airports face a constant gap between passenger volume and ground staff availability. We build robots that close part of that gap — F&B delivery to gate areas, baggage trolley collection, and directional guidance for passengers who are lost. The robot handles the repeatable work; your staff handles the exceptions.",
    specs: ["Designed for high footfall and fast-moving crowds", "Multi-floor capable with lift integration", "Can carry your terminal's branding", "Live location visible to operations dashboard"],
  },
  {
    id: "factory",
    label: "Factories & Manufacturing",
    headline: "The floor between your machines is full of manual handling.",
    description:
      "Most factory automation investments go into the machines — but the movement between machines is still manual. Workers walking parts from one station to the next, carrying consumables, shuttling finished sub-assemblies to inspection. We build robots for exactly that in-between work, designed to share the floor safely with your team and fit into the lanes and workflows you already have.",
    specs: ["Narrow-aisle chassis options", "Works alongside workers without barriers", "Configurable payload trays and fixtures", "Can be connected to MES or ERP systems"],
  },
  {
    id: "retail",
    label: "Retail & Large Stores",
    headline: "Stockouts happen because replenishment is slow, not because stock isn't there.",
    description:
      "In large-format retail, the shelf check and replenishment cycle is done manually, often once a shift. By the time a gap is spotted, a customer has already left empty-handed. Our retail robots scan continuously and can flag or trigger restocking runs without waiting for the next scheduled walk. They also handle back-room to shop-floor transport during trading hours, when staff are needed on tills.",
    specs: ["Shelf-height scanning during store hours", "Flags gaps to your inventory system in real time", "Back-room to shop-floor runs without disrupting customers", "Branded to match your store environment"],
  },
  {
    id: "stadium",
    label: "Stadiums & Large Venues",
    headline: "Event day is the hardest shift. Robots don't call in sick.",
    description:
      "A 50,000-seat venue on match day needs F&B restocking, waste collection, and concourse deliveries running continuously — and staffing that at scale is genuinely difficult. Our Argo Flex platform was built with exactly this use case in mind. We extend it for your venue's layout, add concourse-specific routing, and configure it around your event schedule so it runs without needing constant supervision.",
    specs: ["Designed for dense event-day crowds", "Multi-zone route management from a single dashboard", "Can be wrapped in venue or sponsor branding", "Emergency stop and crowd-detection built in"],
  },
];

const PROCESS = [
  {
    step: "01",
    title: "We talk first",
    body: "Not a demo, not a pitch deck — a conversation. We want to understand your space, the specific task you want automated, and what has stopped you from solving it already. That context shapes everything we build.",
  },
  {
    step: "02",
    title: "We propose something specific",
    body: "Our engineering team comes back with a concrete proposal: what the robot looks like, how it navigates, what sensors it uses, how it connects to your existing software. You see exactly what you are getting before we build anything.",
  },
  {
    step: "03",
    title: "We test it at your site",
    body: "A working prototype runs at your facility — not in a lab, not in a controlled demo environment. Real floors, real obstacles, real edge cases. We fix what doesn't work until the robot performs the way you need it to.",
  },
  {
    step: "04",
    title: "We deliver it ready to run",
    body: "When we ship, the robot is already mapped, configured, and tested. Your team gets hands-on training before we leave, and documentation that doesn't require a robotics degree to follow.",
  },
  {
    step: "05",
    title: "We stay involved",
    body: "After deployment, we monitor remotely, push software updates, and check in on performance. If something changes in your environment, we adapt the robot to match — you shouldn't need to call in a separate service team every time something shifts.",
  },
];

const WHY = [
  {
    title: "We build everything ourselves",
    body: "Hardware, navigation software, fleet management — all of it is designed and built in-house at our facility in Gujarat. That matters because when something needs to change, we can change it. We are not waiting on a third-party chassis supplier or a licensed navigation stack to release an update.",
  },
  {
    title: "Our robots handle messy real-world spaces",
    body: "Things move. Pallets shift. Temporary signage goes up. People prop doors open. Most robots struggle when the environment doesn't match their map exactly. Ours are trained to handle that kind of variability — they adjust in real time rather than stopping and waiting for human intervention.",
  },
  {
    title: "One robot or twenty — same process",
    body: "We work with clients running a single pilot unit and with clients planning large fleet rollouts. The engineering rigour is identical either way. We don't have a minimum order size, and we don't fast-track large orders at the expense of smaller ones.",
  },
  {
    title: "We speak your software's language",
    body: "A robot that doesn't connect to your warehouse system, your ERP, or your operations dashboard creates more work than it saves. We integrate with the tools you already use — and if your system is custom-built, we work with your tech team to make the connection.",
  },
];

export default function CustomPage() {
  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Custom Robot Solutions</p>
          <h1 className={styles.heroTitle}>
            Your space.{" "}
            <span className={styles.heroAccent}>Your robot.</span>
          </h1>
          <p className={styles.heroLead}>
            Most robotics companies sell you a standard product and ask you to fit
            your operations around it. We do it the other way. Tell us what task
            you need automated and where it needs to happen — we build the robot
            that fits your space, not the other way around.
          </p>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.btnPrimary}>Talk to our team</Link>
            <a href="#process" className={styles.btnSecondary}>How it works</a>
          </div>
        </div>
        <div className={styles.heroBadges}>
          {["Designed and built in Gujarat", "No off-the-shelf platforms", "Works with your existing software", "One robot or a full fleet"].map(b => (
            <span key={b} className={styles.heroBadge}>{b}</span>
          ))}
        </div>
      </section>

      {/* ── Spaces ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Where We Work</p>
            <h2 className={styles.sectionTitle}>Every space has a different problem</h2>
            <p className={styles.sectionLead}>
              We have had conversations with operations teams across hospitality,
              healthcare, logistics, and manufacturing. The specific task is always
              different. What stays the same is that the manual work is costing
              more than it should.
            </p>
          </div>

          <div className={styles.spacesGrid}>
            {SPACES.map(s => (
              <div key={s.id} className={styles.spaceCard}>
                <span className={styles.spaceLabel}>{s.label}</span>
                <h3 className={styles.spaceHeadline}>{s.headline}</h3>
                <p className={styles.spaceBody}>{s.description}</p>
                <ul className={styles.specList}>
                  {s.specs.map(spec => (
                    <li key={spec} className={styles.specItem}>
                      <span className={styles.specDot} />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why ATSN ── */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Why ATSN Robotics</p>
            <h2 className={styles.sectionTitle}>Why clients choose to work with us</h2>
          </div>
          <div className={styles.whyGrid}>
            {WHY.map(w => (
              <div key={w.title} className={styles.whyCard}>
                <h3 className={styles.whyTitle}>{w.title}</h3>
                <p className={styles.whyBody}>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="process" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>How We Work</p>
            <h2 className={styles.sectionTitle}>What to expect when you work with us</h2>
            <p className={styles.sectionLead}>
              We have been through this enough times to know where it goes wrong —
              usually when expectations aren't set clearly at the start. So here is
              exactly what the process looks like, from first conversation to
              robot running on your floor.
            </p>
          </div>
          <div className={styles.processList}>
            {PROCESS.map((p, i) => (
              <div key={p.step} className={styles.processItem}>
                <div className={styles.processLeft}>
                  <span className={styles.processStep}>{p.step}</span>
                  {i < PROCESS.length - 1 && <div className={styles.processLine} />}
                </div>
                <div className={styles.processContent}>
                  <h3 className={styles.processTitle}>{p.title}</h3>
                  <p className={styles.processBody}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <p className={styles.eyebrow}>Get in Touch</p>
          <h2 className={styles.ctaTitle}>Tell us what the problem actually is.</h2>
          <p className={styles.ctaLead}>
            You don't need to arrive with a technical brief. Just describe what
            your team is spending time on that a robot should be doing instead.
            We will take it from there.
          </p>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.btnPrimary}>Contact our team</Link>
            <Link href="/sonic" className={styles.btnSecondary}>See Argo Sonic</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
