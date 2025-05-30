import { ExchangeService, ExchangeVersion, WebCredentials, DateTime, CalendarView, Uri, WellKnownFolderName, AttendeeCollection, AppointmentSchema, PropertySet, ItemId, Mailbox, FolderId } from 'ews-javascript-api';
import { CalendarEvent, Person } from '../types/calendar';
import { ExchangeConfig } from '../types/config';

export class ExchangeCalendarService {
  private service: ExchangeService;
  private emailDomain: string;

  constructor(config: ExchangeConfig) {
    const { url, username, password } = config;
    this.service = new ExchangeService(ExchangeVersion.Exchange2013);
    this.service.Url = new Uri(url);
    this.service.Credentials = new WebCredentials(username, password);
    this.emailDomain = config.emailDomain;
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
      AppointmentSchema.Body,
      AppointmentSchema.StartTimeZone,
      AppointmentSchema.Organizer,
      AppointmentSchema.Categories
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
      description: appointment.Body.Text || '',
      timezone: appointment.StartTimeZone.Name,
      organizer: {
        email: appointment.Organizer.Address,
        fullName: appointment.Organizer.Name
      },
      category: appointment.Categories?.items?.join(', ') || ''
    };
  }

  async getEventsForDate(date: Date, username?: string): Promise<CalendarEvent[]> {
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

      let calendarItems;
      if (username) {
        // Create a mailbox object for the target user
        const mailbox = new Mailbox(username + this.emailDomain);
        // Create a folder ID for the calendar
        const folderId = new FolderId(WellKnownFolderName.Calendar, mailbox);
        // Get the calendar items from the specified user's calendar
        calendarItems = await this.service.FindAppointments(
          folderId,
          calendarView
        );
      } else {
        // Get the calendar items from the current user's calendar
        calendarItems = await this.service.FindAppointments(
          WellKnownFolderName.Calendar,
          calendarView
        );
      }

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