import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Edit, Trash2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Setup date-fns localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'post' | 'utm_link' | 'calendar_event';
  status?: string;
  platforms?: string[];
  campaignId?: number;
  campaignName?: string;
  description?: string;
  resource?: any; // Original event data
}

export default function CampaignCalendar() {
  const { user: _user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    campaignId: null as number | null,
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      loadCalendarEvents(selectedCampaign);
    } else {
      loadAllEvents();
    }
  }, [selectedCampaign]);

  async function loadCampaigns() {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  }

  async function loadAllEvents() {
    setLoading(true);
    try {
      const [posts, calendarEvents] = await Promise.all([
        api.getAIPosts(),
        api.getCalendarEvents(),
      ]);

      const allEvents: CalendarEvent[] = [
        ...posts
          .filter((p: any) => p.scheduledFor)
          .map((post: any) => ({
            id: post.id,
            title: post.title || 'Untitled Post',
            start: new Date(post.scheduledFor),
            end: new Date(post.scheduledFor),
            type: 'post' as const,
            status: post.status,
            platforms: post.platforms,
            campaignId: post.campaignId,
            campaignName: campaigns.find(c => c.id === post.campaignId)?.name,
            resource: post,
          })),
        ...calendarEvents.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate || event.startDate),
          type: 'calendar_event' as const,
          campaignId: event.campaignId,
          campaignName: campaigns.find(c => c.id === event.campaignId)?.name,
          description: event.description,
          resource: event,
        })),
      ];

      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCalendarEvents(campaignId: number) {
    setLoading(true);
    try {
      const [posts, calendarEvents] = await Promise.all([
        api.getAIPosts(),
        api.getCalendarEvents(),
      ]);

      const campaign = campaigns.find(c => c.id === campaignId);

      const filteredEvents: CalendarEvent[] = [
        ...posts
          .filter((p: any) => p.campaignId === campaignId && p.scheduledFor)
          .map((post: any) => ({
            id: post.id,
            title: post.title || 'Untitled Post',
            start: new Date(post.scheduledFor),
            end: new Date(post.scheduledFor),
            type: 'post' as const,
            status: post.status,
            platforms: post.platforms,
            campaignId: post.campaignId,
            campaignName: campaign?.name,
            resource: post,
          })),
        ...calendarEvents
          .filter((e: any) => e.campaignId === campaignId)
          .map((event: any) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.startDate),
            end: new Date(event.endDate || event.startDate),
            type: 'calendar_event' as const,
            campaignId: event.campaignId,
            campaignName: campaign?.name,
            description: event.description,
            resource: event,
          })),
      ];

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  }

  // Event style customization
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#FFD700'; // Gold
    let borderColor = '#FFD700';

    if (event.type === 'post') {
      if (event.status === 'draft') {
        backgroundColor = '#6b7280'; // Gray
        borderColor = '#6b7280';
      } else if (event.status === 'scheduled') {
        backgroundColor = '#3b82f6'; // Blue
        borderColor = '#3b82f6';
      } else if (event.status === 'sent') {
        backgroundColor = '#10b981'; // Green
        borderColor = '#10b981';
      }
    } else if (event.type === 'calendar_event') {
      backgroundColor = '#8b5cf6'; // Purple
      borderColor = '#8b5cf6';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        padding: '4px 8px',
      },
    };
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  }, []);

  // Handle slot selection (for creating new events)
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    const startDateStr = slotInfo.start.toISOString().slice(0, 16);
    const endDateStr = slotInfo.end.toISOString().slice(0, 16);

    setNewEventData({
      title: '',
      description: '',
      startDate: startDateStr,
      endDate: endDateStr,
      campaignId: selectedCampaign,
    });
    setShowCreateDialog(true);
  }, [selectedCampaign]);

  // Handle create event form submission
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEventData.title.trim()) {
      alert('Please enter a title for the event');
      return;
    }

    try {
      await api.createCalendarEvent({
        title: newEventData.title,
        description: newEventData.description,
        startDate: new Date(newEventData.startDate).toISOString(),
        endDate: new Date(newEventData.endDate).toISOString(),
        campaignId: newEventData.campaignId,
      });

      setShowCreateDialog(false);
      setNewEventData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        campaignId: null,
      });

      // Refresh events
      if (selectedCampaign) {
        loadCalendarEvents(selectedCampaign);
      } else {
        loadAllEvents();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--sf-cosmic-dark)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gold-gradient mb-2 flex items-center gap-3">
              <CalendarIcon className="w-10 h-10" />
              Campaign Calendar
            </h1>
            <p className="text-gray-400">
              Visualize and manage all your scheduled content and events
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Click on any date to create a new event
            </p>
          </div>

          {/* Campaign Filter */}
          <div className="flex items-center gap-4">
            <select
              value={selectedCampaign || ''}
              onChange={(e) => setSelectedCampaign(e.target.value ? parseInt(e.target.value) : null)}
              className="glass-card px-4 py-2 rounded-lg text-white border border-gold/20 focus:border-gold"
            >
              <option value="">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
              <span className="text-sm text-gray-300">Draft Post</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-sm text-gray-300">Scheduled Post</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-sm text-gray-300">Sent Post</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="text-sm text-gray-300">Calendar Event</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="glass-card p-6" style={{ minHeight: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={setView}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            className="sfs-calendar"
          />
        </div>

        {/* Create Event Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowCreateDialog(false)}>
            <div className="glass-card p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-8 h-8 text-purple-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Create Calendar Event</h2>
                    <p className="text-sm text-gray-400">Add a new milestone or deadline</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={newEventData.title}
                    onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                    placeholder="e.g., Product Launch, Campaign Deadline"
                    className="w-full glass-card px-4 py-3 rounded-lg text-white border border-gold/20 focus:border-gold outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">
                    Description
                  </label>
                  <textarea
                    value={newEventData.description}
                    onChange={(e) => setNewEventData({ ...newEventData, description: e.target.value })}
                    placeholder="Add event details..."
                    rows={3}
                    className="w-full glass-card px-4 py-3 rounded-lg text-white border border-gold/20 focus:border-gold outline-none resize-none"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEventData.startDate}
                    onChange={(e) => setNewEventData({ ...newEventData, startDate: e.target.value })}
                    className="w-full glass-card px-4 py-3 rounded-lg text-white border border-gold/20 focus:border-gold outline-none"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEventData.endDate}
                    onChange={(e) => setNewEventData({ ...newEventData, endDate: e.target.value })}
                    className="w-full glass-card px-4 py-3 rounded-lg text-white border border-gold/20 focus:border-gold outline-none"
                    required
                  />
                </div>

                {/* Campaign */}
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">
                    Campaign (Optional)
                  </label>
                  <select
                    value={newEventData.campaignId || ''}
                    onChange={(e) => setNewEventData({ ...newEventData, campaignId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full glass-card px-4 py-3 rounded-lg text-white border border-gold/20 focus:border-gold outline-none"
                  >
                    <option value="">No Campaign</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1 glass-card px-6 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 glass-card px-6 py-3 rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all"
                  >
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Details Dialog */}
        {showEventDialog && selectedEvent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowEventDialog(false)}>
            <div className="glass-card p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  {selectedEvent.type === 'post' ? (
                    <FileText className="w-8 h-8 text-blue-400" />
                  ) : (
                    <CalendarIcon className="w-8 h-8 text-purple-400" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                    <p className="text-sm text-gray-400 capitalize">{selectedEvent.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventDialog(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 uppercase tracking-wide">Date & Time</label>
                  <p className="text-white mt-1">
                    {format(selectedEvent.start, 'PPpp')}
                    {selectedEvent.start.getTime() !== selectedEvent.end.getTime() && (
                      <> - {format(selectedEvent.end, 'PPpp')}</>
                    )}
                  </p>
                </div>

                {selectedEvent.campaignName && (
                  <div>
                    <label className="text-sm text-gray-400 uppercase tracking-wide">Campaign</label>
                    <p className="text-gold mt-1">{selectedEvent.campaignName}</p>
                  </div>
                )}

                {selectedEvent.status && (
                  <div>
                    <label className="text-sm text-gray-400 uppercase tracking-wide">Status</label>
                    <p className="text-white mt-1 capitalize">{selectedEvent.status}</p>
                  </div>
                )}

                {selectedEvent.platforms && selectedEvent.platforms.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-400 uppercase tracking-wide">Platforms</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedEvent.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-3 py-1 bg-gold/20 text-gold rounded-full text-sm"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <label className="text-sm text-gray-400 uppercase tracking-wide">Description</label>
                    <p className="text-gray-300 mt-1">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.resource?.content && (
                  <div>
                    <label className="text-sm text-gray-400 uppercase tracking-wide">Content</label>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap">{selectedEvent.resource.content}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button className="flex-1 glass-card px-6 py-3 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex-1 glass-card px-6 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Calendar Styles */}
      <style>{`
        .sfs-calendar {
          background: transparent !important;
          color: white !important;
        }

        .sfs-calendar .rbc-header {
          background: rgba(212, 175, 55, 0.1) !important;
          border-color: rgba(212, 175, 55, 0.2) !important;
          color: #FFD700 !important;
          padding: 12px 4px !important;
          font-weight: 600 !important;
        }

        .sfs-calendar .rbc-today {
          background: rgba(212, 175, 55, 0.05) !important;
        }

        .sfs-calendar .rbc-off-range-bg {
          background: rgba(255, 255, 255, 0.02) !important;
        }

        .sfs-calendar .rbc-month-view,
        .sfs-calendar .rbc-time-view {
          border-color: rgba(212, 175, 55, 0.2) !important;
        }

        .sfs-calendar .rbc-day-bg,
        .sfs-calendar .rbc-time-slot {
          border-color: rgba(212, 175, 55, 0.1) !important;
        }

        .sfs-calendar .rbc-date-cell {
          color: #cccccc !important;
          padding: 4px 8px !important;
        }

        .sfs-calendar .rbc-current .rbc-date-cell {
          color: #FFD700 !important;
          font-weight: bold !important;
        }

        .sfs-calendar .rbc-event {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        }

        .sfs-calendar .rbc-event:hover {
          filter: brightness(1.2);
          cursor: pointer;
        }

        .sfs-calendar .rbc-toolbar {
          margin-bottom: 20px !important;
          padding: 16px !important;
          background: rgba(212, 175, 55, 0.05) !important;
          border-radius: 8px !important;
        }

        .sfs-calendar .rbc-toolbar button {
          color: #FFD700 !important;
          background: rgba(212, 175, 55, 0.1) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          transition: all 0.2s !important;
        }

        .sfs-calendar .rbc-toolbar button:hover {
          background: rgba(212, 175, 55, 0.2) !important;
          border-color: rgba(212, 175, 55, 0.5) !important;
        }

        .sfs-calendar .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #FFD700 0%, #f4e5b5 100%) !important;
          color: #0a0a0a !important;
          border-color: #FFD700 !important;
        }

        .sfs-calendar .rbc-month-row {
          min-height: 80px !important;
        }
      `}</style>
    </div>
  );
}
