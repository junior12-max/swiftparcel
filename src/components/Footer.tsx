import { Package, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Swift<span className="text-green-500">Parcel</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Fast, reliable parcel delivery connecting every corner of the country.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#book" className="hover:text-green-400 transition-colors">Book Shipment</a></li>
              <li><a href="#track" className="hover:text-green-400 transition-colors">Track Parcel</a></li>
              <li><a href="#services" className="hover:text-green-400 transition-colors">Express Delivery</a></li>
              <li><a href="#admin" className="hover:text-green-400 transition-colors">Admin Portal</a></li>
              <li><a href="#services" className="hover:text-green-400 transition-colors">Business Accounts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" /> 1-800-SWIFT-00
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" /> swiftparcel.support@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" /> 100 Logistics Way, San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-sm">
          &copy; {new Date().getFullYear()} SwiftParcel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
