import Header from '../../components/home/Header';
import Hero from '../../components/home/Hero';
import SubjectSection from '../../components/home/SubjectsSection';
import GradeLevels from '../../components/home/GradeLevels';
import HowItWorks from '../../components/home/HowItWorks';
import Reviews from '../../components/home/Reviews';

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
