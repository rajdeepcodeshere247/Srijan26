'use client';

import React from "react";
import NotFound from "../NotFound";
import Balls from "../Balls";
import { Clickable } from "../Clickable";
import { useConfirmationDialogContext } from "@/hooks/useConfirmationDialog";
import { leavePendingTeam } from "@/services/EventsService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type PendingTeamData = {
    id: string;
    name: string;
    leader: {
        name: string;
        email: string;
    };
};

function Pending({
    teamData,
    eventName,
    userId,
    registrationOpen
}: {
    teamData: PendingTeamData | null;
    eventName: string;
    userId: string;
    registrationOpen: boolean;
}) {
    const modalContext = useConfirmationDialogContext();
    const router = useRouter();
    if (!teamData) return <NotFound />;

    const handleLeaveTeam = () => {
        modalContext.showDialog("Are you sure you want to leave the team?", () => {
            leavePendingTeam(teamData.id, userId)
            .then(res => {
                if(res.ok){
                    toast.success("Left Team");
                }else{
                    toast.error("Error in leaving team");
                }
                router.refresh();
            })
        });
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[80vh] py-6">
            <Balls />
            <h1 className="text-4xl sm:text-5xl font-semibold font-elnath text-yellow mb-8 text-center">
                {eventName} Registration
            </h1>
            <h2 className="text-center text-3xl">
                Your Registration is Pending.
            </h2>
            <div className="flex flex-col items-center">
                <h3 className="text-yellow text-2xl">Team Name</h3>
                <p>{teamData.name}</p>
            </div>
            <h4 className="text-center">
                The Team Lead must accept your application to join the team.
            </h4>
            <div className="flex flex-col gap-y-1 border border-gray-300/30 bg-gray-600/30 py-2 px-2 sm:px-8 rounded-sm">
                <h6 className="text-yellow text-xl text-center">
                    Team Lead Details
                </h6>
                <p>Name: {teamData.leader.name}</p>
                <p>Email: {teamData.leader.email}</p>
            </div>
            {registrationOpen && 
                <Clickable as="button" className="bg-red hover:bg-red/70 active:bg-red/40" onClick={() => handleLeaveTeam()}>
                    Leave Team
                </Clickable>
            }
        </div>
    );
}

export default Pending;
