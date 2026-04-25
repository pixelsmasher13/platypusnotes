import { useEffect, useState } from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { SecondShowcase } from "./components/SecondShowcase";
import { MeetingPlatforms } from "./components/MeetingPlatforms";
import { FAQ } from "./components/FAQ";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { Privacy } from "./components/Privacy";

function getRoute(): string {
  return window.location.hash.replace(/^#\/?/, "") || "home";
}

export default function App() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    const onChange = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  if (route === "privacy") {
    return (
      <>
        <Privacy />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Hero />
      <Features />
      <SecondShowcase />
      <MeetingPlatforms />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
