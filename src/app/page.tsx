import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Advantages from "@/components/Advantages";
import Catalog from "@/components/Catalog";
import Infrastructure from "@/components/Infrastructure";
import MortgageCalculator from "@/components/MortgageCalculator";
import Reviews from "@/components/Reviews";
import Steps from "@/components/Steps";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Advantages />
        <Catalog />
        <Infrastructure />
        <MortgageCalculator />
        <Reviews />
        <Steps />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
