import Image from "next/image";
import styles from "./HeroCover.module.css";

export default function HeroCover() {
  return (
    <section className={styles.hero} aria-label="Hero">

      <Image
        src="/hero-cover.webp"
        alt=""
        fill
        priority
        style={{ objectFit: "cover", objectPosition: "center center" }}
        sizes="100vw"
      />

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.headline}>
            <span className={styles.headlineItalic}>THAMRA</span>
          </h1>

          <p className={styles.description}>
            გინეკოლოგის 40-წლიანი გამოცდილებით შექმნილი უნიკალური საკვები დანამატი — მენოპაუზის პერიოდში ქალის თმის ჯანმრთელობაზე ზრუნვისთვის.
          </p>

          <a href="/quiz" className={styles.cta}>
            <span className={styles.ctaMain}>გაიგე რა სჭირდება შენს თმას →</span>
            <span className={styles.ctaSub}>2წთ.</span>
          </a>
          <p style={{ fontSize: 13, color: "#8A7E79", marginTop: 12 }}>
            500+ ქალმა უკვე გაიარა ტესტი
          </p>
        </div>
      </div>
    </section>
  );
}
