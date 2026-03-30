"use client";

import { matchVerificationCode, verifyEmail } from "@/services/UserService";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { User } from "@/types/user";
import { checkRegistrationStatus, updateVerification } from "@/services/AuthService";
import toast from "react-hot-toast";
import Balls from "../Balls";
import { Clickable } from "../Clickable";

function VerifyEmail({ user }: { user: User }) {
  const email = user.email;
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkRegistrationStatus(user.id).then((res) => {
      if (res.registrationComplete) {
        updateVerification().then(() => {
          router.refresh();
        });
      }
    });
  }, [user.id, router]);

  const handleSubmit = () => {
    toast.loading("Verifying code...");
    matchVerificationCode(email, code)
      .then((res) => {
        toast.dismiss();
        if (res) updateVerification().then(() => router.refresh());
        else toast.error("Invalid Code");
      })
      .catch(() => {
        toast.dismiss();
        toast.error("Error occurred while verifying code")
      });
  };

  const handleSendCode = () => {
    setCodeSent(true);
    toast.loading("Sending email...");
    verifyEmail(email)
      .then((res) => {
        toast.dismiss();
        if (res.ok) toast.success(res.message);
        else toast.error(res.message);
      })
      .catch(() => {
        toast.dismiss();
        toast.error("Error occurred");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 h-full min-h-[80vh]">
      <Balls />
      <h1 className="text-4xl sm:text-5xl font-semibold font-elnath text-yellow tracking-wide text-center">Verify your email</h1>
      <p className="text-center">An email will be sent to your registered email address with a code.</p>
      <Clickable
      as="button"
        className=" bg-white text-black hover:bg-white/90 active:bg-white/60"
        onClick={() => handleSendCode()}
        disabled={codeSent}
      >
        Send Email
      </Clickable>
      <input
        type="text"
        name="code"
        placeholder="Enter Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full sm:w-1/3 2xl:w-1/4"
      />
      <Clickable as="button"
        className="bg-red hover:bg-red/70 active:bg-red/40"
        onClick={() => handleSubmit()}
      >
        Verify Code
      </Clickable>
    </div>
  );
}

export default VerifyEmail;
