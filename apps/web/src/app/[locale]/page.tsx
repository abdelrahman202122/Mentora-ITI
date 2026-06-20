import { Button } from '@/components/ui/button';
import Header from './component/Header/Header';
import Hero from './component/Hero/Hero';
import SubjectSection from './component/SubjectsSection/SubjectsSection';
import GradeLevels from './component/GradeLevels/GradeLevels';
import HowItWorks from './component/HowItWorks/HowItWorks';
import Reviews from './component/Reviews/Reviews';

export default function Home() {
  return (
    <>
    <Header />
    <Hero />
    <SubjectSection />
    <GradeLevels />
    <HowItWorks />
    <Reviews />
    </>
  );
}
