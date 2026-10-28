import Image from "next/image";
import Link from "next/link";
import styles from "./RobotProductPage.module.css";

type RobotProductPageProps = {
  model: string;
  eyebrow: string;
  status: string;
  headline: string;
  introduction: string;
  imageSrc: string;
  imageAlt: string;
  emphasizeImage?: boolean;
  detailTitle: string;
  detail: string;
  nextHref: string;
  nextLabel: string;
};

export function RobotProductPage({
  model,
  eyebrow,
  status,
  headline,
  introduction,
  imageSrc,
  imageAlt,
  emphasizeImage = false,
  detailTitle,
  detail,
  nextHref,
  nextLabel,
}: RobotProductPageProps) {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="product-title">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title} id="product-title">
            {headline}
          </h1>
          <p className={styles.introduction}>{introduction}</p>
          <div className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            {status}
          </div>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/contact">
              Talk to our team <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.secondaryAction} href={nextHref}>
              {nextLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <Image
            className={`${styles.robotImage}${emphasizeImage ? ` ${styles.robotImageEmphasized}` : ""}`}
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 760px) 90vw, 52vw"
          />
          <span className={styles.visualLabel}>{model}</span>
        </div>
      </section>

      <section className={styles.details} aria-labelledby="detail-title">
        <div>
          <p className={styles.eyebrow}>About {model}</p>
          <h2 className={styles.detailTitle} id="detail-title">{detailTitle}</h2>
        </div>
        <div className={styles.detailCopy}>
          <p>{detail}</p>
          <dl className={styles.facts}>
            <div>
              <dt>Model</dt>
              <dd>{model}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{status}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}