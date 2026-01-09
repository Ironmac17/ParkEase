import {
  MapPin,
  Clock,
  QrCode,
  Shield,
  CreditCard,
  Zap,
} from "lucide-react";

const Working = () => {
  const steps = [
    {
      icon: MapPin,
      title: "Find Parking",
      desc: "Discover nearby parking spots with live availability, filters, and map-based search.",
      points: ["Live spot availability", "Smart location search", "Verified parking lots"],
    },
    {
      icon: Clock,
      title: "Book Instantly",
      desc: "Reserve your spot in seconds with transparent pricing and flexible timing.",
      points: ["Real-time pricing", "No hidden charges", "Instant confirmation"],
    },
    {
      icon: QrCode,
      title: "Park & Go",
      desc: "Scan your QR code at entry and exit. No tickets. No waiting.",
      points: ["QR-based access", "Zero manual checks", "Automatic checkout"],
    },
  ];

  const features = [
    { icon: Shield, text: "Secure & monitored locations" },
    { icon: CreditCard, text: "Multiple payment options" },
    { icon: Zap, text: "Fast booking under 30 seconds" },
  ];

  return (
    <section className="relative py-28 bg-[#070b14] px-6 overflow-hidden">
      {/* background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-sky-500/10 blur-[140px] rounded-full" />

      <div className="relative max-w-7xl mx-auto">
        {/* header */}
        <div className="text-center mb-24">
          <p className="text-sky-400 font-medium mb-4 tracking-wide">
            Simple. Fast. Reliable.
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How ParkEase Works
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            From searching a spot to driving away, everything is designed to
            save time, reduce stress, and keep your journey smooth.
          </p>
        </div>

        {/* steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mb-24">
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-10 text-center hover:bg-white/10 transition"
            >
              {/* step number */}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 text-black text-sm font-semibold px-4 py-1 rounded-full">
                Step {i + 1}
              </span>

              {/* icon */}
              <div className="w-16 h-16 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-8 mx-auto">
                <s.icon className="text-sky-400 w-8 h-8" />
              </div>

              <h3 className="text-2xl font-semibold text-white mb-4">
                {s.title}
              </h3>

              <p className="text-gray-400 mb-6">
                {s.desc}
              </p>

              <ul className="space-y-3 text-gray-300 text-sm">
                {s.points.map((p, idx) => (
                  <li key={idx} className="flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* supporting features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <f.icon className="text-sky-400" />
              </div>
              <p className="text-gray-300">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Working;
