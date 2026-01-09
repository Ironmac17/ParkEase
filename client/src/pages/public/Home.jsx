import { useNavigate } from "react-router-dom";
import Hero from "../../components/LandingPage/Hero"
import Working from "../../components/LandingPage/Working"
import Features from "../../components/LandingPage/Features"
import TrustSection from "../../components/LandingPage/TrustSection"
import Footer from "../../components/LandingPage/Footer"

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black">
      <Hero
        onBook={() => navigate("/")}
        onLogin={() => navigate("/login")}
      />
      <TrustSection />
      <Working />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;
