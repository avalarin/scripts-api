export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participants: Person[];
  description: string;
} 

export interface Person {
  email: string;
  fullName: string;
}