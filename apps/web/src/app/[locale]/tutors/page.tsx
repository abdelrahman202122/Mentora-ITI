"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

type Tutor = {
  id: number;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
};

export default function TutorsList() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    const getTutors = async () => {
      const response = await fetch("/data/tutors.json");
      const data = await response.json();
      setTutors(data);
    };

    getTutors();
  }, []);

  // 👇 تغيير اللغة
  function changeLang(lang: "en" | "ar") {
    const segments = pathname.split("/");

    // الجزء الأول بعد /
    segments[1] = lang;

    router.push(segments.join("/"));
  }

  return (
    <>
      {/* زرار اللغة */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => changeLang("en")}>
          English
        </button>

        <button
          onClick={() => changeLang("ar")}
          style={{ marginLeft: "10px" }}
        >
          العربية
        </button>
      </div>

      {/* الداتا */}
      {tutors.map((tutor) => (
        <div key={tutor.id}>
          <h2>{tutor.title[locale as "en" | "ar"]}</h2>

          <p>{tutor.description[locale as "en" | "ar"]}</p>
        </div>
      ))}
    </>
  );
}