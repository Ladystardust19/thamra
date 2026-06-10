import styles from "./HeroCover.module.css";

export default function HeroCover() {
  return (
    <section className={styles.hero} aria-label="Hero">
      {/* Gradient tint: strong on the left for text legibility,
          fades to near-nothing on the right to keep her face vivid */}
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.headline}>
            <span className={styles.headlineItalic}>THAMRA</span>
            <br />
            თმის სილამაზე იწყება შიგნიდან
          </h1>

          <p className={styles.description}>
            უნიკალური ფორმულა{" "}
            <em>Advanced Hair Biomatrix™</em> ქალებისთვის შექმნილი თმის ზრდის,
            ბუნებრივი მოცულობისა და ბრწყინვალების ხანგრძლივი მხარდაჭერისთვის
            ასაკობრივი და ჰორმონალური ცვლილებების პერიოდში.
          </p>

          <a href="#shop" className={styles.cta}>
            შეიძინე Thamra
          </a>
        </div>
      </div>
    </section>
  );
}
