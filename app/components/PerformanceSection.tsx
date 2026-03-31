export function PerformanceSection() {
  return (
    <section
      className="performanceSection"
      id="performance"
      aria-labelledby="performance-heading"
    >
      <div className="performanceSection__inner">
        <p className="performanceSection__eyebrow">Engineering</p>
        <h2 className="performanceSection__title" id="performance-heading">
          Performance
        </h2>
        <div className="performanceSection__body">
          <p>
            Our platforms are built for sustained operation in real venues: efficient
            motion planning, responsive perception, and power profiles tuned for long
            duty cycles—not demo-day bursts.
          </p>
          <p>
            On-device intelligence keeps latency low for navigation and human
            interaction, while fleet-ready telemetry helps you monitor uptime, route
            efficiency, and health across deployments.
          </p>
        </div>
      </div>
    </section>
  );
}
