import {
  Car,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";

const footerLinks = {
  product: ["Features", "Pricing", "EV Charging", "ParkPass"],
  company: ["About", "Careers", "Press", "Blog"],
  support: ["Help Center", "FAQs", "Contact", "Report Issue"],
  legal: ["Privacy Policy", "Terms of Service", "Refund Policy"],
};

const Footer = () => {
  return (
    <footer className="relative bg-[#0c1321] px-6 pt-20 pb-10 overflow-hidden">

      <div className="relative max-w-7xl mx-auto">
        {/* main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-14 mb-20">
          {/* brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center">
                <Car className="w-6 h-6 text-sky-400" />
              </div>
              <span className="text-2xl font-bold text-white">ParkEase</span>
            </div>

            <p className="text-gray-400 max-w-md mb-8">
              Smart parking made effortless. Discover spots, book instantly,
              pay securely, and park without friction.
            </p>

            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-400" />
                support@parkease.com
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sky-400" />
                +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-sky-400" />
                123 Parking Lane, City
              </div>
            </div>
          </div>

          {/* links */}
          <FooterColumn title="Product" items={footerLinks.product} />
          <FooterColumn title="Company" items={footerLinks.company} />
          <FooterColumn title="Support" items={footerLinks.support} />
        </div>

        {/* bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500">
            © 2024 ParkEase. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <SocialIcon Icon={Twitter} />
            <SocialIcon Icon={Linkedin} />
            <SocialIcon Icon={Github} />
          </div>
        </div>
      </div>
    </footer>
  );
};

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-6">{title}</h4>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item}>
            <a
              href="#"
              className="text-gray-400 text-sm hover:text-sky-400 transition"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ Icon }) {
  return (
    <a
      href="#"
      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-sky-500/20 hover:border-sky-400/30 transition"
    >
      <Icon className="w-5 h-5 text-gray-400 hover:text-sky-400" />
    </a>
  );
}

export default Footer;
