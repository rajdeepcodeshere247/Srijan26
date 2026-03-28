// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const EVENTS_TO_SEED = [
//     { slug: "lotr", name: "Lord of The Ring : Season 3", minMembers: 3, maxMembers: 5 },
//     { slug: "traffiq", name: "TraffIQ", minMembers: 2, maxMembers: 5 },
//     { slug: "mathemagician", name: "Math-E-Magician", minMembers: 2, maxMembers: 2 },
//     { slug: "epoch", name: "Epochalypse", minMembers: 3, maxMembers: 3 },
//     { slug: "h42", name: "H42", minMembers: 1, maxMembers: 3 },
//     { slug: "sherlocked", name: "Sherlocked", minMembers: 3, maxMembers: 3 },
//     { slug: "cypher3331", name: "Cypher 3331", minMembers: 3, maxMembers: 3 },
//     { slug: "ss3", name: "Snap Syntax 3.0", minMembers: 2, maxMembers: 4 },
//     { slug: "indx", name: "INDUSTRIX", minMembers: 4, maxMembers: 4 },
//     { slug: "sv1", name: "System Vanguard", minMembers: 3, maxMembers: 3 },
//     { slug: "death_race", name: "Death Race", minMembers: 1, maxMembers: 4 },
//     { slug: "CC", name: "CONTROL-CRAFT", minMembers: 4, maxMembers: 4 },
//     { slug: "RR", name: "ROPE RUNNER", minMembers: 4, maxMembers: 4 },
//     { slug: "btg26", name: "Bridge The Gap", minMembers: 2, maxMembers: 4 },
//     { slug: "caseomania", name: "CASE O MANIA", minMembers: 2, maxMembers: 3 },
//     { slug: "ptb", name: "Pass the Baton", minMembers: 3, maxMembers: 3 },
//     { slug: "XSTREAM", name: "XSTERAM", minMembers: 1, maxMembers: 4 },
//     { slug: "h4g", name: "HackForge", minMembers: 4, maxMembers: 4 },
//     { slug: "uncode", name: "Uncode", minMembers: 1, maxMembers: 2 },
//     { slug: "arena-valorant", name: "NSG ARENA x VALORANT", minMembers: 5, maxMembers: 5 },
//     { slug: "arena-eafc", name: "NSG ARENA x EAFC", minMembers: 1, maxMembers: 1 },
//     { slug: "openaimer", name: "OpenAImer", minMembers: 1, maxMembers: 4 },
//     { slug: "arena-bgmi", name: "NSG ARENA x BGMI", minMembers: 4, maxMembers: 4 },
//     { slug: "cr", name: "CLASH ROYALE", minMembers: 1, maxMembers: 1 },
//     { slug: "uec-valorant", name: "NSG UEC x VALORANT", minMembers: 5, maxMembers: 5 },
//     { slug: "uec-bgmi", name: "NSG UEC x BGMI", minMembers: 4, maxMembers: 4 },
//     { slug: "uec-eafc", name: "NSG UEC x EAFC", minMembers: 1, maxMembers: 1 },
//     { slug: "uec-wtec", name: "NSG UEC x WTEC", minMembers: 1, maxMembers: 1 },
//     { slug: "vrexp", name: "VR EXPERIENCE ZONE", minMembers: 1, maxMembers: 1 },
//     { slug: "thunderbolts_voltedged", name: "THUNDERBOLTS VOLTEDGED", minMembers: 3, maxMembers: 4 },
//     { slug: "datadrift26", name: "Data Drift", minMembers: 1, maxMembers: 2 },
//     { slug: "ace-the-case", name: "Ace The Case", minMembers: 2, maxMembers: 4 },
//     { slug: "biznez-plan", name: "Biznez Plan", minMembers: 2, maxMembers: 4 },
//     { slug: "stratedgex", name: "StratEdgeX", minMembers: 1, maxMembers: 4 },
//     { slug: "pkv", name: "Pack-o-vation", minMembers: 2, maxMembers: 4 },
//     { slug: "sks", name: "SKYSPRINT", minMembers: 2, maxMembers: 3 },
//     { slug: "clo", name: "Climb On", minMembers: 1, maxMembers: 1 },
//     { slug: "jal", name: "Jal Astra", minMembers: 2, maxMembers: 3 },
//     { slug: "hcg", name: "Homecoming", minMembers: 4, maxMembers: 5 },
//     { slug: "rbs", name: "Robosoccer", minMembers: 3, maxMembers: 5 },
//     { slug: "capitalclash", name: "CAPITAL CLASH", minMembers: 3, maxMembers: 3 },
//     { slug: "er", name: "Escape Room", minMembers: 3, maxMembers: 4 },
//     { slug: "h2h", name: "Highway to Hell", minMembers: 3, maxMembers: 5 },
//     { slug: "justdefy", name: "Just Defy", minMembers: 1, maxMembers: 1 },
//     { slug: "btm", name: "Beat the Market", minMembers: 1, maxMembers: 1 },
//     { slug: "cc", name: "Cold Case", minMembers: 1, maxMembers: 1 },
//     { slug: "iotbw", name: "IoT BIDWARS", minMembers: 2, maxMembers: 3 },
//     { slug: "djk", name: "DANK JUNK", minMembers: 1, maxMembers: 1 },
//   { slug: "rat", name: "Reel-a-tion", minMembers: 2, maxMembers: 4 },
//   { slug: "pixellense", name: "Pixellense", minMembers: 1, maxMembers: 1 },
//   { slug: "qtp", name: "Quizotopia", minMembers: 3, maxMembers: 3 },
//   { slug: "efootball", name: "eFootball", minMembers: 1, maxMembers: 1 },
//   { slug: "celestia", name: "Celestia", minMembers: 1, maxMembers: 1 },
// ];

// async function main() {
//     console.log("Seeding Events...");

//     for (const event of EVENTS_TO_SEED) {
//         await prisma.event.upsert({
//             where: { slug: event.slug },
//             update: {
//                 name: event.name,
//                 minMembers: event.minMembers,
//                 maxMembers: event.maxMembers,
//                 isVisible: true,
//                 registrationOpen: true,
//             },
//             create: {
//                 slug: event.slug,
//                 name: event.name,
//                 minMembers: event.minMembers,
//                 maxMembers: event.maxMembers,
//                 isVisible: true,
//                 registrationOpen: true,
//             },
//         });
//     }

//     console.log(`Successfully seeded ${EVENTS_TO_SEED.length} events.`);
// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
