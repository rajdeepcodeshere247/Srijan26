"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import z from "zod";
import Balls from "../Balls";
import { Clickable } from "../Clickable";
import { updateUserProfile } from "@/services/UserService";

const EditProfileSchema = z.object({
    phone: z
        .string()
        .regex(/\d{10}$/, "Phone number must be exactly 10 digits"),
    college: z.string().min(1, "College is required"),
    year: z.string().min(1, "Year of Study is required"),
    department: z.string().min(1, "Department is required"),
});

interface EditProfileProps {
  user: any;
  onBack: () => void;
}

function EditProfile({ user, onBack }: EditProfileProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    phone: user.phone || "",
    college: user.college || "",
    year: user.year || "",
    department: user.department || "",
  });

  const [errors, setErrors] = useState({
    phone: "",
    college: "",
    year: "",
    department: "",
  });

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setErrors({ phone: "", college: "", department: "", year: "" });

    const isValid = EditProfileSchema.safeParse(data);
    if (!isValid.success) {
      isValid.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          setErrors((old) => ({ ...old, [issue.path[0]]: issue.message }));
        }
      });
      setLoading(false);
      return;
    }

    const loadId = toast.loading("Updating Profile...");
    try {
      const res = await updateUserProfile(data);

      toast.dismiss();
      if (res.ok) {
        toast.success("Profile Updated!");
        router.refresh();
        onBack(); 
      } else {
        toast.error(res.message || "Failed to update");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col items-center justify-center gap-6 h-full min-h-[80vh]"
      onSubmit={handleSubmit}
    >
      <div className="fixed inset-0 -z-50 pointer-events-none">
        <Balls />
      </div>
      <h1 className="text-4xl sm:text-5xl font-semibold font-elnath text-yellow mb-8 text-center uppercase">
        Edit &nbsp; Profile
      </h1>

      <div className="flex flex-col items-center gap-2 w-full sm:w-1/3 2xl:w-1/4 opacity-40">
        <input
          type="text"
          value={user.name}
          readOnly
          className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full bg-transparent cursor-not-allowed"
        />
      </div>
      <div className="flex flex-col items-center gap-2 w-full sm:w-1/3 2xl:w-1/4 opacity-40">
        <input
          type="text"
          value={user.email}
          readOnly
          className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full bg-transparent cursor-not-allowed"
        />
      </div>

      {[
        { name: "phone", placeholder: "Phone Number" },
        { name: "college", placeholder: "College" },
        { name: "department", placeholder: "Department" },
        { name: "year", placeholder: "Year of Graduation" },
      ].map((field) => (
        <div key={field.name} className="flex flex-col items-center gap-2 w-full sm:w-1/3 2xl:w-1/4">
          <input
            type="text"
            name={field.name}
            placeholder={field.placeholder}
            value={(data as any)[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="px-5 py-3 border border-yellow/70 rounded-full outline-none w-full bg-transparent"
          />
          {(errors as any)[field.name] && (
            <p className="text-sm text-red-500">{(errors as any)[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex gap-4 mt-4">
        <Clickable
          as="button"
          type="button"
          onClick={onBack}
          className="bg-white/10 border border-white/20 hover:bg-white/20"
        >
          Cancel
        </Clickable>
        <Clickable
          as="button"
          type="submit"
          disabled={loading}
          className="bg-red hover:bg-red/70 active:bg-red/40 cursor-pointer"
        >
          {loading ? "Saving..." : "Submit"}
        </Clickable>
      </div>
    </form>
  );
}

export default EditProfile;