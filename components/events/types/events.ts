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

export type EventLinkIcon =
  | "drive"
  | "pdf"
  | "whatsapp"
  | "unstop"
  | "form"
  | "video"
  | "github"
  | "link";

export interface Coordinator {
  name: string;
  contact: string;
}

export interface SubmissionLink {
  label: string;
  url: string;
}

export interface EventLink {
  label: string;
  url: string;
  icon?: EventLinkIcon;
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
  coordinators: Coordinator[];

  // General purpose links (drive, unstop, whatsapp, etc.)
  eventLinks?: EventLink[];

  // Structured submission section
  submissionNote?: string;
  submissionLinks?: SubmissionLink[];

  /** @deprecated use eventLinks with icon: "drive" */
  driveLink?: string;
  /** @deprecated use eventLinks with icon: "pdf" */
  pdfLink?: string;
  /** @deprecated use eventLinks with icon: "unstop" */
  unstopLink?: string;
  /** @deprecated use eventLinks with icon: "whatsapp" */
  whatsappLink?: string;

  // --- State ---
  status: EventStatus;
}