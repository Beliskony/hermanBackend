import { Event, IEvent } from "../interfaces/IEvent";
import { Types } from "mongoose";

export class EventService {

  // ---------------- CREATE ----------------
  async createEvent(data: IEvent) {
    try {
      const event = new Event(data);
      await event.save();
      return event;
    } catch (error) {
      console.error("Create Event Error:", error);
      throw new Error("Unable to create event");
    }
  }

  // ---------------- GET ALL ----------------
  async getAllEvents() {
    try {
      return await Event.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error("Get All Events Error:", error);
      throw new Error("Unable to fetch events");
    }
  }

 // -------- GET LATEST EVENT --------
  async getLatestEvent() {
    const event = await Event
      .findOne()
      .sort({ createdAt: -1 }); // ⬅️ le plus récent

    if (!event) {
      throw new Error("No event found");
    }

    return event;
  }


  // ---------------- UPDATE ----------------
  async updateEvent(eventId: string, data: Partial<IEvent>) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event ID");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      data,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      throw new Error("Event not found");
    }

    return updatedEvent;
  }

  // ---------------- DELETE ----------------
  async deleteEvent(eventId: string) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event ID");
    }

    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      throw new Error("Event not found");
    }

    return deletedEvent;
  }
}
