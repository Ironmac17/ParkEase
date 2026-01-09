import React, { useEffect, useState } from "react";
import { ArrowRight, Play, MapPin, Clock, Shield } from "lucide-react";
import heroImage from "../../assets/hero.png";

const Hero = ({ onBook, onLogin }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#0d132122] overflow-hidden pt-10 pb-5">
      {/* background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* overlays */}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/0 via-black/70 to-[#070b14]" />

      {/* subtle glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-sky-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />

      {/* content */}
      <div
        className={`relative z-10 min-h-screen flex items-center justify-center px-6 transition-all duration-700 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-6xl w-full text-center space-y-10">
          {/* headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Park smarter.
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Move faster.
            </span>
          </h1>

          {/* description */}
          <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Discover, reserve, and access parking instantly with live
            availability, dynamic pricing, and QR-based entry.
          </p>

          {/* actions */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={onBook}
              className="group bg-sky-500 hover:bg-sky-400 text-black px-9 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 transition"
            >
              Book a Slot
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition"
              />
            </button>

            <button
              onClick={onLogin}
              className="bg-white/10 backdrop-blur border border-white/20 text-white px-9 py-4 rounded-xl text-lg flex items-center justify-center gap-3 hover:bg-white/20 transition"
            >
              <Play size={20} />
              Login
            </button>
          </div>

          {/* stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-10">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
              <Clock className="text-sky-400 mb-3 mx-auto" />
              <p className="text-2xl font-bold text-white">30s</p>
              <p className="text-gray-400 text-sm">
                average booking time
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
              <Shield className="text-sky-400 mb-3 mx-auto" />
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-gray-400 text-sm">
                secure access control
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
              <MapPin className="text-sky-400 mb-3 mx-auto" />
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-gray-400 text-sm">
                parking locations
              </p>
            </div>
          </div>

          {/* social proof */}
          <div className="flex items-center justify-center gap-4 pt-6 text-gray-400 text-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-400 border-2 border-[#070b14]"
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

export default Hero;
