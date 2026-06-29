"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonialKeys = [
  { nameKey: "review1Name", subjectKey: "review1Subject", textKey: "review1Text" },
  { nameKey: "review2Name", subjectKey: "review2Subject", textKey: "review2Text" },
  { nameKey: "review3Name", subjectKey: "review3Subject", textKey: "review3Text" },
  { nameKey: "review4Name", subjectKey: "review4Subject", textKey: "review4Text" },
] as const;

export default function Reviews() {
  const t = useTranslations("home.reviews");

  const autoplay = React.useMemo(
    () =>
      Autoplay({
        delay: 4500,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    [],
  );

  return (
    <section id="testimonials" className="bg-indigo-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-14 text-center text-3xl font-semibold text-slate-900">
          {t("title")}
        </h2>

        <Carousel opts={{ align: "start", loop: true }} plugins={[autoplay]} className="w-full">
          <CarouselContent>
            {testimonialKeys.map((item) => (
              <CarouselItem key={item.nameKey} className="p-4 md:basis-1/2 lg:basis-1/3">
                <motion.div whileHover={{ y: -3 }}>
                  <Card className="flex min-h-[220px] flex-col justify-center rounded-xl border border-indigo-100 shadow-none sm:min-h-[200px]">
                    <CardContent className="flex flex-col items-center p-8 text-center">
                      <div className="mb-4 flex gap-1" aria-label="5 out of 5 stars">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className="size-5 fill-yellow-400 text-yellow-400"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <h3 className="mb-2 text-lg font-bold">
                        {t(item.subjectKey)} - {t(item.nameKey)}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {t(item.textKey)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 bg-white/95" />
          <CarouselNext className="-right-3 bg-white/95" />
        </Carousel>
      </div>
    </section>
  );
}
