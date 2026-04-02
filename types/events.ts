import { EventListing } from "@prisma/client";
import type { User } from "./user";

type Event = {
    slug: string;
    id: string;
    name: string;
    minMembers: number;
    maxMembers: number;
    registrationOpen?: boolean;
};

type Team = {
    id: string;
    name: string;
    leader: string;
    members: User[];
    pendingMembers: User[];
    eventSlug: string;
    joiningCode: string;
};

enum RegistrationStatus {
    REGISTERED = "REGISTERED",
    PENDING = "PENDING",
    NOT_REGISTERED = "NOT_REGISTERED",
}

type EventCategory =
  ""
  | "Coding"
  | "Circuits and Robotics"
  | "Business"
  | "Brainstorming"
  | "Gaming"
  | "E-Sports"
  | "Special Attractions"
  | "Miscellaneous";

type StringObj = {
  value: string;
}

type EventPageData = {
  name: string;
  slug: string;
  minMembers: number;
  maxMembers: number;
  isVisible?: boolean;
  registrationOpen?: boolean;
  registrationDeadline: Date;
  eventListingData: EventListing | null
}

type EventFormType = {
  name: string;
  slug: string;
  minMembers: string;
  maxMembers: string;
  category: EventCategory;
  description: string;
  format: string;
  driveLink: string | null;
  rules: StringObj[];
  prizes: StringObj[];
  registrationDeadline: string;
  eventDates: StringObj[];
  coordinators: StringObj[];
  prizePool: string;
  tags: StringObj[];
  registrationLink: string | null;
}

export type { EventPageData, EventCategory, EventFormType, Event, Team, StringObj };
export { RegistrationStatus };