import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Advantages from "@/components/Advantages";
import Catalog from "@/components/Catalog";
import BanksRow from "@/components/BanksRow";
import Infrastructure from "@/components/Infrastructure";
import MortgageCalculator from "@/components/MortgageCalculator";
import Reviews from "@/components/Reviews";
import Steps from "@/components/Steps";
import FAQ from "@/components/FAQ";
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
        <BanksRow />
        <Infrastructure />
        <MortgageCalculator />
        <Reviews />
        <Steps />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
