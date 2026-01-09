import { ShieldCheck, Users, MapPin, Activity } from "lucide-react";

const stats = [
  {
    value: "50K+",
    label: "Active Drivers",
    icon: Users,
    desc: "Drivers trust ParkEase every day for stress-free parking.",
  },
  {
    value: "1M+",
    label: "Successful Bookings",
    icon: Activity,
    desc: "Bookings completed without delays or entry issues.",
  },
  {
    value: "500+",
    label: "Parking Locations",
    icon: MapPin,
    desc: "Verified locations across major cities and hubs.",
  },
  {
    value: "99.9%",
    label: "Platform Uptime",
    icon: ShieldCheck,
    desc: "Reliable infrastructure with near-zero downtime.",
  },
];

const TrustSection = () => {
  return (
    <section className="relative py-32 bg-[#070b14] px-6 overflow-hidden">
      {/* background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[140px] rounded-full" />

      <div className="relative max-w-7xl mx-auto">
        {/* heading */}
        <div className="text-center mb-20">
          <p className="text-sky-400 text-sm font-medium mb-3 tracking-wide">
            Trusted at scale
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            Proven by Real-World Usage
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-base md:text-lg">
            ParkEase is used daily by thousands of drivers and parking operators
            across cities.
          </p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className="group relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition"
            >
              {/* icon */}
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-5 mx-auto group-hover:bg-sky-500/30 transition">
                <s.icon className="text-sky-400 w-6 h-6" />
              </div>

              {/* value */}
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {s.value}
              </div>

              {/* label */}
              <div className="text-gray-300 text-sm font-medium mb-2">
                {s.label}
              </div>

              {/* description */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {s.desc}
              </p>

              {/* hover accent */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-sky-400/20 transition" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
