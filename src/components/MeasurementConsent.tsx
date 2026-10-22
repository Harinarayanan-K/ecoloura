import { useEffect, useState } from 'react';
import { savedConsent, setMeasurementConsent, trackingConfigured } from '../lib/analytics';
export function MeasurementConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const saved = savedConsent();
    if (saved) setMeasurementConsent(saved === 'accepted');
    else setVisible(trackingConfigured);
    const reopen = () => setVisible(true);
    window.addEventListener('ecoloura-consent-settings', reopen);
    return () => window.removeEventListener('ecoloura-consent-settings', reopen);
  }, []);
  const choose = (accept: boolean) => { setMeasurementConsent(accept); setVisible(false); };
  return <>
    {trackingConfigured && <button className="measurement-settings" onClick={() => setVisible(true)}>Analytics preferences</button>}
    {visible && <section className="measurement-banner" aria-label="Analytics preferences">
      <p>Allow optional analytics to help us understand visits and contact-button use? Your enquiry works with either choice. <a href="/privacy/">Privacy notice</a></p>
      <div><button onClick={() => choose(false)}>Decline analytics</button><button onClick={() => choose(true)}>Allow analytics</button></div>
    </section>}
  </>;
}
