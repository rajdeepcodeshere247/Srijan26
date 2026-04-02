"use client";

import { useConfirmationDialogContext } from "@/hooks/useConfirmationDialog";
import { deleteTeam, editTeamName } from "@/services/EventsService";
import { Event, Team } from "@/types/events";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Clickable } from "../Clickable";
import { useRef, useState } from "react";

function TeamControls({ team, event }: { team: Team; event: Event }) {
    const modalContext = useConfirmationDialogContext();
    const router = useRouter();

    const handleCopyCode = () => {
        navigator.clipboard
            .writeText(team.joiningCode)
            .then(() => toast.success("Copied Joining Code"));
    };

    const handleDeleteTeam = () => {
        modalContext.showDialog(
            "Are you sure you want to delete this team?",
            () => {
                deleteTeam(team).then((res) => {
                    if (res.ok) {
                        toast.success(res.message);
                        router.refresh();
                    } else {
                        toast.error(res.message);
                    }
                });
            },
        );
    };

    return (
        <div className="flex w-full flex-col items-center gap-4">
            {event.maxMembers > 1 && (
                <div className="flex flex-col items-center gap-4 border-t border-b border-gray-200/30 p-4">
                    <p>Team Joining Code</p>
                    <div className="flex w-fit items-center justify-between gap-12 rounded-sm bg-gray-200/10 py-1.5 pr-2 pl-4 text-center">
                        <span>{team.joiningCode}</span>
                        <button
                            className="cursor-pointer rounded-sm border border-white/20 bg-black/80 px-2 py-1 text-sm transition-colors duration-200 hover:border-white/40 active:border-white/60"
                            onClick={() => handleCopyCode()}
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
            {event.registrationOpen && (
                <Clickable
                    as="button"
                    className="bg-red hover:bg-red/70 active:bg-red/40"
                    onClick={() => handleDeleteTeam()}
                >
                    Delete Team
                </Clickable>
            )}
        </div>
    );
}

function EditTeamName({ teamId }: { teamId: string }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [name, setName] = useState("");
    const router = useRouter();

    const handleSubmit = () => {
        editTeamName(teamId, name).then((res) => {
            dialogRef.current?.close();
            if (res.ok) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        });
    };
    return (
        <>
            <button
                onClick={() => dialogRef.current?.showModal()}
                className="border border-red-400 px-4 py-3 tracking-wide text-white transition-colors hover:bg-red-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Edit Team Name
            </button>
            <dialog
                ref={dialogRef}
                onClick={(e) => {
                    // Close modal when clicking on backdrop
                    if (e.target === dialogRef.current) {
                        dialogRef.current.close();
                    }
                }}
                className="fixed top-1/2 left-1/2 z-300 w-full -translate-x-1/2 -translate-y-1/2 border border-white/20 bg-black p-0 backdrop:bg-black/80 sm:w-1/3"
            >
                <div className="flex flex-col items-center gap-4 p-6 text-white">
                    <h1 className="text-3xl font-semibold">Edit Team Name</h1>
                    <input
                        type="text"
                        name="name"
                        placeholder="New Team Name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                        className="w-full border border-white/20 bg-transparent px-6 py-4 font-light text-white transition-colors outline-none placeholder:text-white/40 focus:border-red-400"
                    />
                    <div className="flex w-full gap-4 border-t border-white/10 pt-6">
                        <button
                            onClick={() => {
                                handleSubmit();
                                dialogRef.current?.close();
                            }}
                            className="flex-1 border border-red-400 px-6 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all outline-none hover:bg-red-400 hover:text-black"
                        >
                            Change Name
                        </button>
                        <button
                            onClick={() => dialogRef.current?.close()}
                            className="flex-1 border border-white/30 px-6 py-3 text-sm font-bold tracking-wider text-white uppercase transition-all outline-none hover:bg-white/10"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export { TeamControls, EditTeamName };
