"use server";

import { prisma } from "@/prisma/client";
import { SessionUser } from "@/types/user";
import { Event, RegistrationStatus, Team } from "@/types/events";
import ShortUniqueId from "short-unique-id";
import { withAuth } from "@/utils/withAuth";
import { signOut } from "@/auth";

const getRegistrationStatus = withAuth(
    async (sessionUserId: string, userId: string, event: Event) => {
        try {
            if (sessionUserId !== userId) {
                signOut({
                    redirectTo: "/login",
                });
                throw new Error("Invalid session - id mismatch");
            }

            const team = await prisma.team.findFirst({
                where: {
                    eventSlug: event.slug,
                    memberIds: {
                        has: userId,
                    },
                },
                select: {
                    id: true,
                    members: true,
                    pendingMembers: true,
                    name: true,
                    leader: true,
                    eventSlug: true,
                    joiningCode: true,
                },
            });
            if (team)
                return {
                    status: RegistrationStatus.REGISTERED,
                    team,
                    pendingTeamData: null,
                };

            const pendingTeam = await prisma.team.findFirst({
                where: {
                    eventSlug: event.slug,
                    pendingMemberIds: {
                        has: userId,
                    },
                },
                select: {
                    id: true,
                    members: true,
                    name: true,
                    leader: true,
                },
            });

            const pendingTeamLeader = pendingTeam?.members.find(
                (member) => member.id === pendingTeam.leader,
            );

            if (!pendingTeam || !pendingTeamLeader)
                return {
                    status: RegistrationStatus.NOT_REGISTERED,
                    team: null,
                    pendingTeamData: null,
                };

            const pendingTeamData = {
                id: pendingTeam.id,
                name: pendingTeam.name,
                leader: {
                    name: pendingTeamLeader.name,
                    email: pendingTeamLeader.email,
                },
            };

            return {
                status: RegistrationStatus.PENDING,
                team: null,
                pendingTeamData,
            };
        } catch (err) {
            console.error(`Error while fetching registration status: ${err}`);
            return {
                status: RegistrationStatus.NOT_REGISTERED,
                team: null,
                pendingTeamData: null,
            };
        }
    },
);

const getEventFromSlug = async (slug: string) => {
    const event = await prisma.event.findFirst({
        where: {
            slug,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            minMembers: true,
            maxMembers: true,
            registrationOpen: true,
        },
    });
    return event;
};

