"use client";

import { useConfirmationDialogContext } from "@/hooks/useConfirmationDialog";
import { leaveTeam } from "@/services/EventsService";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import { Clickable } from "../Clickable";

function LeaveTeam({ teamId, id, registrationOpen }: { teamId: string; id: string; registrationOpen: boolean | undefined; }) {
    const modalContext = useConfirmationDialogContext();
    const router = useRouter();
    
    if(!registrationOpen) return;

    const handleLeaveTeam = () => {
        modalContext.showDialog("Are you sure you want to leave this team?", () => {
            leaveTeam(teamId, id)
            .then(res => {
                if(res.ok){
                    toast.success(res.message);
                    router.refresh();
                }else{
                    toast.error(res.message);
                }
            })
        });
    };
    return (
        <div className="p-4 border-t border-t-gray-200/30 w-full grid place-items-center">
            <Clickable
                as="button"
                className="bg-red hover:bg-red/70 active:bg-red/40"
                onClick={() => handleLeaveTeam()}
            >
                Leave Team
            </Clickable>
        </div>
    );
}

export default LeaveTeam;
