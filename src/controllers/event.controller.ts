import { Request, Response } from "express";
import { EventService } from "../services/event.service";

const eventService = new EventService();

export class EventController {

  // ---------------- CREATE ----------------
  async create(req: Request, res: Response) {
    try {
      const { EventName } = req.body;

      if (!EventName) {
        return res.status(400).json({
          success: false,
          message: "EventName is required"
        });
      }

      const event = await eventService.createEvent({ EventName });

      return res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: event
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Server error"
      });
    }
  }

  // ---------------- GET ALL ----------------
  async getAll(req: Request, res: Response) {
    try {
      const events = await eventService.getAllEvents();

      return res.status(200).json({
        success: true,
        data: events
      });

    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Server error"
      });
    }
  }

  // ---------------- GET LATEST ----------------
  async getLatest(req: Request, res: Response) {
    try {
      const event = await eventService.getLatestEvent();

      return res.status(200).json({
        success: true,
        data: event
      });

    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Event not found"
      });
    }
  }

  // ---------------- UPDATE ----------------
  async update(req: Request, res: Response) {
    try {

      let id = req.params.id;
        if (Array.isArray(id)) {
        id = id[0];
      }

      const { EventName } = req.body;


      if (!EventName) {
        return res.status(400).json({
          success: false,
          message: "EventName is required"
        });
      }

      const updatedEvent = await eventService.updateEvent(id, { EventName });

      return res.status(200).json({
        success: true,
        message: "Event updated successfully",
        data: updatedEvent
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Unable to update event"
      });
    }
  }

  // ---------------- DELETE ----------------
  async delete(req: Request, res: Response) {
    try {

      let id = req.params.id;
      if (Array.isArray(id)) {
      id = id[0];
    }

     await eventService.deleteEvent(id);

      return res.status(200).json({
        success: true,
        message: "Event deleted successfully"
      });

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Unable to delete event"
      });
    }
  }
}
