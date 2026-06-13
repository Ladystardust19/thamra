import styles from "./HeroCover.module.css";

export default function HeroCover() {
  return (
    <section className={styles.hero} aria-label="Hero">

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.headline}>
            <span className={styles.headlineItalic}>THAMRA</span>
          </h1>

          <p className={styles.description}>
            გინეკოლოგის 40-წლიანი გამოცდილებით შექმნილი უნიკალური საკვები დანამატი — მენოპაუზის პერიოდში ქალის თმის ჯანმრთელობაზე ზრუნვას აერთიანებს ერთ გააზრებულ ყოველდღიურ კომპლექსში.
          </p>

          <a href="/quiz" className={styles.cta}>
            <span className={styles.ctaMain}>გაიგე რა სჭირდება შენს თმას</span>
            <span className={styles.ctaSub}>2წთ.</span>
          </a>
        </div>
      </div>
    </section>
  );
}
