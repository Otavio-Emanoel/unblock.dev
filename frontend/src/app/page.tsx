import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/landing/Hero";
import { RoomPreviewMockup } from "@/components/landing/RoomPreviewMockup";
import { BugShowcase } from "@/components/landing/BugShowcase";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { CostCalculator } from "@/components/landing/CostCalculator";
import { Testimonials } from "@/components/landing/Testimonials";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { ParticleBackground } from "@/components/landing/ParticleBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col selection:bg-indigo-600 selection:text-white overflow-x-hidden relative">
      {/* Interactive Particle & Network Constellation Background */}
      <ParticleBackground />

      {/* Glassmorphism Sticky Navbar */}
      <Header />

      {/* Main Landing Flow */}
      <main className="flex-1 space-y-8 sm:space-y-16 relative z-10">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Interactive Workspace Simulator Preview */}
        <section className="px-4 sm:px-6 -mt-8 relative z-10">
          <RoomPreviewMockup />
        </section>

        {/* 3. Real-World Bug Fixes & Code Diffs */}
        <BugShowcase />

        {/* 4. Asymmetrical Bento Grid Features */}
        <FeaturesGrid />

        {/* 5. How It Works Pipeline */}
        <HowItWorks />

        {/* 6. Interactive Cost & ROI Calculator */}
        <CostCalculator />

        {/* 7. Flexible Credit Packages */}
        <PricingPlans />

        {/* 8. Wall of Love / Testimonials */}
        <Testimonials />

        {/* 9. Animated FAQ Accordion */}
        <FaqSection />

        {/* 10. Call to Action Finale */}
        <CtaSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
