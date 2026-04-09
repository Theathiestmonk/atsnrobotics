"use client";

import { BlurText } from "../components/BlurText";
import { ScrollReveal } from "../components/ScrollReveal";

export function Terms() {
  const effectiveDate = "April 6, 2026";

  return (
    <main className="atsnPage">
      <div className="atsnContainer atsnHero" style={{ position: "relative" }}>
        <p className="atsnHero__eyebrow">Legal</p>
        <BlurText text="Terms & Conditions" as="h1" className="atsnHero__title" />
        <ScrollReveal>
          <p className="atsnHero__lead">
            Effective date: {effectiveDate}. These Terms & Conditions (“Terms”) govern your access
            to and use of ATSN Robotics products and services, including ARGO hardware, onboard and
            fleet software, documentation, and related services (collectively, the “Products”).
            By using the Products, you agree to these Terms.
          </p>
        </ScrollReveal>

        <section className="atsnSection atsnLegal" aria-label="Terms content">
          <ScrollReveal>
            <h2>1. Eligibility and authority</h2>
            <p>
              You represent that you are at least the age of majority in your jurisdiction and that
              you have authority to bind the organization deploying or operating the Products. If
              you are using the Products on behalf of an organization, that organization is
              responsible for your acts and omissions.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <h2>2. Hardware use and care</h2>
            <ul>
              <li>
                <strong>Intended use.</strong> ARGO is designed for goods movement and related
                operational workflows in commercial environments. You agree to use ARGO only as
                intended and in accordance with provided documentation and training materials.
              </li>
              <li>
                <strong>Environment readiness.</strong> You are responsible for ensuring the
                deployment environment is reasonably safe and suitable, including clear operating
                pathways, signage where appropriate, and compliance with venue rules.
              </li>
              <li>
                <strong>No tampering.</strong> You may not open, modify, bypass safety mechanisms,
                or otherwise tamper with hardware, sensors, or firmware. Unauthorized modification
                may void warranties and create safety risks.
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>3. Autonomous operations and safety disclaimer</h2>
            <p>
              Autonomous systems operate in dynamic environments and cannot anticipate every
              scenario. You acknowledge and agree:
            </p>
            <ul>
              <li>
                ARGO may slow, stop, reroute, or request assistance when conditions exceed safe
                operating assumptions.
              </li>
              <li>
                You are responsible for establishing appropriate supervision, escalation procedures,
                and restricted areas (if any) based on your venue and applicable laws.
              </li>
              <li>
                ATSN does not guarantee uninterrupted or error-free autonomous operation under all
                conditions, including extreme crowd density, obstructions, connectivity issues, or
                changes to the environment.
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>4. Software license and restrictions</h2>
            <p>
              Subject to these Terms and any applicable order form or enterprise agreement, ATSN
              grants you a limited, non-exclusive, non-transferable, revocable license to use the
              software solely with the Products and for your internal business purposes.
            </p>
            <ul>
              <li>
                <strong>Restrictions.</strong> You may not reverse engineer, decompile, modify, or
                create derivative works of the software except to the extent such restriction is
                prohibited by law. You may not remove or alter proprietary notices.
              </li>
              <li>
                <strong>Updates.</strong> ATSN may provide updates, patches, or configuration changes
                to improve performance, reliability, or security. Some updates may be required for
                continued use.
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>5. Acceptable use</h2>
            <ul>
              <li>Do not use the Products to violate laws, infringe rights, or threaten safety.</li>
              <li>
                Do not use the Products to collect or attempt to collect sensitive personal
                information in a way that violates applicable law or your own posted policies.
              </li>
              <li>
                Do not interfere with security controls, telemetry, or safety-related diagnostics.
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal>
            <h2>6. Warranty, limitation of liability, and indemnity</h2>
            <p>
              Except as expressly provided in a written agreement with ATSN, the Products are
              provided “as is” and “as available.” To the maximum extent permitted by law, ATSN
              disclaims all warranties, express or implied, including merchantability, fitness for a
              particular purpose, and non-infringement.
            </p>
            <p>
              To the maximum extent permitted by law, ATSN will not be liable for indirect,
              incidental, special, consequential, or punitive damages, or for lost profits, lost
              revenue, or business interruption arising out of or related to the Products.
            </p>
            <p>
              You agree to indemnify and hold harmless ATSN from claims arising from your
              deployment, configuration, or use of the Products in violation of these Terms or
              applicable law.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <h2>7. Termination</h2>
            <p>
              We may suspend or terminate access to software services if we reasonably believe the
              Products are being used unsafely, unlawfully, or in breach of these Terms. Upon
              termination, the software license granted to you ends, and you must discontinue use of
              the software.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <h2>8. Contact</h2>
            <p>
              Questions about these Terms? Contact ATSN Robotics at{" "}
              <strong>legal@atsnrobotics.com</strong>.
            </p>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}

