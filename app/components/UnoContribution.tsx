import Image from "next/image";
import styles from "./UnoContribution.module.css";

type UnoContributionProps = {
  paymentUrl?: string;
  qrCodeSrc?: string;
};

export function UnoContribution({ paymentUrl, qrCodeSrc }: UnoContributionProps) {
  return (
    <section className={styles.section} aria-labelledby="uno-contribution-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Be part of what comes next</p>
        <h2 className={styles.title} id="uno-contribution-title">
          Help bring Argo Uno to life.
        </h2>
        <p className={styles.description}>
          We’re building the next addition to the ARGO fleet. If you’d like to support Argo Uno’s
          development, you’ll be able to contribute securely through Razorpay.
        </p>
        {paymentUrl ? (
          <a className={styles.action} href={paymentUrl} target="_blank" rel="noopener noreferrer">
            Contribute securely <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <div className={styles.actionPending} role="status">
            <span className={styles.pendingDot} aria-hidden="true" />
            Contributions opening soon
          </div>
        )}
        <p className={styles.note}>
          {paymentUrl
            ? "Your contribution supports Argo Uno development."
            : "Secure Razorpay payments will be available once setup is complete."}
        </p>
      </div>

      <div className={styles.qrPanel}>
        {qrCodeSrc ? (
          <div className={styles.qrImageFrame}>
            <Image
              className={styles.qrImage}
              src={qrCodeSrc}
              alt="Scan to contribute to Argo Uno through Razorpay"
              width={220}
              height={220}
            />
            {paymentUrl ? (
              <a
                className={styles.qrImageLink}
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Razorpay contribution page"
              />
            ) : null}
          </div>
        ) : (
          <div className={styles.qrPlaceholder} aria-label="Razorpay contribution QR code coming soon">
            <span className={styles.qrIcon} aria-hidden="true">
              <span />
            </span>
            <span className={styles.qrTitle}>Razorpay QR</span>
            <span className={styles.qrNote}>Available soon</span>
          </div>
        )}
      </div>
    </section>
  );
}
