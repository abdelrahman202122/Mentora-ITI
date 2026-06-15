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
   const [error, setError] = useState<string | null>(null);

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const validLocale = (locale === "en" || locale === "ar") ? locale : "en";
  useEffect(() => {
    const getTutors = async () => {
      try {
        const response = await fetch("/data/tutors.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTutors(data);
      } catch (err) {
        console.error("Failed to load tutors:", err);
        setError(err instanceof Error ? err.message : "Failed to load tutors");
      }
    };

    getTutors();
  }, []);

  function changeLang(lang: "en" | "ar") {
    const segments = pathname.split("/");

    segments[1] = lang;

    router.push(segments.join("/"));
  }

  return (
    <> 
      {error && <div style={{ color: "red" }}>{error}</div>}
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
          <h2>{tutor.title[validLocale]}</h2>
          <p>{tutor.description[validLocale]}</p>
        </div>
      ))}
    </>
  );
}