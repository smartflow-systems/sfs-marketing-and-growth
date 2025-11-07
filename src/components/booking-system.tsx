import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { FeatureGate } from './feature-gate';
import 'react-calendar/dist/Calendar.css';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Booking {
  id: string;
  date: Date;
  time: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface BookingSystemProps {
  services?: string[];
  businessHours?: { start: number; end: number };
  slotDuration?: number;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({
  services = ['Consultation', 'Demo', 'Training', 'Support'],
  businessHours = { start: 9, end: 17 },
  slotDuration = 30
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>(services[0]);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Generate time slots for selected date
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const { start, end } = businessHours;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Simulate availability (in real app, check against bookings)
        const isAvailable = Math.random() > 0.3;

        slots.push({
          time: timeString,
          available: isAvailable
        });
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In real app, send to API
    const booking: Booking = {
      id: Date.now().toString(),
      date: selectedDate,
      time: selectedTime,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: selectedService,
      notes: formData.notes,
      status: 'confirmed'
    };

    console.log('Booking created:', booking);
    setStep(3);
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates and weekends
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return date < today || isWeekend;
  };

  return (
    <FeatureGate feature="booking_calendar">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gold mb-2">Book an Appointment</h1>
          <p className="text-gold-300">Schedule a meeting with our team</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'Select Time' },
            { num: 2, label: 'Your Info' },
            { num: 3, label: 'Confirm' }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.num
                    ? 'bg-gold-gradient text-black-900'
                    : 'bg-black-900 text-gold-300 border border-gold-800'
                }`}
              >
                {s.num}
              </div>
              <span
                className={`hidden md:block ${
                  step >= s.num ? 'text-gold-100' : 'text-gold-300'
                }`}
              >
                {s.label}
              </span>
              {s.num < 3 && (
                <div className="hidden md:block w-12 h-0.5 bg-gold-800 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Date & Time Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="panel-dark border-gold">
              <h3 className="text-xl font-bold text-gold mb-4">Select Date</h3>
              <div className="calendar-wrapper">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileDisabled={({ date }) => isDateDisabled(date)}
                  className="w-full bg-black-900 text-gold-100 border-0 rounded-lg"
                  tileClassName="calendar-day"
                />
              </div>

              {/* Service Selection */}
              <div className="mt-6">
                <label className="block text-gold-300 mb-2 font-semibold">
                  Select Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="input-dark"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Slots */}
            <div className="panel-dark border-gold">
              <h3 className="text-xl font-bold text-gold mb-4">
                Available Times for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto scrollbar-gold">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedTime === slot.time
                        ? 'bg-gold-gradient text-black-900'
                        : slot.available
                        ? 'btn-gold-ghost'
                        : 'bg-black-900/30 text-gold-800 cursor-not-allowed opacity-40'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedTime}
                className="btn-gold w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {step === 2 && (
          <div className="panel-dark border-gold max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gold mb-6">Your Information</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gold-300 mb-2 font-semibold">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-dark"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-gold-300 mb-2 font-semibold">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-dark"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-gold-300 mb-2 font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-dark"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-gold-300 mb-2 font-semibold">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-dark min-h-[100px]"
                  placeholder="Any special requirements or questions..."
                />
              </div>

              {/* Summary */}
              <div className="panel-dark border-gold-800 p-4 mt-6">
                <h4 className="font-bold text-gold mb-3">Booking Summary</h4>
                <div className="space-y-2 text-gold-100">
                  <div className="flex justify-between">
                    <span className="text-gold-300">Service:</span>
                    <span className="font-semibold">{selectedService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gold-300">Date:</span>
                    <span className="font-semibold">{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gold-300">Time:</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gold-300">Duration:</span>
                    <span className="font-semibold">{slotDuration} minutes</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-gold-ghost flex-1"
                >
                  Back
                </button>
                <button type="submit" className="btn-gold flex-1">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="panel-dark border-gold max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gold mb-2">Booking Confirmed!</h3>
            <p className="text-gold-300 mb-6">
              Your appointment has been successfully scheduled.
            </p>

            <div className="panel-dark border-gold-800 p-6 mb-6 text-left">
              <h4 className="font-bold text-gold mb-4">Appointment Details</h4>
              <div className="space-y-3 text-gold-100">
                <div className="flex justify-between">
                  <span className="text-gold-300">Name:</span>
                  <span className="font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gold-300">Email:</span>
                  <span className="font-semibold">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gold-300">Service:</span>
                  <span className="font-semibold">{selectedService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gold-300">Date & Time:</span>
                  <span className="font-semibold">
                    {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gold-100 text-sm">
                A confirmation email has been sent to <strong>{formData.email}</strong>
              </p>
              <div className="flex gap-3 justify-center">
                <button className="btn-gold-ghost">
                  Add to Google Calendar
                </button>
                <button className="btn-gold-ghost">
                  Add to Outlook
                </button>
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  setFormData({ name: '', email: '', phone: '', notes: '' });
                  setSelectedTime('');
                }}
                className="btn-gold w-full md:w-auto"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  );
};

export default BookingSystem;
