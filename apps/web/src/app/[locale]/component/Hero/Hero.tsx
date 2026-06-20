import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search } from "lucide-react"
import Image from "next/image"
import heroImage from "../../../../../public/Hero.jpg"

export default function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between gap-12 px-6 py-16 lg:px-20">
      {/* Left Content */}
      <div className="flex-1 space-y-6">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">
          EDUCATION EVOLVED
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          Find the perfect mentor for your needs
        </h1>
        <p className="text-lg text-slate-600 max-w-lg">
          Whether you want to browse our expert community or let our AI find your perfect match, your learning journey starts here.
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input 
            className="pl-10 pr-16 h-14 rounded-xl border-slate-200" 
            placeholder="Let our AI assistant find the perfect tutor for you" 
          />
          <Button className="absolute right-1 top-1 h-12 w-12 rounded-lg bg-indigo-600 hover:bg-indigo-700">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
          <span className="text-sm font-medium text-slate-700">1,200+ experts ready to help</span>
        </div>
      </div>

      {/* Right Image Container */}
      <div className="flex-1 w-full max-w-xl">
        <div className="relative rounded-3xl bg-slate-200 p-8 shadow-inner">
          {/* Mockup for the illustration in image_dc8fe9.png */}
          <div className="relative aspect-video bg-white rounded-xl shadow-lg overflow-hidden">
            <Image
              src={heroImage}
              alt="Hero"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 576px"
              priority
            />
          </div>
          {/* Floating Badge */}
          <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-[150px] ">
            <p className="font-bold text-xs flex items-center gap-1 text-indigo-600">
              ✓ Verified Experts
            </p>
            <p className="text-xs text-slate-500 mt-1">Mentora Helps you to Catch Your Dream Job</p>
          </div>
        </div>
      </div>
    </section>
  )
}