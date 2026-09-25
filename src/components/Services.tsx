import { Truck, Shield, Clock, MapPin, Package, Headphones } from 'lucide-react';
import { useCurrency } from '@/lib/currency';

const INSURANCE_AMOUNT_NAIRA = 100000;

export default function Services() {
  const { formatPrice } = useCurrency();

  const services = [
    { icon: Truck, title: 'Express Delivery', desc: 'Get your parcels delivered within 24-48 hours nationwide.' },
    { icon: Shield, title: 'Insured Packages', desc: `Every shipment is covered up to ${formatPrice(INSURANCE_AMOUNT_NAIRA)} at no extra cost.` },
    { icon: MapPin, title: 'Real-time Tracking', desc: 'Follow your package every step of the way with live GPS.' },
    { icon: Clock, title: 'Flexible Scheduling', desc: 'Pick a delivery window that works for your schedule.' },
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose SwiftParcel</h2>
          <p className="text-gray-600 mt-2">Built for speed, designed for trust.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all bg-white"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-700 transition-colors">
                <s.icon className="w-6 h-6 text-green-700 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-green-700 to-green-800 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <Package className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Ready to ship?</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Start sending parcels today</h3>
            <p className="text-green-100 mt-1">Book your first shipment in under a minute.</p>
          </div>
          <a
            href="#book"
            className="px-6 py-3.5 rounded-xl bg-yellow-400 text-yellow-900 font-bold hover:bg-yellow-300 transition-colors flex items-center gap-2"
          >
            <Headphones className="w-5 h-5" />
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
}
