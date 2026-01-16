import { Request, Response } from "express";
import { PollService } from "../services/poll.service";

const pollService = new PollService();

export const createPoll = async (req: Request, res: Response) => {
  try {
    const poll = await pollService.create(req.body);
    res.status(201).json(poll);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getPolls = async (_req: Request, res: Response) => {
  const polls = await pollService.getAll();
  res.json(polls);
};

export const getPollsByEvent = async (req: Request, res: Response) => {
  try {
    const eventName = req.params.eventName;

    if (typeof eventName !== "string") {
      return res.status(400).json({ message: "Invalid event name" });
    }

    const polls = await pollService.getByEventName(eventName);
    res.json(polls);
  } catch (error) {
    
  }
};

export const deletePoll = async (req: Request, res: Response) => {
  try {
    const id = req.params.id

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid poll id" });
    }

    await pollService.deleteById(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