const createTeam = withAuth(
    async (
        sessionUserId: string,
        event: Event,
        user: SessionUser,
        teamName: string,
    ) => {
        try {
            if (!event) return { ok: false, message: "Invalid event" };
            if (!event.registrationOpen)
                return { ok: false, message: "Registrations closed" };
            if (!teamName)
                return { ok: false, message: "Team Name cannot be empty" };
            if (sessionUserId !== user.id)
                throw new Error("Invalid session - id mismatch");
            const existingTeam = await prisma.team.findFirst({
                where: {
                    eventSlug: event.slug,
                    OR: [
                        { name: teamName },
                        {
                            memberIds: {
                                has: user.id,
                            },
                        },
                        {
                            pendingMemberIds: {
                                has: user.id,
                            },
                        },
                    ],
                },
                select: {
                    name: true,
                    memberIds: true,
                    pendingMemberIds: true,
                },
            });

            if (existingTeam) {
                if (existingTeam.name === teamName)
                    return { ok: false, message: "Team name already taken" };
                if (existingTeam.memberIds.includes(user.id))
                    return {
                        ok: false,
                        message: "User is already in a team for this event",
                    };
                if (existingTeam.pendingMemberIds.includes(user.id))
                    return {
                        ok: false,
                        message:
                            "User has a pending team application for this event",
                    };
            }

            const eventData = await prisma.event.findUnique({
                where: {
                    id: event.id,
                },
                select: {
                    registrationOpen: true,
                },
            });
            if (!eventData?.registrationOpen)
                return { ok: false, message: "Registrations closed" };

            const shortUid = new ShortUniqueId({ length: 6 }).rnd();
            const joiningCode = `${event.slug}_${shortUid}`;

            await prisma.team.create({
                data: {
                    name: teamName,
                    joiningCode,
                    leader: user.id,
                    eventSlug: event.slug,
                    members: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            });

            return { ok: true, message: "Team created successfully" };
        } catch (err) {
            console.error(`Error while creating team: ${err}`);
            return {
                ok: false,
                message: "Error occurred - failed to create team",
            };
        }
    },
);

const joinTeam = withAuth(
    async (
        sessionUserId: string,
        event: Event,
        user: SessionUser,
        teamCode: string,
    ) => {
        try {
            if (sessionUserId !== user.id)
                throw new Error("Invalid session - id mismatch");

            if (!event.registrationOpen)
                return { ok: false, message: "Registrations closed" };

            // check db to make sure
            const eventData = await prisma.event.findUnique({
                where: { id: event.id },
                select: { registrationOpen: true },
            });
            if (!eventData?.registrationOpen)
                return { ok: false, message: "Registrations closed" };

            const existingTeam = await prisma.team.findFirst({
                where: {
                    eventSlug: event.slug,
                    OR: [
                        { memberIds: { has: user.id } },
                        { pendingMemberIds: { has: user.id } },
                    ],
                },
                select: {
                    memberIds: true,
                    pendingMemberIds: true,
                },
            });

            if (existingTeam) {
                if (existingTeam.memberIds.includes(user.id))
                    return {
                        ok: false,
                        message: "User is already in a team for given event",
                    };
                if (existingTeam.pendingMemberIds.includes(user.id))
                    return {
                        ok: false,
                        message: "User has a pending team for given event",
                    };
            }

            const team = await prisma.team.findUnique({
                where: {
                    joiningCode: teamCode,
                    eventSlug: event.slug,
                },
                select: {
                    id: true,
                    name: true,
                    memberIds: true,
                },
            });
            if (!team) return { ok: false, message: "Invalid joining code" };
            if (team.memberIds.length >= event.maxMembers)
                return { ok: false, message: "Team full" };

            await prisma.team.update({
                where: {
                    joiningCode: teamCode,
                },
                data: {
                    pendingMembers: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            });

            return { ok: true, message: `Joined team ${team.name}` };
        } catch (err) {
            console.error(`Error while joining team: ${err}`);
            return { ok: false, message: "Error occurred" };
        }
    },
);

const transferTeamLead = withAuth(
    async (sessionUserId: string, teamId: string, newLeadId: string) => {
        try {
            const currentTeam = await prisma.team.findFirst({
                where: { id: teamId, leader: sessionUserId },
                select: { memberIds: true },
            });

            if (!currentTeam) {
                return { ok: false, message: "Team not found" };
            }

            if (!currentTeam.memberIds.includes(newLeadId)) {
                return { ok: false, message: "Member is no longer in team" };
            }

            await prisma.team.update({
                where: {
                    id: teamId,
                },
                data: {
                    leader: newLeadId,
                },
            });
            return { ok: true, message: "Changed team lead successfully!" };
        } catch (err) {
            console.error(`Error while transferring team lead: ${err}`);
            return { ok: false, message: "Error occurred" };
        }
    },
);

const removeMember = withAuth(
    async (sessionUserId: string, teamId: string, memberId: string) => {
        try {
            await prisma.team.update({
                where: {
                    id: teamId,
                    leader: sessionUserId,
                },
                data: {
                    members: {
                        disconnect: {
                            id: memberId,
                        },
                    },
                },
            });
            return { ok: true, message: "Removed member" };
        } catch (err) {
            console.error(`Error while removing member: ${err}`);
            return { ok: false, message: "Error occurred" };
        }
    },
);

const acceptPendingMember = withAuth(
    async (
        sessionUserId: string,
        teamId: string,
        memberId: string,
        event: Event,
    ) => {
        try {
            const status = await prisma.$transaction(async (txn) => {
                const team = await txn.team.findUnique({
                    where: {
                        id: teamId,
                        leader: sessionUserId,
                    },
                    select: {
                        memberIds: true,
                        pendingMemberIds: true,
                    },
                });

                if (!team) return { ok: false, message: "Invalid team" };

                if (!team.pendingMemberIds.includes(memberId))
                    return { ok: false, message: "Invalid invitation" };

                const teamSize = team?.memberIds.length;
                if (teamSize >= event.maxMembers)
                    return { ok: false, message: "Team is full" };

                const existingTeam = await txn.team.findMany({
                    where: {
                        eventSlug: event.slug,
                        memberIds: {
                            has: memberId,
                        },
                    },
                });

                if (existingTeam && existingTeam.length > 0)
                    return {
                        ok: false,
                        message: "Member is already in a team for given event",
                    };

                await txn.team.update({
                    where: {
                        id: teamId,
                    },
                    data: {
                        members: {
                            connect: {
                                id: memberId,
                            },
                        },
                        pendingMembers: {
                            disconnect: {
                                id: memberId,
                            },
                        },
                    },
                });
            });
            if (status && !status.ok) return status;
            return { ok: true, message: "Accepted member" };
        } catch (err) {
            console.error(`Error while accepting member: ${err}`);
            return {
                ok: false,
                message: "Error occurred - failed to accept member",
            };
        }
    },
);

const rejectPendingMember = withAuth(
    async (sessionUserId: string, teamId: string, memberId: string) => {
        try {
            await prisma.team.update({
                where: {
                    id: teamId,
                    leader: sessionUserId,
                },
                data: {
                    pendingMembers: {
                        disconnect: {
                            id: memberId,
                        },
                    },
                },
            });
            return { ok: true, message: "Rejected member" };
        } catch (err) {
            console.error(`Error while removing member: ${err}`);
            return { ok: false, message: "Error occurred - failed to reject" };
        }
    },
);

const deleteTeam = withAuth(async (sessionUserId: string, team: Team) => {
    try {
        const oid = { $oid: team.id };

        const existingTeam = await prisma.team.findUnique({
            where: {
                id: team.id,
                leader: sessionUserId,
            },
            select: {
                id: true,
            },
        });

        if (!existingTeam)
            return {
                ok: false,
                message: "No team found with given id and leader",
            };

        await prisma.$transaction(async (txn) => {
            await txn.$runCommandRaw({
                update: "user",
                updates: [
                    {
                        q: {
                            $or: [{ teamIds: oid }, { pendingTeamIds: oid }],
                        },
                        u: {
                            $pull: {
                                teamIds: oid,
                                pendingTeamIds: oid,
                            },
                        },
                        multi: true,
                    },
                ],
                ordered: false,
            });

            await txn.team.delete({
                where: {
                    id: team.id,
                },
            });
        });

        return { ok: true, message: "Team deleted successfully" };
    } catch (err) {
        console.error(`Error while deleting team: ${err}`);
        return { ok: false, message: "Error occurred" };
    }
});

const leaveTeam = withAuth(
    async (sessionUserId: string, teamId: string, id: string) => {
        try {
            if (sessionUserId !== id)
                throw new Error("Invalid session - id mismatch");
            await prisma.team.update({
                where: {
                    id: teamId,
                },
                data: {
                    members: {
                        disconnect: {
                            id,
                        },
                    },
                },
            });
            return { ok: true, message: "Left team successfully" };
        } catch (err) {
            console.error(`Error while leaving team: ${err}`);
            return { ok: false, message: "Error occurred" };
        }
    },
);

const leavePendingTeam = withAuth(
    async (sessionUserId: string, teamId: string, id: string) => {
        try {
            if (sessionUserId !== id)
                throw new Error("Invalid session - id mismatch");
            await prisma.team.update({
                where: {
                    id: teamId,
                },
                data: {
                    pendingMembers: {
                        disconnect: {
                            id,
                        },
                    },
                },
            });

            return { ok: true, message: "Left team successfully" };
        } catch (err) {
            console.error(`Error while leaving team: ${err}`);
            return { ok: false, message: "Error occurred" };
        }
    },
);
const editTeamName = withAuth(
    async (sessionUserId: string, teamId: string, newName: string) => {
        if (!newName)
            return { ok: false, message: "Team name cannot be empty" };
        try {
            await prisma.team.update({
                where: {
                    id: teamId,
                    leader: sessionUserId,
                },
                data: {
                    name: newName,
                },
            });
            return { ok: true, message: `Changed team name to ${newName}` };
        } catch (err) {
            console.error("Error while editing team name - ", err);
            return {
                ok: false,
                message: "Error occurred - failed to edit team name",
            };
        }
    },
);

export {
    getRegistrationStatus,
    getEventFromSlug,
    createTeam,
    joinTeam,
    transferTeamLead,
    removeMember,
    deleteTeam,
    leaveTeam,
    leavePendingTeam,
    acceptPendingMember,
    rejectPendingMember,
    editTeamName,
};
