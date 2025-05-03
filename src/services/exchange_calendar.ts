import { ExchangeService, ExchangeVersion, WebCredentials, DateTime, CalendarView, Uri, WellKnownFolderName, AttendeeCollection, AppointmentSchema, PropertySet, ItemId } from 'ews-javascript-api';
import { CalendarEvent, Person } from '../types/calendar';
import { ExchangeConfig } from '../types/config';

export class ExchangeCalendarService {
  private service: ExchangeService;

  constructor(config: ExchangeConfig) {
    const { url, username, password } = config;
    this.service = new ExchangeService(ExchangeVersion.Exchange2013);
    this.service.Url = new Uri(url);
    this.service.Credentials = new WebCredentials(username, password);
  }

  private getAttendees(attendees: AttendeeCollection): Person[] {
    return Array.from(attendees.GetEnumerator()).map((attendee) => ({
      email: attendee.Address,
      fullName: attendee.Name
    }));
  }

  private async fetchCalendarItem(itemId: string): Promise<CalendarEvent> {
    const propertySet = new PropertySet(
      AppointmentSchema.Subject,
      AppointmentSchema.Start,
      AppointmentSchema.End,
      AppointmentSchema.RequiredAttendees,
      AppointmentSchema.OptionalAttendees,
      AppointmentSchema.Body
    );

    const itemIdObj = new ItemId(itemId);
    const response = await this.service.BindToItems([itemIdObj], propertySet);
    const appointment = response.Responses[0].Item as any;

    return {
      id: appointment.Id.UniqueId,
      title: appointment.Subject,
      startTime: appointment.Start.ToISOString(),
      endTime: appointment.End.ToISOString(),
      participants: [
        ...this.getAttendees(appointment.RequiredAttendees),
        ...this.getAttendees(appointment.OptionalAttendees)
      ],
      description: ''
    };
  }

  async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
    try {
      // Create a calendar view for the entire day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const calendarView = new CalendarView(
        DateTime.Parse(startDate.toISOString()),
        DateTime.Parse(endDate.toISOString())
      );

      // Get the calendar items
      const calendarItems = await this.service.FindAppointments(
        WellKnownFolderName.Calendar,
        calendarView
      );

      console.log('Calendar items loaded:', calendarItems.Items.length);

      // Load full details for each item
      const events = await Promise.all(
        calendarItems.Items.map(item => this.fetchCalendarItem(item.Id.UniqueId))
      );

      return events;
    } catch (error) {
      console.error('Error fetching Exchange calendar events:', error);
      throw error;
    }
  }
} 