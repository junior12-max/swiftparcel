import { useState } from 'react';
import { MapPin, Package, Plus, Minus, Calendar, Truck, CheckCircle2, User, Search, ArrowRight, Box, Feather, Layers, Building2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { sendBookingEmail } from '@/lib/email';
import { useCurrency } from '@/lib/currency';

type Props = {
  onTrackRequest: (code: string) => void;
};

// US and European city coordinates for demo map display
const cityCoords: Record<string, { lat: number; lng: number }> = {
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'new york': { lat: 40.7128, lng: -74.006 },
  chicago: { lat: 41.8781, lng: -87.6298 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  miami: { lat: 25.7617, lng: -80.1918 },
  boston: { lat: 42.3601, lng: -71.0589 },
  seattle: { lat: 47.6062, lng: -122.3321 },
  denver: { lat: 39.7392, lng: -104.9903 },
  austin: { lat: 30.2672, lng: -97.7431 },
  london: { lat: 51.5074, lng: -0.1278 },
  manchester: { lat: 53.4808, lng: -2.2426 },
  paris: { lat: 48.8566, lng: 2.3522 },
  berlin: { lat: 52.52, lng: 13.405 },
  rome: { lat: 41.9028, lng: 12.4964 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
};

function findCoords(address: string): { lat: number; lng: number } | null {
  const lower = address.toLowerCase();
  for (const [city, coords] of Object.entries(cityCoords)) {
    if (lower.includes(city)) return coords;
  }
  return null;
}

const packageTypes = [
  { id: 'standard', label: 'Standard', icon: Box, multiplier: 1, desc: 'Up to 5kg' },
  { id: 'express', label: 'Express', icon: Feather, multiplier: 1.5, desc: 'Up to 3kg · Priority' },
  { id: 'bulk', label: 'Bulk', icon: Layers, multiplier: 2.2, desc: 'Up to 25kg' },
  { id: 'corporate', label: 'Corporate', icon: Building2, multiplier: 1.8, desc: 'Up to 15kg · Business' },
] as const;

const BASE_PRICE = 2500; // ₦2,500 base (stored in NGN)
const PER_PACKAGE_PRICE = 800; // ₦800 per additional package (stored in NGN)

export default function BookShipment({ onTrackRequest }: Props) {
  const { formatPrice } = useCurrency();
  const [senderName, setSenderName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [packageCount, setPackageCount] = useState(1);
  const [packageType, setPackageType] = useState<string>('standard');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [booking, setBooking] = useState<{
    code: string;
    senderName: string;
    pickupAddress: string;
    recipientName: string;
    deliveryAddress: string;
    packageCount: number;
    packageType: string;
    estimatedCost: number;
  } | null>(null);

  const selectedType = packageTypes.find((t) => t.id === packageType) ?? packageTypes[0];
  const estimatedCost = Math.round((BASE_PRICE + (packageCount - 1) * PER_PACKAGE_PRICE) * selectedType.multiplier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!senderName || !pickupAddress || !recipientName || !recipientEmail || !deliveryAddress) {
      setError('Please fill in all fields including recipient email.');
      setSubmitting(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid recipient email address.');
      setSubmitting(false);
      return;
    }

    const code = 'SP-' + Math.floor(1000 + Math.random() * 9000);
    const origin = findCoords(pickupAddress);
    const dest = findCoords(deliveryAddress);

    const { data, error: insertError } = await supabase
      .from('shipments')
      .insert({
        tracking_code: code,
        sender_name: senderName,
        sender_address: pickupAddress,
        recipient_name: recipientName,
        recipient_address: deliveryAddress,
        recipient_email: recipientEmail,
        pickup_address: pickupAddress,
        delivery_address: deliveryAddress,
        package_count: packageCount,
        package_type: packageType,
        status: 'pending',
        current_location: pickupAddress,
        origin_coords: origin,
        destination_coords: dest,
        current_coords: origin,
        route_progress: 0,
      })
      .select()
      .single();

    if (insertError || !data) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    const events = [
      { shipment_id: data.id, step: 1, label: 'Order Received', description: 'Shipment booked and confirmed', location: pickupAddress, completed: true },
      { shipment_id: data.id, step: 2, label: 'Picked Up', description: 'Package collected from sender', location: pickupAddress, completed: false },
      { shipment_id: data.id, step: 3, label: 'In Transit', description: 'Package on the move to destination', location: 'In transit', completed: false },
      { shipment_id: data.id, step: 4, label: 'Out for Delivery', description: 'Package handed to local courier', location: deliveryAddress, completed: false },
      { shipment_id: data.id, step: 5, label: 'Delivered', description: 'Package delivered to recipient', location: deliveryAddress, completed: false },
    ];

    await supabase.from('tracking_events').insert(events);

    try {
      await sendBookingEmail({
        to_email: recipientEmail,
        tracking_code: code,
        sender_name: senderName,
        recipient_name: recipientName,
        pickup_address: pickupAddress,
        delivery_address: deliveryAddress,
        package_count: packageCount,
        package_type: packageType,
        estimated_cost: formatPrice(estimatedCost),
      });
    } catch (emailErr) {
      console.warn('Failed to send confirmation email:', emailErr);
    }

    setBooking({
      code,
      senderName,
      pickupAddress,
      recipientName,
      deliveryAddress,
      packageCount,
      packageType,
      estimatedCost,
    });
    setSubmitting(false);
  };

  const handleBookAnother = () => {
    setBooking(null);
    setSenderName('');
    setPickupAddress('');
    setRecipientName('');
    setRecipientEmail('');
    setDeliveryAddress('');
    setPackageCount(1);
    setPackageType('standard');
  };

  const bookedTypeLabel = booking ? packageTypes.find((t) => t.id === booking.packageType)?.label : '';

  if (booking) {
    return (
      <section id="book" className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-green-200 shadow-lg overflow-hidden">
            {/* Top banner */}
            <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-9 h-9 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Pickup Scheduled!</h3>
              <p className="text-green-100 mt-1 text-sm">Your shipment has been booked successfully.</p>
            </div>

            <div className="p-6 sm:p-8">
              {/* Tracking code */}
              <div className="text-center mb-6">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Tracking Code</div>
                <div className="text-3xl font-bold text-green-700">{booking.code}</div>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">From</span>
                  <span className="font-medium text-gray-900 text-right">{booking.senderName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">To</span>
                  <span className="font-medium text-gray-900 text-right">{booking.recipientName}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-green-700 flex-shrink-0" />
                    <span className="truncate">{booking.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="truncate">{booking.deliveryAddress}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-gray-400">Packages</div>
                    <div className="font-bold text-gray-900">{booking.packageCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Type</div>
                    <div className="font-bold text-gray-900">{bookedTypeLabel}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Est. Cost</div>
                    <div className="font-bold text-green-700">{formatPrice(booking.estimatedCost)}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onTrackRequest(booking.code)}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Track This Shipment
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleBookAnother}
                  className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Book Another
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold mb-3">
            <Truck className="w-4 h-4" />
            Book a Shipment
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Schedule a Pickup</h2>
          <p className="text-gray-600 mt-2">Fill in the details below and we'll handle the rest.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8 space-y-6">
          {/* Sender */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center">1</span>
              Pickup Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sender Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="123 Market St, San Francisco, CA"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center">2</span>
              Delivery Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Emily Watson"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="456 Fifth Ave, New York, NY"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="emily.watson@example.com"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Confirmation and tracking updates will be sent here.</p>
            </div>
          </div>

          {/* Package type + count */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center">3</span>
              Package Details
            </h3>

            {/* Package type selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {packageTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPackageType(type.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    packageType === type.id
                      ? 'border-green-700 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <type.icon className={`w-5 h-5 mx-auto mb-1.5 ${packageType === type.id ? 'text-green-700' : 'text-gray-400'}`} />
                  <div className={`text-sm font-semibold ${packageType === type.id ? 'text-green-700' : 'text-gray-700'}`}>
                    {type.label}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{type.desc}</div>
                </button>
              ))}
            </div>

            {/* Package count */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPackageCount((c) => Math.max(1, c - 1))}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Decrease package count"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <Package className="w-5 h-5 text-green-700" />
                <span className="text-2xl font-bold text-gray-900 tabular-nums">{packageCount}</span>
                <span className="text-sm text-gray-500">{packageCount === 1 ? 'package' : 'packages'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPackageCount((c) => Math.min(99, c + 1))}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                aria-label="Increase package count"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price estimate */}
          <div className="rounded-xl bg-gradient-to-r from-green-50 to-yellow-50 border border-green-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Estimated Cost</div>
                <div className="text-3xl font-bold text-green-700 mt-1">{formatPrice(estimatedCost)}</div>
              </div>
              <div className="text-right text-xs text-gray-400 space-y-0.5">
                <div>Base: {formatPrice(BASE_PRICE)}</div>
                <div>+ {formatPrice(PER_PACKAGE_PRICE)}/pkg × {packageCount - 1}</div>
                <div>× {selectedType.multiplier}× {selectedType.label}</div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-green-700 text-white font-bold uppercase tracking-wide hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            {submitting ? 'Scheduling...' : 'Schedule Pickup'}
          </button>
        </form>
      </div>
    </section>
  );
}
