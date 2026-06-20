"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Mr.Moataz", subject: "Physics", review: "My son has advanced a lot in both chemistry and Physics." },
  { name: "Ms.Ghada", subject: "German", review: "Miss Ghada is one of the best German teachers I have dealt with." },
  { name: "Ms.Marihan", subject: "Arabic", review: "Great teacher. My child loves Arabic because of her." },
  { name: "Ms.Farida", subject: "French", review: "Amazing experience and very supportive tutor for my daughter." },
];

export default function Reviews() {
  return (
    <section className="py-20 px-6 bg-indigo-50"> {/* لون الخلفية الكريمي */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">What our clients say!</h2>
        
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {testimonials.map((item, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-4">
                <motion.div whileHover={{ y: -5 }}>
                  <Card className="border-none shadow-lg h-[200px] rounded-3xl">
                    <CardContent className="flex flex-col items-center text-center p-8">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <h3 className="font-bold text-lg mb-2">{item.subject} - {item.name}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.review}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}