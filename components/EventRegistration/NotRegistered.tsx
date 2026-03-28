"use client";

import { SessionUser } from "@/types/user";
import { Event } from "@/types/events";
import React, { useState } from "react";
import { createTeam, joinTeam } from "@/services/EventsService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Clickable } from "../Clickable";
import Balls from "../Balls";

function NotRegistered({ user, event }: { user: SessionUser; event: Event }) {
    const router = useRouter();
    const [teamName, setTeamName] = useState("");
    const [teamCode, setTeamCode] = useState("");
    const [loading, setLoading] = useState(false);

    // NEW: Function to create and save the notification to localStorage
    const createSuccessNotification = (action: "created" | "joined") => {
        const newNotification = {
            id: `reg-${Date.now()}`,
            // Assuming your Event type has a slug. If not, remove the slug line.
            slug: (event as any).slug || "", 
            title: "Registration Successful! 🎉",
            category: "System",
            color: "#4ade80", // Success green
            description: `You have successfully ${action} a team for ${event.name}. Best of luck!`,
            createdAt: new Date().toISOString(),
            isNew: true,
            link: "", // Empty so it hides the "Register" button
        };

        // Grab existing local notifications, add the new one to the front, and save it back
        const existingNotes = JSON.parse(localStorage.getItem("local_notifications") || "[]");
        localStorage.setItem("local_notifications", JSON.stringify([newNotification, ...existingNotes]));
    };

    const handleCreateTeam = (e: React.FormEvent) => {
        if(!teamName){
            toast.error("Team Name cannot be empty");
            return;
        }
        e.preventDefault();
        setLoading(true);
        createTeam(event, user, teamName)
            .then((res) => {
                if (res.ok) {
                    createSuccessNotification("created"); // <-- Fires on success!
                    router.refresh();
                } else toast.error(res.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleJoinTeam = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        joinTeam(event, user, teamCode)
            .then((res) => {
                if (res.ok) {
                    createSuccessNotification("joined"); // <-- Fires on success!
                    router.refresh();
                } else toast.error(res.message);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 h-full min-h-[80vh]">
            <Balls />
            <h1 className="text-4xl sm:text-5xl font-semibold font-elnath text-yellow mb-8 text-center">
                {event.name} Registration
            </h1>
            <div className="flex flex-col items-center gap-5 w-full">
                <h4 className="text-xl">Create a new team</h4>
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => {
                        setTeamName(e.target.value);
                    }}
                    className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full sm:w-1/3 2xl:w-1/4"
                />
                <Clickable
                    as="button"
                    onClick={(e) => {
                        handleCreateTeam(e);
                    }}
                    disabled={loading}
                    className="bg-red hover:bg-red/70 active:bg-red/40"
                >
                    Create Team
                </Clickable>
            </div>
            {   (event.maxMembers > 1) && 
                <>
                    <div className="flex w-full sm:w-2/5 items-center justify-between gap-6">
                        <div className="h-px w-full bg-linear-to-r from-red to-orange"></div>
                        <p>OR</p>
                        <div className="h-px w-full bg-linear-to-l from-red to-orange"></div>
                    </div>
                    <div className="flex flex-col items-center gap-5 w-full">
                        <h4 className="text-xl">Join an existing team</h4>
                        <input
                            type="text"
                            placeholder="Joining Code"
                            value={teamCode}
                            onChange={(e) => {
                                setTeamCode(e.target.value);
                            }}
                            className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full sm:w-1/3 2xl:w-1/4"
                        />
                        <Clickable
                            as="button"
                            onClick={(e) => {
                                handleJoinTeam(e);
                            }}
                            disabled={loading}
                            className="bg-red hover:bg-red/70 active:bg-red/40"
                        >
                            Join Team
                        </Clickable>
                    </div>
                </>
            }
        </div>
    );
}

export default NotRegistered;