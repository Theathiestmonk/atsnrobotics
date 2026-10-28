import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found | ATSN Robotics",
  description: "This page could not be found. Explore ATSN Robotics and the ARGO fleet.",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="not-found-title">
        <div className={styles.copy}>
          <p className={styles.code} aria-label="Error 404">
            4<span>0</span>4
          </p>
          <h1 className={styles.title} id="not-found-title">
            Looks like we took a wrong turn.
          </h1>
          <p className={styles.description}>
            The page you’re looking for isn’t here. Let’s get you back on the right route.
          </p>
          <div className={styles.actions}>
            <Link className={styles.homeLink} href="/">
              Back to home <span aria-hidden="true">→</span>
            </Link>
            <Link className={styles.productsLink} href="/products">
              Explore our robots
            </Link>
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.orbit} />
          <div className={styles.orbitInner} />
          <span className={styles.visualLabel}>Searching for signal</span>
          <Image
            className={styles.robot}
            src="/argo_uno_upscaled_2x_file_size__1_-removebg-preview.png"
            alt=""
            width={408}
            height={612}
            priority
            sizes="(max-width: 760px) 65vw, 360px"
          />
          <span className={styles.signal} />
        </div>
      </section>
    </main>
  );
}
