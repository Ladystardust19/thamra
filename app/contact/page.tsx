import type { Metadata } from "next";
import PolicyShell, { ContactBlock } from "@/components/PolicyShell";

export const metadata: Metadata = {
  title: "დაგვიკავშირდი | Thamra",
  description:
    "შეკვეთის, მიწოდების, დაბრუნების ან სხვა საკითხებთან დაკავშირებით დაუკავშირდი THAMRA-ს — ტელეფონით ან ელ. ფოსტით.",
};

export default function ContactPage() {
  return (
    <PolicyShell
      title="დაგვიკავშირდი"
      intro="შეკვეთის, მიწოდების, დაბრუნების ან სხვა საკითხებთან დაკავშირებით დაუკავშირდი THAMRA-ს."
    >
      <ContactBlock />
    </PolicyShell>
  );
}
