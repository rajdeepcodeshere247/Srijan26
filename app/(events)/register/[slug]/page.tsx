import { checkAuthentication } from "@/services/AuthService";
import {
  getEventFromSlug,
  getRegistrationStatus,
} from "@/services/EventsService";
import NotRegistered from "@/components/EventRegistration/NotRegistered";
import Registered from "@/components/EventRegistration/Registered";
import NotFound from "@/components/NotFound";
import { RegistrationStatus } from "@/types/events";
import Pending from "@/components/EventRegistration/Pending";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await getEventFromSlug(slug);
  console.log(event)
  if (!event) return <NotFound />;

  const user = await checkAuthentication(`/register/${slug}`);
  const registrationStatus = await getRegistrationStatus(user.id, event);

  if (registrationStatus.status === RegistrationStatus.REGISTERED) return <Registered user={user} event={event} team={registrationStatus.team} />;
  else if (registrationStatus.status === RegistrationStatus.PENDING) return <Pending teamData={registrationStatus.pendingTeamData} eventName={event.name} registrationOpen={event.registrationOpen} userId={user.id} />;
  else return <NotRegistered user={user} event={event} />;
}
