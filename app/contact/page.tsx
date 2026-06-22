import type { Metadata } from "next";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ContactForm } from "@/components/marketing/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the NexWear customer care team.",
};

const INFO = [
  { icon: MapPin, label: "Flagship", value: "12 Marylebone Lane, London W1U 2NR" },
  { icon: Mail, label: "Email", value: "support@nexwear.com" },
  { icon: Phone, label: "Phone", value: "+44 20 7946 0000" },
  { icon: Clock, label: "Hours", value: "Mon–Fri, 9:00–18:00 GMT" },
];

export default function ContactPage() {
  return (
    <div>
      <PageHero eyebrow="We're Here To Help" title="Contact Us" subtitle="Questions about an order, sizing or returns? Our care team is happy to help." />
      <section className="container-luxe grid gap-12 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light uppercase tracking-wide2">Store Information</h2>
          <ul className="space-y-5">
            {INFO.map((i) => (
              <li key={i.label} className="flex gap-4">
                <i.icon className="h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-[0.7rem] uppercase tracking-wide2 text-stone">{i.label}</p>
                  <p className="text-sm text-ink">{i.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-6 font-serif text-2xl font-light uppercase tracking-wide2">Send A Message</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
