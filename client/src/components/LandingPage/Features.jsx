import {
  Clock,
  Shield,
  QrCode,
  CreditCard,
  Zap,
  Battery,
  MapPin,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Real-Time Availability",
    description:
      "View live parking spot status and reserve instantly with guaranteed availability.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description:
      "Pay safely using cards, UPI, or wallet with encrypted, secure transactions.",
  },
  {
    icon: QrCode,
    title: "QR Entry & Exit",
    description:
      "Skip queues with contactless QR-based entry and exit at parking gates.",
  },
  {
    icon: CreditCard,
    title: "Digital Wallet",
    description:
      "Top up once and pay everywhere. Instant refunds and smooth checkout.",
  },
  {
    icon: Zap,
    title: "Dynamic Pricing",
    description:
      "Smart pricing adapts to demand, time, and availability for best rates.",
  },
  {
    icon: Battery,
    title: "EV Charging",
    description:
      "Find and reserve EV charging spots with real-time charging status.",
  },
  {
    icon: MapPin,
    title: "Smart Navigation",
    description:
      "Turn-by-turn directions to your parking spot and walking guidance after.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Get booking updates, expiry reminders, and important notifications.",
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="relative py-36 bg-[#070b14] px-6 overflow-hidden"
    >
      {/* background glow */}
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full" />

      <div className="relative max-w-7xl mx-auto">
        {/* header */}
        <div className="text-center mb-24">
          <p className="text-sky-400 font-medium mb-4 tracking-wide">
            Built for speed and simplicity
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need to Park with Ease
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            From discovering parking to payment and navigation, ParkEase
            handles every step so you don’t have to think twice.
          </p>
        </div>

        {/* features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur transition-all hover:bg-white/10 hover:-translate-y-1"
            >
              {/* icon */}
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-6 group-hover:bg-sky-500/30 transition">
                <feature.icon className="w-7 h-7 text-sky-400" />
              </div>

              {/* title */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>

              {/* description */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
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

export default Features;
