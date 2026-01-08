import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Play,
  MapPin,
  Clock,
  QrCode,
  Shield,
  CreditCard,
  Zap,
  Battery,
  Bell,
  Car,
} from "lucide-react";

import heroImage from "../../assets/hero.png";

/* ---------------- HERO ---------------- */

const HeroSection = ({ onBook, onLogin }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f1a] via-black/80 to-black/40" />

      <div
        className={`relative z-10 min-h-screen flex items-center justify-center text-center px-6 transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="max-w-5xl space-y-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Park Smarter,
            <br />
            <span className="text-sky-400">Not Harder</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Find and book parking spots in real time with dynamic pricing,
            QR-based entry, and zero hassle.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={onBook}
              className="bg-sky-500 hover:bg-sky-400 text-black px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2"
            >
              Book a Slot <ArrowRight size={20} />
            </button>

            <button
              onClick={onLogin}
              className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-xl text-lg flex items-center gap-2 hover:bg-white/20"
            >
              <Play size={20} /> Login
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-9 h-9 rounded-full bg-sky-500/80 border-2 border-[#0b0f1a]"
                />
              ))}
            </div>
            <span>
              Trusted by <strong className="text-white">50,000+</strong> drivers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- QUICK DISCOVERY ---------------- */

const DiscoverySection = () => {
  return (
    <section className="py-28 bg-[#0b0f1a] px-6">
      <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Discover Parking Near You
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Search by city or parking name and instantly see live availability
          on the map.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <input
            type="text"
            placeholder="Search by city"
            className="px-5 py-3 rounded-xl bg-black/60 border border-white/20 text-white w-full md:w-64"
          />
          <input
            type="text"
            placeholder="Search by parking name"
            className="px-5 py-3 rounded-xl bg-black/60 border border-white/20 text-white w-full md:w-64"
          />
          <button className="bg-sky-500 hover:bg-sky-400 text-black px-6 py-3 rounded-xl font-semibold">
            View on Map
          </button>
        </div>

        <div className="mt-6 text-gray-400 text-sm">
          <strong className="text-white">500+</strong> locations live across cities
        </div>
      </div>
    </section>
  );
};

/* ---------------- HOW IT WORKS ---------------- */

const HowItWorks = () => {
  const steps = [
    { icon: MapPin, title: "Find", desc: "Search parking near your destination" },
    { icon: Clock, title: "Book", desc: "Reserve instantly with real-time pricing" },
    { icon: QrCode, title: "Park", desc: "Scan QR and enter without delay" },
  ];

  return (
    <section className="py-28 bg-black px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-14">
          How ParkEase Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8"
            >
              <div className="w-14 h-14 rounded-xl bg-sky-500/20 flex items-center justify-center mb-6 mx-auto">
                <s.icon className="text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {s.title}
              </h3>
              <p className="text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- FEATURES ---------------- */

const FeaturesSection = () => {
  const features = [
    { icon: Shield, title: "Secure Payments" },
    { icon: CreditCard, title: "Wallet & Refunds" },
    { icon: Zap, title: "Dynamic Pricing" },
    { icon: Battery, title: "EV Friendly" },
    { icon: Bell, title: "Smart Alerts" },
    { icon: Car, title: "Seamless Entry" },
  ];

  return (
    <section className="py-32 bg-[#0b0f1a] px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">
          Everything You Need to Park with Ease
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Built for speed, fairness, and zero friction.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-8 hover:shadow-lg hover:shadow-sky-500/10 transition"
          >
            <f.icon className="text-sky-400 mb-4" size={28} />
            <h3 className="text-white font-semibold text-lg">
              {f.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ---------------- TRUST ---------------- */

const TrustSection = () => {
  const stats = [
    { value: "50K+", label: "Drivers" },
    { value: "1M+", label: "Bookings" },
    { value: "500+", label: "Locations" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <section className="py-28 bg-black px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <div className="text-4xl font-bold text-sky-400 mb-2">
              {s.value}
            </div>
            <div className="text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ---------------- FOOTER ---------------- */

const Footer = () => {
  return (
    <footer className="bg-[#0b0f1a] border-t border-white/10 py-16 text-center text-gray-400">
      <p>© 2024 ParkEase. All rights reserved.</p>
    </footer>
  );
};

/* ---------------- HOME ---------------- */

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black">
      <HeroSection
        onBook={() => navigate("/")}
        onLogin={() => navigate("/login")}
      />
      <DiscoverySection />
      <HowItWorks />
      <FeaturesSection />
      <TrustSection />
      <Footer />
    </div>
  );
};

export default Home;
