import { getImageProps } from "next/image";
import styles from "./HeroCover.module.css";

export default function HeroCover() {
  // Art direction: portrait crop for phones, wide lineup for desktop
  const common = { alt: "", fill: true, priority: true };
  const {
    props: { srcSet: mobile },
  } = getImageProps({ ...common, src: "/hero-cover-mobile-v2.webp", sizes: "100vw", quality: 80 });
  const { props: desktop } = getImageProps({ ...common, src: "/hero-cover-v3.webp", sizes: "100vw" });

  return (
    <section className={styles.hero} aria-label="Hero">

      <picture>
        <source media="(max-width: 767px)" srcSet={mobile} />
        <img {...desktop} alt="" className={styles.heroImage} />
      </picture>

      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.headline}>
            <span className={styles.headlineItalic}>THAMRA</span>
          </h1>

          <p className={styles.description}>
            ქალის თმის ჯანმრთელობაზე ზრუნვა
          </p>

          <a href="/quiz" className={styles.cta}>
            <span className={styles.ctaMain}>გაიგე რა სჭირდება შენს თმას →</span>
            <span className={styles.ctaSub}>2წთ.</span>
          </a>
        </div>
      </div>
    </section>
  );
}
