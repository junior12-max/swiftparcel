import { useState, useEffect } from 'react';
import { Search, MapPin, Package, CheckCircle2, Circle, Truck, Clock, ArrowRight } from 'lucide-react';
import { supabase, type Shipment, type TrackingEvent } from '@/lib/supabase';
import RouteMap from './RouteMap';
import { useCurrency } from '@/lib/currency';

type Props = {
  trackRequest: string | null;
  onTrackConsumed: () => void;
};

export default function Hero({ trackRequest, onTrackConsumed }: Props) {
  const { formatPrice } = useCurrency();
  const [trackingCode, setTrackingCode] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);

  const doTrack = async (code: string) => {
    const upper = code.trim().toUpperCase();
    if (!upper) return;
    setLoading(true);
    setError('');
    setShowResult(false);

    const { data: shipData, error: shipError } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_code', upper)
      .maybeSingle();

    if (shipError || !shipData) {
      setError('No shipment found with that tracking code. Try SP-9900.');
      setShipment(null);
      setEvents([]);
      setLoading(false);
      return;
    }

    const { data: eventData } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('shipment_id', shipData.id)
      .order('step', { ascending: true });

    setShipment(shipData as Shipment);
    setEvents((eventData ?? []) as TrackingEvent[]);
    setShowResult(true);
    setLoading(false);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    doTrack(trackingCode);
  };

  const handleDemo = () => {
    setTrackingCode('SP-9900');
    doTrack('SP-9900');
  };

  // Handle track requests coming from other components (e.g. booking success card)
  useEffect(() => {
    if (trackRequest) {
      setTrackingCode(trackRequest);
      doTrack(trackRequest);
      onTrackConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackRequest]);

  const completedCount = events.filter((e) => e.completed).length;
  const progressPct = events.length > 0 ? Math.round((completedCount / events.length) * 100) : 0;

  return (
    <section id="home" className="pt-16 bg-gradient-to-b from-green-50/60 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center py-12 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold mb-4">
              <Truck className="w-4 h-4" />
              Fast. Reliable. Nationwide.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Delivering smiles, <br />
              <span className="text-green-700">one parcel</span> at a time.
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-lg leading-relaxed">
              Track your packages in real-time and book shipments in seconds. SwiftParcel connects every corner of the country.
            </p>

            {/* Track form */}
            <form onSubmit={handleTrack} className="mt-8">
              <label htmlFor="tracking" className="block text-sm font-semibold text-gray-700 mb-2">
                Track Your Parcel
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="tracking"
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Enter tracking code (e.g. SP-9900)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Tracking...' : 'Track Now'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleDemo}
                className="mt-3 text-sm text-green-700 font-medium hover:underline"
              >
                Try a demo with SP-9900
              </button>
              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
              )}
            </form>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: '12M+', label: 'Parcels Delivered' },
                { value: '99.8%', label: 'On-Time Rate' },
                { value: '24/7', label: 'Live Support' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual side */}
          <div className="hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-700 to-green-900 p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Express Delivery</div>
                    <div className="text-green-200 text-sm">2-3 business days</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {['Real-time GPS tracking', 'Door-to-door pickup', 'Insured packages'].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400" />
                      <span className="text-green-50 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-green-100 text-sm">Starting from</span>
                  <span className="text-white text-2xl font-bold">{formatPrice(2500)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking result */}
        {showResult && shipment && (
          <div id="track" className="pb-16 scroll-mt-20">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-green-700 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-green-100 text-xs uppercase tracking-wide">Tracking Code</div>
                  <div className="text-white text-2xl font-bold">{shipment.tracking_code}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold uppercase">
                    {shipment.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-green-50 text-sm">{progressPct}% Complete</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-5 gap-0">
                {/* Progress steps */}
                <div className="lg:col-span-3 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delivery Progress</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {shipment.sender_address} → {shipment.recipient_address}
                  </p>

                  {/* Progress bar */}
                  <div className="relative mb-8">
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-600 to-green-700 transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-1">
                    {events.map((event, idx) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {event.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-700 flex-shrink-0" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                          )}
                          {idx < events.length - 1 && (
                            <div
                              className={`w-0.5 h-10 ${event.completed ? 'bg-green-600' : 'bg-gray-200'}`}
                            />
                          )}
                        </div>
                        <div className={`pb-6 ${event.completed ? '' : 'opacity-50'}`}>
                          <div className="font-semibold text-gray-900 text-sm">{event.label}</div>
                          <div className="text-sm text-gray-500">{event.description}</div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                            {!event.completed && (
                              <span className="flex items-center gap-1 ml-2 text-yellow-600">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map */}
                <div className="lg:col-span-2 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Live Location</h3>
                  <p className="text-sm text-gray-500 mb-4">Route preview</p>
                  {shipment.origin_coords && shipment.destination_coords && (
                    <RouteMap
                      origin={shipment.origin_coords}
                      destination={shipment.destination_coords}
                      current={shipment.current_coords}
                      progress={shipment.route_progress}
                    />
                  )}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">Origin</div>
                        <div className="text-gray-500 text-xs">{shipment.sender_address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">Current</div>
                        <div className="text-gray-500 text-xs">{shipment.current_location ?? 'In transit'} · {shipment.route_progress}% complete</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">Destination</div>
                        <div className="text-gray-500 text-xs">{shipment.recipient_address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
