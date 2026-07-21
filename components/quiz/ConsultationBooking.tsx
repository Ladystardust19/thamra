"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import styles from "./Quiz.module.css";

// Cal.com event: cal.com/nino-jakeli-6n15cy/thamra-hair-consultation
const CAL_LINK = "nino-jakeli-6n15cy/thamra-hair-consultation";

export default function ConsultationBooking() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#8B2F3A" } },
      });
    })();
  }, []);

  return (
    <div className={styles.calEmbedWrap}>
      <Cal
        calLink={CAL_LINK}
        style={{ width: "100%" }}
        config={{ layout: "month_view" }}
      />
    </div>
  );
}
