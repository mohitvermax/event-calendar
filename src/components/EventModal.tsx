import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Event, EventModalProps } from '../types';

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  date,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [startTime, setStartTime] = useState(event?.startTime || '09:00');
  const [endTime, setEndTime] = useState(event?.endTime || '10:00');
  const [description, setDescription] = useState(event?.description || '');
  const [color, setColor] = useState(event?.color || 'default');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setDescription(event.description || '');
      setColor(event.color || 'default');
    } else {
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
      setColor('default');
    }
  }, [event]);

  const formatDateToLocalISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) return;

    const formattedDate = formatDateToLocalISO(date);
    
    const newEvent: Event = {
      id: event?.id || Math.random().toString(36).substr(2, 9),
      title,
      startTime,
      endTime,
      description,
      date: formattedDate,
      color: color as Event['color']
    };

    onSave(newEvent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Add Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button type="submit">
              {event ? 'Update Event' : 'Add Event'}
            </Button>
            {event && onDelete && (
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  onDelete(event.id);
                  onClose();
                }}
              >
                Delete Event
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;