export type Category =
  | "All"
  | "Coding"
  | "Circuits and Robotics"
  | "Business"
  | "Brainstorming"
  | "Gaming"
  | "Esports"
  | "Special Attractions"
  | "Misc";

export type EventStatus = "All" | "Open" | "Closed";

export interface Coordinator {
  name: string;
  contact: string;
}

export interface Event {
  // --- Core Metadata ---
  id: string;
  slug: string;
  title: string;
  category: Category;
  color: string;
  description: string;
  image: string;
  tags: string[];

  // --- Event Details & Rules ---
  format: string;
  teamSize: string;
  rules: string[];
  scoring?: string[];
  eventFormat?: string[];

  // --- Schedule & Dates ---
  lastDate: string;
  prelimsDate?: string;
  finalsDate?: string;

  // --- Prizes ---
  prizePool?: string;
  winnerPrize?: string;
  runnersUpPrize?: string;
  secondRunnersUpPrize?: string;
  andMore?: boolean;
  prizeDetails?: string[];

  // --- Links & Contacts ---
  link: string;
  driveLink?: string;
  pdfLink?: string;
  coordinators: Coordinator[];
  
  // post registration links
  unstopLink?: string;
  whatsappLink?: string;

  // --- State ---
  status: EventStatus;
}
