import { useState, useEffect, useCallback } from 'react';
import {
  Package, Lock, LogOut, Search, RefreshCw, Pause, Play, CheckCircle2,
  Truck, MapPin, Clock, ChevronDown, ChevronRight, Mail, User, Shield,
} from 'lucide-react';
import { supabase, type Shipment, type TrackingEvent } from '@/lib/supabase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'swiftparcel.support@gmail.com';

const STATUS_OPTIONS = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

type Session = { email: string } | null;

export default function Admin() {
  const [session, setSession] = useState<Session>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setSession({ email: data.session.user.email });
      }
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess?.user?.email ? { email: sess.user.email } : null);
      setAuthLoading(false);
    });

    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setSigningIn(false);
      return;
    }
    setEmail('');
    setPassword('');
    setSigningIn(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-8 h-8 text-green-700 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <SignInForm email={email} password={password} authError={authError}
      setEmail={setEmail} setPassword={setPassword} signingIn={signingIn}
      onSignIn={handleSignIn} adminEmail={ADMIN_EMAIL} />;
  }

  if (session.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            The account <span className="font-semibold">{session.email}</span> does not have admin access.
            Only <span className="font-semibold">{ADMIN_EMAIL}</span> can manage shipments.
          </p>
          <button onClick={handleSignOut}
            className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onSignOut={handleSignOut} adminEmail={ADMIN_EMAIL} />;
}

function SignInForm({ email, password, authError, setEmail, setPassword, signingIn, onSignIn, adminEmail }: {
  email: string; password: string; authError: string;
  setEmail: (v: string) => void; setPassword: (v: string) => void;
  signingIn: boolean; onSignIn: (e: React.FormEvent) => void; adminEmail: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-green-700 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to manage SwiftParcel shipments</p>
        </div>

        <form onSubmit={onSignIn} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={adminEmail} required
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" required
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all" />
            </div>
          </div>
          {authError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{authError}</div>
          )}
          <button type="submit" disabled={signingIn}
            className="w-full py-3.5 rounded-xl bg-green-700 text-white font-bold hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {signingIn ? <><RefreshCw className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({ onSignOut, adminEmail }: { onSignOut: () => void; adminEmail: string }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, TrackingEvent[]>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('shipments').select('*').order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.or(`tracking_code.ilike.%${search.trim()}%,recipient_name.ilike.%${search.trim()}%,sender_name.ilike.%${search.trim()}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Failed to load shipments:', error);
    }
    setShipments(data ?? []);
    setLoading(false);
  }, [search]);

  useEffect(() => { loadShipments(); }, [loadShipments]);

  const toggleExpand = async (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (!events[id]) {
      const { data } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('shipment_id', id)
        .order('step', { ascending: true });
      setEvents((prev) => ({ ...prev, [id]: data ?? [] }));
    }
  };

  const updateShipment = async (id: string, updates: Partial<Shipment>) => {
    setUpdating(id);
    const { error } = await supabase.from('shipments').update(updates).eq('id', id);
    if (error) {
      alert('Failed to update: ' + error.message);
    } else {
      setShipments((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
    }
    setUpdating(null);
  };

  const toggleEvent = async (shipmentId: string, eventId: string, completed: boolean) => {
    setUpdating(eventId);
    const { error } = await supabase.from('tracking_events').update({ completed }).eq('id', eventId);
    if (error) {
      alert('Failed to update checkpoint: ' + error.message);
    } else {
      setEvents((prev) => ({
        ...prev,
        [shipmentId]: (prev[shipmentId] ?? []).map((e) => e.id === eventId ? { ...e, completed } : e),
      }));
    }
    setUpdating(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">SwiftParcel Admin</span>
              <span className="ml-2 text-xs text-gray-400 hidden sm:inline">{adminEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-600 hover:text-green-700 transition-colors hidden sm:inline">View Site</a>
            <button onClick={onSignOut}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + refresh */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking code, sender or recipient name..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-all" />
          </div>
          <button onClick={loadShipments} disabled={loading}
            className="px-5 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: shipments.length, color: 'text-gray-900' },
            { label: 'In Transit', value: shipments.filter((s) => s.status === 'in_transit').length, color: 'text-blue-600' },
            { label: 'On Hold', value: shipments.filter((s) => s.on_hold).length, color: 'text-yellow-600' },
            { label: 'Delivered', value: shipments.filter((s) => s.status === 'delivered').length, color: 'text-green-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Shipment list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-green-700 animate-spin" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No shipments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Row header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button onClick={() => toggleExpand(s.id)} className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors">
                      {expanded === s.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900">{s.tracking_code}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          s.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          s.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                          s.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </span>
                        {s.on_hold && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-orange-100 text-orange-700">
                            On Hold
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {s.sender_name} → {s.recipient_name}</span>
                        <span className="hidden sm:flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.pickup_address ?? s.sender_address} → {s.delivery_address ?? s.recipient_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status selector */}
                    <select
                      value={s.status}
                      onChange={(e) => updateShipment(s.id, { status: e.target.value })}
                      disabled={updating === s.id}
                      className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{STATUS_LABELS[st]}</option>
                      ))}
                    </select>

                    {/* Hold/Release toggle */}
                    <button
                      onClick={() => updateShipment(s.id, { on_hold: !s.on_hold })}
                      disabled={updating === s.id}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                        s.on_hold
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.on_hold ? <><Pause className="w-4 h-4" /> Held</> : <><Play className="w-4 h-4" /> Active</>}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === s.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5">
                    {/* Shipment details */}
                    <div className="grid sm:grid-cols-3 gap-4 mb-5">
                      <div>
                        <div className="text-xs text-gray-400 uppercase mb-1">Packages</div>
                        <div className="font-medium text-gray-900">{s.package_count} × {s.package_type ?? 'standard'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase mb-1">Current Location</div>
                        <input
                          type="text"
                          defaultValue={s.current_location ?? ''}
                          onBlur={(e) => { if (e.target.value !== (s.current_location ?? '')) updateShipment(s.id, { current_location: e.target.value }); }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase mb-1">Route Progress</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min={0} max={100}
                            defaultValue={s.route_progress}
                            onBlur={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v !== s.route_progress) updateShipment(s.id, { route_progress: v }); }}
                            className="w-20 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    </div>

                    {s.recipient_email && (
                      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" /> {s.recipient_email}
                      </div>
                    )}

                    {/* Tracking checkpoints */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-700" /> Tracking Checkpoints
                      </h4>
                      <div className="space-y-2">
                        {(events[s.id] ?? []).map((ev) => (
                          <div key={ev.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3">
                            <button
                              onClick={() => toggleEvent(s.id, ev.id, !ev.completed)}
                              disabled={updating === ev.id}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50 ${
                                ev.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                              }`}
                            >
                              {ev.completed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${ev.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                Step {ev.step}: {ev.label}
                              </div>
                              <div className="text-xs text-gray-400">{ev.description} — {ev.location}</div>
                            </div>
                            <span className={`text-xs font-semibold ${ev.completed ? 'text-green-700' : 'text-gray-400'}`}>
                              {ev.completed ? 'Done' : 'Pending'}
                            </span>
                          </div>
                        ))}
                        {(events[s.id] ?? []).length === 0 && (
                          <p className="text-sm text-gray-400">No tracking events found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
