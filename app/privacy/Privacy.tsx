"use client";

import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

export function Privacy() {
  const effectiveDate = "April 6, 2026";

  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero" style={{ position: "relative" }}>
        <p className="atsnHero__eyebrow">Legal</p>
        <BlurText text="Privacy Policy" as="h1" className="atsnHero__title" />
        <ScrollReveal>
          <p className="atsnHero__lead">
            Effective date: {effectiveDate}. This Privacy Policy explains how ATSN Robotics (“ATSN,”
            “we,” “us”) collects, uses, and shares information when you visit our website, contact
            us, or operate our robotics hardware and software, including ARGO.
          </p>
        </ScrollReveal>

        <section className="atsnSection atsnLegal" aria-label="Privacy policy content">
          <ScrollReveal>
            <h2>1. Information we collect</h2>
            <ul>
              <li>
                <strong>Website information.</strong> When you browse our site, we may collect basic
                usage data (e.g., pages viewed, approximate location derived from IP, device/browser
                details) and cookie-based analytics where enabled.
              </li>
              <li>
                <strong>Contact information.</strong> When you submit forms or email us, we collect
                the information you provide (such as name, company, email address, and message
                contents).
              </li>
              <li>
                <strong>Robotics operational information.</strong> When ARGO is deployed, we may
                collect operational and diagnostic data needed to run, monitor, and improve the
                system (such as uptime, fault logs, route performance, and safety-related events).
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>2. Spatial mapping and camera navigation data</h2>
            <p>
              ARGO may use sensors (which can include depth, lidar, camera, and other perception
              inputs depending on configuration) to localize, navigate, and avoid obstacles. These
              inputs can be processed to generate and update a map of the environment (“spatial
              mapping data”) and to support navigation (“camera navigation data”).
            </p>
            <ul>
              <li>
                <strong>Privacy-first defaults.</strong> ARGO is designed for navigation—not
                identification. By default, we do not enable facial recognition or facial tracking
                features for navigation.
              </li>
              <li>
                <strong>Purpose limitation.</strong> Spatial mapping and camera navigation data are
                used to operate ARGO safely and effectively, to troubleshoot issues, and to improve
                performance and reliability.
              </li>
              <li>
                <strong>Configuration matters.</strong> Data collection and retention may vary based
                on deployment settings, local laws, customer requirements, and the specific hardware
                configuration.
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>3. How we use information</h2>
            <ul>
              <li>Provide, maintain, and improve our website, products, and services.</li>
              <li>Respond to inquiries, schedule demos, and support deployments.</li>
              <li>Monitor performance, reliability, and safety across deployments.</li>
              <li>Detect, prevent, and investigate security incidents, fraud, or misuse.</li>
              <li>Comply with legal obligations and enforce our agreements.</li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>4. Cookies and similar technologies</h2>
            <p>
              We may use cookies and similar technologies to operate our website, remember
              preferences, and understand usage. You can control cookies through your browser
              settings. Some site features may not function properly if cookies are disabled.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <h2>5. How we share information</h2>
            <p>
              We do not sell personal information. We may share information in limited
              circumstances:
            </p>
            <ul>
              <li>
                <strong>Service providers.</strong> Vendors that help us operate the site or support
                deployments (e.g., hosting, analytics, customer support), under contractual
                obligations to protect the data.
              </li>
              <li>
                <strong>Legal and safety.</strong> Where required by law, or to protect rights,
                safety, and security of ATSN, our customers, and the public.
              </li>
              <li>
                <strong>Business transfers.</strong> In connection with a merger, acquisition, or
                sale of assets, subject to appropriate safeguards.
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>6. Data security and retention</h2>
            <p>
              We use reasonable administrative, technical, and organizational safeguards designed to
              protect information. No method of transmission or storage is completely secure, and we
              cannot guarantee absolute security.
            </p>
            <p>
              We retain information only as long as needed for the purposes described in this policy
              (or as otherwise required by law), including maintaining product performance, meeting
              contractual commitments, and resolving disputes.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <h2>7. Your choices and rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or object
              to certain processing of your personal information. To submit a request, contact us
              using the details below.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <h2>8. Contact</h2>
            <p>
              Questions about privacy? Contact ATSN Robotics at{" "}
              <strong>privacy@atsnrobotics.com</strong>.
            </p>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}

