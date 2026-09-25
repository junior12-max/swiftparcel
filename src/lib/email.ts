import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export type BookingEmailParams = {
  to_email: string;
  tracking_code: string;
  sender_name: string;
  recipient_name: string;
  pickup_address: string;
  delivery_address: string;
  package_count: number;
  package_type: string;
  estimated_cost: string;
};

export async function sendBookingEmail(params: BookingEmailParams): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS env vars not configured — skipping email send');
    return;
  }

  emailjs.init({ publicKey: PUBLIC_KEY });

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
}
