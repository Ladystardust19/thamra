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
        // Hide the left details panel (host name "Nino Jakeli", event title,
        // duration) — she's already on the result page, so it's redundant and
        // makes the embed noticeably shorter/narrower.
        hideEventTypeDetails: true,
        layout: "month_view",
        styles: { branding: { brandColor: "#8B2F3A" } },
      });
    })();
  }, []);

  return (
    <div className={styles.calEmbedWrap}>
      <Cal
        calLink={CAL_LINK}
        style={{ width: "100%" }}
        // theme must be set here too — the "ui" config alone doesn't stop the
        // embed from following the system's dark preference.
        config={{ layout: "month_view", theme: "light" }}
      />
    </div>
  );
}
