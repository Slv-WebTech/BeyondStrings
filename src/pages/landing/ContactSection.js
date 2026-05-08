import React, { useState } from 'react';
import { cn } from './utils';
import GlassCard from './GlassCard';
import MaterialIcon from './MaterialIcon';
import AnimatedButton from './AnimatedButton';
import { CONTACT_INFO } from './constants';

const ContactSection = ({ className = '', onContactFormChange, onContactSentChange }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    const next = {
      ...formData,
      [e.target.name]: e.target.value
    };
    onContactFormChange?.({ name: next.fullName, message: next.message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    onContactSentChange?.(true);
    setFormData({ fullName: '', email: '', message: '' });
    onContactFormChange?.({ name: '', message: '' });
    setTimeout(() => {
      setSubmitted(false);
      onContactSentChange?.(false);
    }, 5000);
  };

  const inputClasses = "w-full bg-[var(--panel)] border border-[var(--border-soft)] rounded-lg px-4 py-3.5 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[#00f0ff]/60 focus:border-[#00f0ff]/40 outline-none transition-all duration-300 hover:border-[#00f0ff]/30 focus:scale-[1.01]";

  return (
    <section id="contact" className={cn('py-16 md:py-24 scroll-mt-28', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-8">
              Get In Touch
            </h2>
            <p className="text-[var(--text-muted)] mb-12 md:mb-14 leading-relaxed text-lg">
              Have questions about our enterprise plans or custom training?
              Our team of AI specialists is here to help.
            </p>

            <div className="space-y-7">
              {CONTACT_INFO.map((info, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <span className="w-12 h-12 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00f0ff]/20 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300">
                    <MaterialIcon icon={info.icon} size={22} className="text-[#00f0ff]" />
                  </span>
                  <span className="text-sm md:text-base text-[var(--text-main)]">{info.text}</span>
                </div>
              ))}
            </div>
          </div>

          <GlassCard padding="large" className="transition-all duration-500">
            {submitted ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-[#00f0ff]/10 flex items-center justify-center mx-auto mb-6">
                  <MaterialIcon icon="check_circle" size={40} className="text-[#00f0ff]" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Message Sent!</h3>
                <p className="text-[var(--text-muted)] text-base">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us about your project..."
                    className={cn(inputClasses, 'resize-none')}
                  />
                </div>

                <AnimatedButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                  size="lg"
                >
                  Send Message
                </AnimatedButton>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
