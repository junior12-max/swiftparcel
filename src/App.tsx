import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BookShipment from '@/components/BookShipment';
import Services from '@/components/Services';
import Footer from '@/components/Footer';
import Admin from '@/components/Admin';
import { CurrencyProvider } from '@/lib/currency';

function App() {
  const [trackRequest, setTrackRequest] = useState<string | null>(null);
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleTrackRequest = (code: string) => {
    setTrackRequest(code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (route === '#admin') {
    return <Admin />;
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Hero trackRequest={trackRequest} onTrackConsumed={() => setTrackRequest(null)} />
          <BookShipment onTrackRequest={handleTrackRequest} />
          <Services />
        </main>
        <Footer />
      </div>
    </CurrencyProvider>
  );
}

export default App;
