import Footer from '@/components/home/Footer';
import GradeLevels from '@/components/home/GradeLevels';
import Header from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import HowItWorks from '@/components/home/HowItWorks';
import Reviews from '@/components/home/Reviews';
import StartLearning from '@/components/home/StartLearning';
import SubjectSection from '@/components/home/SubjectsSection';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <SubjectSection />
      <GradeLevels />
      <HowItWorks />
      <Reviews />
      <StartLearning />
      <Footer />
    </>
  );
}
