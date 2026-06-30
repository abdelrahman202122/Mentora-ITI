"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Atom, BookOpen, FlaskConical, Pill, Triangle, Users } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { y: 12, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
};

const subjects = [
  { key: "sociology", icon: Users },
  { key: "english", icon: BookOpen },
  { key: "history", icon: Triangle },
  { key: "mathematics", icon: Atom },
  { key: "chemistry", icon: FlaskConical },
  { key: "biology", icon: Pill },
] as const;

export default function ProfessionalSubjectsSection() {
  const t = useTranslations("home.subjects");

  const autoplay = React.useMemo(
    () =>
      Autoplay({
        delay: 3500,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    [],
  );

  return (
    <motion.section
      id="subjects"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="overflow-hidden bg-white px-6 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          variants={itemVariants}
          className="mb-14 text-center text-3xl font-semibold tracking-tight text-slate-900"
        >
          {t("title")} <span className="text-indigo-600">{t("titleHighlight")}</span>
        </motion.h2>

        <motion.div variants={itemVariants} className="relative mb-20 px-4">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[autoplay]}
            className="w-full"
          >
            <CarouselContent>
              {subjects.map((subject) => (
                <CarouselItem
                  key={subject.key}
                  className="basis-1/2 md:basis-1/4 lg:basis-1/6"
                >
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors duration-200 hover:border-indigo-200 hover:bg-indigo-50">
                      <subject.icon className="size-8 text-indigo-600" />
                    </div>
                    <span className="text-center font-semibold text-slate-700">
                      {t(subject.key)}
                    </span>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-3 bg-white/95" />
            <CarouselNext className="-right-3 bg-white/95" />
          </Carousel>
        </motion.div>
      </div>
    </motion.section>
  );
}
