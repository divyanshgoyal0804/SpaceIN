import styles from './HowItWorksAndWhyUs.module.css';

const stats = [
  { value: '200K+', label: 'SQFT TRANSACTED' },
  { value: '150+', label: 'CLIENTS PLACED' },
  { value: '180+', label: 'ACTIVE LISTINGS' },
  { value: '5', label: 'YEARS IN NOIDA' },
];

const steps = [
  {
    number: '01',
    title: 'Tell our AI',
    description: 'Describe your need in plain words. Size, sector, budget, timeline — anything you know.',
  },
  {
    number: '02',
    title: 'Curated shortlist',
    description: 'Within hours, receive 3–5 hand-matched options with full commercials and floor plans.',
  },
  {
    number: '03',
    title: 'Site visits & negotiation',
    description: 'We arrange tours, negotiate the lease, run legal due diligence on your behalf.',
  },
  {
    number: '04',
    title: 'Move in',
    description: 'Handover, fit-out coordination and amenity setup — keys handed over, ready to operate.',
  },
];

export default function HowItWorksAndWhyUs() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Left Sidebar - Why Us */}
        <div className={styles.leftSidebar}>
          <div className={styles.eyebrow}>03 WHY US</div>
          <h2 className={styles.title}>
            The advantage of an <span className={styles.titleAccent}>insider</span>, the speed of AI.
          </h2>
          <p className={styles.description}>
            We've spent a decade building Noida's deepest live inventory database — now paired with AI that understands your brief and matches it instantly.
          </p>

          <div className={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <div key={idx} className={styles.statCard}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - How it Works */}
        <div className={styles.rightSidebar}>
          <div className={styles.eyebrow} style={{ marginBottom: '2.5rem' }}>HOW IT WORKS</div>
          <div className={styles.stepsList}>
            {steps.map((step) => (
              <div key={step.number} className={styles.stepItem}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
