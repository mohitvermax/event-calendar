import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Event } from '../types';
import EventModal from './EventModal';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);

  // Load events from localStorage on mount
  useEffect(() => {
    const loadEvents = () => {
      try {
        const savedEvents = localStorage.getItem('calendarEvents');
        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents);
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
      }
    };

    loadEvents();
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  }, [events]);

  // Filter events based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Add previous month's days
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month's days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatDateToString = (date: Date): string => {
    // Force date to noon to avoid timezone issues
    const safeDate = new Date(date);
    safeDate.setHours(12, 0, 0, 0);
    
    const year = safeDate.getFullYear();
    const month = String(safeDate.getMonth() + 1).padStart(2, '0');
    const day = String(safeDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddEvent = (event: Event) => {
    const newEvent = {
      ...event,
      // Keep the date as is, since it's already properly formatted in EventModal
      date: event.date
    };

    // Check for overlapping events
    const hasOverlap = events.some(existingEvent => {
      if (existingEvent.date !== newEvent.date || existingEvent.id === newEvent.id) return false;
      
      const newStart = `${newEvent.date}T${newEvent.startTime}`;
      const newEnd = `${newEvent.date}T${newEvent.endTime}`;
      const existingStart = `${existingEvent.date}T${existingEvent.startTime}`;
      const existingEnd = `${existingEvent.date}T${existingEvent.endTime}`;
      
      return (newStart < existingEnd && newEnd > existingStart);
    });

    if (hasOverlap) {
      alert('This time slot overlaps with an existing event');
      return;
    }

    if (selectedEvent) {
      // Update existing event
      setEvents(prevEvents => 
        prevEvents.map(e => e.id === selectedEvent.id ? newEvent : e)
      );
    } else {
      // Add new event
      setEvents(prevEvents => [...prevEvents, newEvent]);
    }
  };

  const handleExportEvents = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date + 'T12:00:00'); // Force noon to avoid timezone issues
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
    
    const jsonString = JSON.stringify(monthEvents, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${year}-${month + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
    setSelectedEvent(null);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date + 'T12:00:00')); // Force noon to avoid timezone issues
    setShowEventModal(true);
  };

  const handleDragStart = (event: Event, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const formattedDate = formatDateToString(date);
    
    const updatedEvent = {
      ...draggedEvent,
      date: formattedDate
    };

    setEvents(prevEvents => 
      prevEvents.map(e => e.id === draggedEvent.id ? updatedEvent : e)
    );
    setDraggedEvent(null);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateToString(date);
    return (searchTerm.trim() === '' ? events : filteredEvents)
      .filter(event => event.date === dateStr);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button onClick={handleExportEvents}>Export Month</Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                className="bg-white p-2 text-center font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {getDaysInMonth(currentDate).map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = formatDateToString(date) === formatDateToString(new Date());
              const isSelected = selectedDate && formatDateToString(date) === formatDateToString(selectedDate);
              
              const dayEvents = getEventsForDate(date);

              return (
                <div
                  key={index}
                  className={`
                    min-h-24 p-2 bg-white cursor-pointer hover:bg-gray-50
                    ${!isCurrentMonth ? 'text-gray-400' : ''}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected ? 'bg-blue-50' : ''}
                  `}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedEvent(null);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(date, e)}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{date.getDate()}</span>
                    {isCurrentMonth && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(date);
                          setSelectedEvent(null);
                          setShowEventModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                        className={`
                          text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80
                          ${event.color === 'work' ? 'bg-blue-100 text-blue-800' :
                            event.color === 'personal' ? 'bg-green-100 text-green-800' :
                            event.color === 'other' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-75">{event.startTime} - {event.endTime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          date={selectedDate!}
          event={selectedEvent}
          onSave={handleAddEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default Calendar;