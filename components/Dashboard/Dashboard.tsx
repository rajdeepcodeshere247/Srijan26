"use client";

import { signOut } from 'next-auth/react';
import React from 'react';
import WavyGradient from '../WavyGradient';
import { Clickable } from "@/components/Clickable";
import { User } from '@/types/user';
import Link from 'next/link';

const SectionHeader = ({ title }: { title: string }) => (
  <div className="w-full flex items-center gap-4 my-4">
    <h2 className="text-xl font-elnath text-yellow whitespace-nowrap">{title}</h2>
    <div className="h-px w-full bg-yellow/20"></div>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <p className="text-white/30 italic text-sm">{text}</p>
);

function Dashboard({ user }: { user: User }) {
  const handleLogout = () => {
    signOut({
      redirectTo: "/login",
    });
  };

  const completedItems = user.merchandise?.filter((item) => item.status === "completed") ?? [];
  const pendingItems = user.merchandise?.filter((item) => item.status === "pending") ?? [];
  const lastPendingItem = pendingItems.at(-1);

  const displayItems = completedItems.length > 0 ? completedItems : (lastPendingItem ? [lastPendingItem] : []);

  return (
    <div className="relative isolate flex flex-col items-center justify-center gap-10 p-6 md:p-12 min-h-[80vh] h-fit text-white">
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <WavyGradient
          color1="#bc6116"
          color2="#8f0c03"
          color3="#1A0000"
          direction={20}
          speed={1.5}
          waveHeight={0.45}
          noiseIntensity={5}
          waveAmplitude={1}
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-2 border-yellow overflow-hidden bg-white/10 flex items-center justify-center">
            {user.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-yellow font-elnath">
                {user.name ? user.name[0] : "?"}
              </span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-red text-xs px-2 py-1 rounded-full text-white border border-black uppercase">
            {user.role || "Guest"}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-semibold font-elnath text-yellow mb-2 uppercase tracking-tighter">
            {user.name || "Anonymous User"}
          </h1>
          <p className="text-white/60 font-mono tracking-widest">
            {user.email || "No email linked"}
          </p>
        </div>

        <Clickable
          as="button"
          onClick={handleLogout}
          className="bg-red hover:bg-red/70 px-8 py-2 text-sm relative z-20 cursor-pointer"
        >
          Logout
        </Clickable>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <div className="md:col-span-2 space-y-8">
          <section>
            <SectionHeader title="Academic Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs text-white/40 uppercase mb-1">College</p>
                <p className="text-lg">{user.college || <EmptyState text="No college specified" />}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs text-white/40 uppercase mb-1">Department</p>
                <p className="text-lg">{user.department || <EmptyState text="No department listed" />}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs text-white/40 uppercase mb-1">Graduation Year</p>
                <p className="text-lg">{user.year || <EmptyState text="N/A" />}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-xs text-white/40 uppercase mb-1">Phone</p>
                <p className="text-lg">{user.phone || <EmptyState text="No contact added" />}</p>
              </div>
            </div>
          </section>

          <section>
            <SectionHeader title="Activity" />
            <div className="space-y-4">
              {[
                { label: "My Teams", data: user.teams, color: "border-l-yellow", empty: "Not part of any teams yet", isTeam: true },
                { label: "Pending Requests", data: user.pendingTeams, color: "border-l-yellow", empty: "No pending invitations", isTeam: true },
                { label: "Workshops", data: user.workshopIds, color: "border-l-yellow", empty: "No workshops registered", isTeam: false },
                { label: "Wishlist", data: user.wishlistedEventIds, color: "border-l-yellow", empty: "Your wishlist is empty", isTeam: false }
              ].map((item, idx) => (
                <div key={idx} className={`p-4 bg-white/5 border-l-4 ${item.color} rounded-r-xl`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase tracking-wider">{item.label}</span>
                    <span className="text-2xl font-elnath text-yellow">{item.data?.length || 0}</span>
                  </div>

                  {(!item.data || item.data.length === 0) && (
                    <div className="mt-2 text-xs">
                      <EmptyState text={item.empty} />
                    </div>
                  )}

                  {item.data && item.data.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.data.map((entry) => (
                        item.isTeam ? (
                          <Link
                            key={entry.id}
                            href={`/register/${entry.event.slug}`}
                            className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded border border-white/5 hover:border-yellow/50 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white uppercase">{entry.name}</span>
                              <span className="text-[9px] text-yellow/70 uppercase tracking-tighter">{entry.event.name}</span>
                            </div>
                            <span className="text-[10px] ml-2 opacity-40">→</span>
                          </Link>
                        ) : (
                          <span key={entry} className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/5 font-mono">
                            {entry}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="p-6 bg-white/5 border border-yellow/20 rounded-2xl">
            <h3 className="text-yellow font-elnath mb-4 uppercase tracking-widest">Security</h3>
            <Link href="/dashboard/edit-profile">
              <button className="w-full py-2 border border-yellow/50 text-yellow text-xs uppercase hover:bg-yellow hover:text-black transition-all cursor-pointer">
                Edit Profile
              </button>
            </Link>
          </div>

          {/* For the merch */}
          <div className="p-6 bg-white/5 border border-yellow/20 rounded-2xl">
            <h3 className="text-yellow font-elnath mb-4 uppercase tracking-widest">Merchandise</h3>

            { displayItems.length === 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-white/40 italic text-xs">You haven&apos;t ordered yet.</p>
                <Link href="/merchandise">
                  <button className="w-full py-2 border border-yellow/50 text-yellow text-xs uppercase hover:bg-yellow hover:text-black transition-all cursor-pointer">
                    Buy Now
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {displayItems.map((item) => (
                  <div key={item.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={item.color === "BLACK" ? "/shirt0.png" : "/shirt2.png"}
                      alt={`${item.color} shirt`}
                      className="w-full object-contain"
                    />
                    <div className="p-4 space-y-4"> 
                      <span className={`
                          inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest
                          ${item.status === "completed" ? "bg-green-500/20 text-green-400 border border-green-500/30" : ""}
                          ${item.status === "pending" ? "bg-yellow/20 text-yellow border border-yellow/30" : ""}
                          ${item.status === "failed" ? "bg-red-500/20 text-red-400 border border-red-500/30" : ""}
                        `}>
                        {item.status}
                      </span>
                      <div className="bg-white/5 border border-yellow/20 rounded-lg px-3 py-2">
                        <p className="text-[9px] text-white/40 uppercase mb-1">Order ID</p>
                        <p className="text-md text-yellow break-all">{item.orderId || "—"}</p>
                      </div>
 
                      <div className="flex gap-3">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                          <p className="text-[9px] text-white/40 uppercase mb-1">Color</p>
                          <p className="text-sm font-semibold capitalize">{item.color?.toLowerCase()}</p>
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                          <p className="text-[9px] text-white/40 uppercase mb-1">Size</p>
                          <p className="text-sm font-semibold">{item.size}</p>
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                          <p className="text-[9px] text-white/40 uppercase mb-1">Amount</p>
                          <p className="text-sm font-semibold">₹{item.amount}</p>
                        </div>
                      </div>
 
                      <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                        <p className="text-[9px] text-white/40 uppercase mb-1">Preferred Campus</p>
                        <p className="text-sm font-semibold">{item.preferredCampus === "SALT_LAKE" ? "Salt Lake Campus" : "Jadavpur Campus"}</p>
                      </div>
 

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </aside>
      </div>

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-between gap-6 opacity-30 mt-auto">
        <div className="h-px w-full bg-linear-to-r from-red to-orange"></div>
        <p className="text-xs font-elnath">END</p>
        <div className="h-px w-full bg-linear-to-l from-red to-orange"></div>
      </div>
    </div>
  );
}

export default Dashboard;