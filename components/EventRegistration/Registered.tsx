import { SessionUser } from "@/types/user";
import { Event, Team } from "@/types/events";
import React from "react";
import { EditTeamName, TeamControls } from "./TeamControls";
import NotRegistered from "./NotRegistered";
import MemberControls from "./MemberControls";
import LeaveTeam from "./LeaveTeam";
import Balls from "../Balls";
import PendingMemberControls from "./PendingMemberControls";
import { EVENTS_DATA } from "@/data/eventsList";
import Link from "next/link";
import Image from "next/image";
import WhatsappIcon from "../ui/whatsapp-icon";

function Registered({
    user,
    event,
    team,
}: {
    user: SessionUser;
    event: Event;
    team: Team | null;
}) {
    if (!team) return <NotRegistered user={user} event={event} />;
    const isTeamLead = team.leader === user.id;
    const eventData = EVENTS_DATA.find((data) => data.slug === event.slug);

    let status: string;
    if (team.members.length === event.maxMembers) status = "Team full";
    else if (team.members.length >= event.minMembers) status = "Valid";
    else status = "Not enough members";

    return (
        <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[80vh] py-6">
            <Balls />
            <h1 className="text-4xl sm:text-5xl font-semibold font-elnath text-yellow text-center">
                {event.name} Registration
            </h1>
            {/* Unstop Link if needed */}
            {eventData && eventData.unstopLink && (
                <div className="mb-4 flex flex-col items-center w-full gap-y-3">
                    <p className="text-sm sm:text-base w-4/5 text-center">
                        Prelims will be held on Unstop, so registration on the
                        platform is required.
                    </p>
                    <Link href={eventData.unstopLink} target="_blank">
                        <Image
                            src={"/Unstop-Logo-White-Small.png"}
                            width={85}
                            height={50}
                            className="bg-blue-900 p-2 rounded-sm hover:bg-blue-800 transition-colors duration-200"
                            alt="Unstop Logo"
                        />
                    </Link>
                </div>
            )}
            <div className="flex flex-col sm:flex-row w-full justify-around gap-y-12">
                <div className="flex sm:w-2/3 flex-col items-center">
                    <div className="w-full sm:w-3/4 mb-3 border border-yellow/30 rounded-sm p-2 flex justify-between items-center gap-3">
                        <h4 className="text-xl font-bold tracking-tight text-white">
                            {team?.name}
                        </h4>
                        {isTeamLead && (
                            <EditTeamName teamId={team.id} />
                        )}
                    </div>
                    <h6 className="mb-2 text-yellow">Members</h6>
                    <div className="hidden sm:flex w-full sm:w-3/4 justify-between rounded-t-sm border-b border-gray-300/30 bg-gray-600/30 px-4 py-2 transition-colors duration-300">
                        <p>Name</p>
                        <p>Email</p>
                    </div>
                    {team?.members.map((member) => (
                        <div
                            key={member.id}
                            className="grid w-full sm:w-3/4 grid-cols-2 gap-y-2 border-b border-t sm:border-t-0 border-gray-300/30 px-4 py-2 transition-colors duration-300 hover:bg-gray-400/10"
                        >
                            <p className="sm:hidden">Name </p>
                            <p>
                                {member.name}{" "}
                                {member.id === team.leader && "(Team Lead)"}
                            </p>
                            <p className="sm:hidden">Email</p>
                            <p className="justify-self-end">{member.email}</p>
                            {isTeamLead && member.id !== team.leader && (
                                <MemberControls
                                    memberId={member.id!}
                                    memberName={member.name}
                                    teamId={team.id}
                                />
                            )}
                        </div>
                    ))}
                    {isTeamLead && team.pendingMembers.length !== 0 && (
                        <>
                            <h6 className="my-2 text-yellow">
                                Pending Members
                            </h6>
                            <div className="hidden sm:flex w-full sm:w-3/4 justify-between rounded-t-sm border-b border-gray-300/30 bg-gray-600/30 px-4 py-2 transition-colors duration-300">
                                <p>Name</p>
                                <p>Email</p>
                            </div>
                            {team?.pendingMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="grid w-full sm:w-3/4 grid-cols-2 gap-y-2 border-b border-t sm:border-t-0 border-gray-300/30 px-4 py-2 transition-colors duration-300 hover:bg-gray-400/10"
                                >
                                    <p className="sm:hidden">Name </p>
                                    <p>{member.name}</p>
                                    <p className="sm:hidden">Email</p>
                                    <p className="justify-self-end">
                                        {member.email}
                                    </p>
                                    {isTeamLead && (
                                        <PendingMemberControls
                                            memberId={member.id!}
                                            memberName={member.name}
                                            teamId={team.id}
                                            event={event}
                                        />
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <div className="flex w-full sm:w-1/3 flex-col items-center gap-3">
                    <h3
                        className={`rounded-xs border ${status === "Not enough members" ? "border-amber-500 bg-amber-500/30" : "border-green-500 bg-green-500/30"} px-2 py-1`}
                    >
                        Status: {status}
                    </h3>
                    {event.minMembers === event.maxMembers ? (
                        <p>Allowed Team Size: {event.minMembers} member(s)</p>
                    ) : (
                        <p>
                            Allowed Team Size: {event.minMembers} -{" "}
                            {event.maxMembers} members
                        </p>
                    )}
                    <p>Current Team Size: {team?.members.length}</p>
                    {eventData && eventData.whatsappLink && (
                        <Link
                            href={eventData.whatsappLink}
                            target="_blank"
                            className="bg-green-600 hover:bg-green-500 transition-colors duration-200 text-white py-1 px-3 rounded-xs flex items-center gap-2"
                        >
                            <WhatsappIcon />
                            Whatsapp Group
                        </Link>
                    )}
                    {isTeamLead ? (
                        <TeamControls team={team} event={event} />
                    ) : (
                        <LeaveTeam teamId={team.id} id={user.id} registrationOpen={event.registrationOpen} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Registered;
