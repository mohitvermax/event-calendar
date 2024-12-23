
export interface Event {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    date: string;
    color?: 'default' | 'work' | 'personal' | 'other';
  }
  
  export interface DayProps {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    events: Event[];
    onSelectDate: (date: Date) => void;
    onAddEvent: (date: Date) => void;
  }
  
  export interface CalendarProps {
    events: Event[];
    onAddEvent: (event: Event) => void;
    onEditEvent: (event: Event) => void;
    onDeleteEvent: (eventId: string) => void;
  }
  
  export interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event?: Event | null;
    date?: Date;
    onSave: (event: Event) => void;
    onDelete?: (eventId: string) => void;
  }




