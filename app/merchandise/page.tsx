"use client";

import ProductView from "@/components/Merchandise/ProductView";
import Price from "@/components/Merchandise/Price";
import Contact from "@/components/Merchandise/Contact";
import WavyGradient from "@/components/WavyGradient";
import Image from "next/image";
import { Clickable } from "@/components/Clickable";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePayment } from "@/hooks/usePayment";
import { MerchSelect } from "@/components/Merchandise/MerchSelect";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getUserPhone } from "@/actions/merchandise";
import { useEffect } from "react";

interface SplitTextMaskProps {
  text: string;
  className?: string;
  itemClass?: string;
}

const SplitTextMask = ({ text, className = "", itemClass = "" }: SplitTextMaskProps) => {
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {text.split("").map((char, index) => (
        <span key={index} className="overflow-hidden inline-block pb-1">
          {char === " " ? (
            <span className="inline-block w-2">&nbsp;</span>
          ) : (
            <span className={`${itemClass} inline-block translate-y-[110%]`}>
              {char}
            </span>
          )}
        </span>
      ))}
    </span>
  );
};


export default function MerchandisePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [formData, setFormData] = useState({
    size: "",
    color: "BLACK",
    campus: "JADAVPUR",
    customTextOption: "NO",
    customText: "",
    phone: "",
  });
  const [isPhoneDisabled, setIsPhoneDisabled] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      getUserPhone(session.user.id).then((res) => {
        if (res.success && res.phone) {
          setFormData((prev) => ({ ...prev, phone: res.phone }));
          setIsPhoneDisabled(true);
        }
      });
    }
  }, [session?.user?.id]);
  const [error, setError] = useState("");

  const { isLoading, handlePayment } = usePayment({
    createOrderApi: "/api/create-order",
    verifyOrderApi: "/api/verify-payment",
    successRedirect: "/dashboard",
  });

  const currentImages = formData.color === "BLACK"
    ? ["/shirt0.png", "/shirt1.png"]
    : ["/shirt2.png", "/shirt3.png"];

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      tl.to(
        ".merch-title-char",
        { y: "0%", duration: 1.2, stagger: 0.05, ease: "expo.out" },
        0.2
      )
        .fromTo(
          ".merch-fade-in",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
          "<"
        );
    },
    { scope: containerRef }
  );


  const BATCH_CODE_REGEX = /^(2k\d{2}|20\d{2}|\d{8,12})$/i;
  const ALLOWED_CHARS_REGEX = /^[a-zA-Z0-9\s@#\.()]*$/;

  const handleInputChange = (field: string, value: string) => {
    if (field === "customText") {
      if (value !== "" && !ALLOWED_CHARS_REGEX.test(value)) {
        return; // Filter out disallowed characters
      }
    }
    if (field === "color") {
      setActiveIndex(0);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateCustomText = (text: string) => {
    if (!text) return true;
    const parts = text.split(/\s+/);
    for (const part of parts) {
      if (BATCH_CODE_REGEX.test(part)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!session) {
      toast.error("Please login to buy merchandise");
      router.push("/login?redirect=/merchandise");
      return;
    }

    if (!formData.size) {
      setError("Please select a size.");
      toast.error("Please select a size.");
      return;
    }

    if (!formData.phone || formData.phone.length < 10) {
      setError("Please enter a valid mobile number.");
      toast.error("Please enter a valid mobile number.");
      return;
    }

    if (!validateCustomText(formData.customText)) {
      setError("Custom text cannot contain batch codes or roll numbers.");
      toast.error("Batch codes/roll numbers are not allowed.");
      return;
    }

    try {
      const { customTextOption, ...dataToSend } = formData;

      await handlePayment({
        ...dataToSend,
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];
  const campuses = [
    { value: "JADAVPUR", label: "Jadavpur Campus" },
    { value: "SALT_LAKE", label: "Salt Lake Campus" },
  ];

  return (
    <main ref={containerRef} className="full-bleed min-h-screen relative text-white">
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

      <div
        className="
          relative z-10 min-h-screen
          grid grid-cols-1 lg:grid-cols-[1fr_1.2fr]
          gap-12 md:gap-16 lg:gap-24
          px-6 py-10 md:px-12 md:py-16 lg:px-24 lg:py-20
          items-start
        "
      >
        <div className="flex flex-col items-center gap-6 md:gap-10 lg:sticky lg:top-20 w-full">
          <div className="flex items-center justify-center w-full gap-2 sm:gap-4">
            <button
              onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : currentImages.length - 1))}
              className="group w-10 h-10 sm:w-14 sm:h-12 flex-shrink-0 flex items-center justify-center bg-[#EBD87D] text-black hover:bg-[#ffe88a] active:bg-red-600 active:text-white active:scale-95 transition-all duration-150 cursor-pointer"
              style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
              aria-label="Previous image"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 group-active:translate-x-0 transition-transform duration-200" />
            </button>

            <ProductView src={currentImages[activeIndex] || currentImages[0]} />

            <button
              onClick={() => setActiveIndex((prev) => (prev < currentImages.length - 1 ? prev + 1 : 0))}
              className="group w-10 h-10 sm:w-14 sm:h-12 flex-shrink-0 flex items-center justify-center bg-[#EBD87D] text-black hover:bg-[#ffe88a] active:bg-red-600 active:text-white active:scale-95 transition-all duration-150 cursor-pointer"
              style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
              aria-label="Next image"
            >
              <ArrowRight size={18} className="group-hover:translate-x-1 group-active:translate-x-0 transition-transform duration-200" />
            </button>
          </div>

          <div className="flex gap-3 md:gap-4">
            {currentImages.map((imgSrc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`
                  w-16 h-16 md:w-20 md:h-20
                  flex items-center justify-center
                  bg-white/5
                  border
                  transition
                  outline-none
                  ${activeIndex === i
                    ? "border-[#EBD87D] ring-2 ring-[#EBD87D]/60"
                    : "border-white/40 hover:border-white"
                  }
                  focus-visible:ring-2
                  focus-visible:ring-[#EBD87D]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-black
                `}
              >
                <Image
                  src={imgSrc}
                  alt={`Merchandise preview ${i + 1}`}
                  width={48}
                  height={48}
                  className="object-contain pointer-events-none"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-6 md:gap-8 max-w-xl mx-auto w-full">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-elnath tracking-wide text-[#EBD87D] flex justify-center">
            <SplitTextMask text="MERCHANDISE" itemClass="merch-title-char" />
          </h1>

          <div className="merch-fade-in text-white/80 space-y-3 md:space-y-4 font-euclid opacity-0">
            <p className="text-lg md:text-[24px] leading-[120%]">
              Presenting the Official Merchandise for Srijan&apos;26!
            </p>
            <p className="text-base md:text-[22px] leading-[120%]">
              A polo t-shirt, available in black and white colors.
            </p>
          </div>

          <div className="merch-fade-in opacity-0">
            <Price />
          </div>

          {/* Form Start */}
          <form
            onSubmit={handleSubmit}
            className="merch-fade-in opacity-0 w-full space-y-6 text-left mt-4 border border-white/10 p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mobile Number Input */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-[#EBD87D]">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isPhoneDisabled}
                  placeholder="e.g. 9876543210"
                  className={`w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none transition placeholder:text-white/20 ${isPhoneDisabled ? "opacity-60 cursor-not-allowed" : "focus:border-[#EBD87D]"}`}
                  required
                />
              </div>

              {/* Size Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#EBD87D]">
                  Shirt Size
                </label>
                <MerchSelect
                  value={formData.size}
                  onValueChange={(val) => handleInputChange("size", val)}
                  options={sizes.map(s => ({ label: s, value: s }))}
                  placeholder="Select Size"
                />
              </div>

              {/* Campus Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#EBD87D]">
                  Delivery Location
                </label>
                <MerchSelect
                  value={formData.campus}
                  onValueChange={(val) => handleInputChange("campus", val)}
                  options={campuses}
                  placeholder="Select Location"
                />
              </div>
            </div>

            {/* Color Variant Radio Buttons */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#EBD87D]">
                Shirt Variant
              </label>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="color"
                      value="BLACK"
                      checked={formData.color === "BLACK"}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-white/40 peer-checked:border-[#EBD87D] transition group-hover:border-white" />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#EBD87D] scale-0 peer-checked:scale-100 transition" />
                  </div>
                  <span className="text-sm peer-checked:text-[#EBD87D]">
                    Black
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="color"
                      value="WHITE"
                      checked={formData.color === "WHITE"}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-white/40 peer-checked:border-[#EBD87D] transition group-hover:border-white" />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#EBD87D] scale-0 peer-checked:scale-100 transition" />
                  </div>
                  <span className="text-sm peer-checked:text-[#EBD87D]">
                    White
                  </span>
                </label>
              </div>
            </div>

            {/* Custom Text Option */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#EBD87D]">
                Custom Text
              </label>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="customTextOption"
                      value="YES"
                      checked={formData.customTextOption === "YES"}
                      onChange={(e) =>
                        handleInputChange("customTextOption", e.target.value)
                      }
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-white/40 peer-checked:border-[#EBD87D] transition group-hover:border-white" />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#EBD87D] scale-0 peer-checked:scale-100 transition" />
                  </div>
                  <span className="text-sm peer-checked:text-[#EBD87D]">
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="customTextOption"
                      value="NO"
                      checked={formData.customTextOption === "NO"}
                      onChange={(e) =>
                        handleInputChange("customTextOption", e.target.value)
                      }
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-full border-2 border-white/40 peer-checked:border-[#EBD87D] transition group-hover:border-white" />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#EBD87D] scale-0 peer-checked:scale-100 transition" />
                  </div>
                  <span className="text-sm peer-checked:text-[#EBD87D]">
                    No
                  </span>
                </label>
              </div>
            </div>

            {formData.customTextOption === "YES" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#EBD87D]">
                  Custom Text (to be printed on the back)
                </label>
                <input
                  type="text"
                  value={formData.customText}
                  placeholder="Ex: John Doe, @john, #26 (Optional)"
                  onChange={(e) =>
                    handleInputChange("customText", e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:border-[#EBD87D] outline-none transition placeholder:text-white/20"
                />
                {/* <p className="text-[10px] text-white/40 italic">
                Allowed: A-Z, 0-9, spaces, @, #, ., (, ) | Batch codes/roll numbers are forbidden.
              </p> */}
              </div>
            )}

            <Clickable
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer disabled:cursor-not-allowed group relative overflow-hidden uppercase bg-red hover:bg-red-500 hover:scale-[1.02] active:scale-95 transition-all duration-300 ease-out font-bold tracking-widest text-base lg:text-lg h-12 flex justify-center items-center disabled:opacity-50"
            >
              <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
              {isLoading ? (
                <div className="relative z-10 flex items-center justify-center gap-2 text-white">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <span className="relative z-10 text-white">BUY NOW</span>
              )}
            </Clickable>
          </form>
          {/* Form End */}

          <div className="merch-fade-in opacity-0 pt-6 md:pt-10 flex flex-col items-center gap-4 md:gap-6 w-full">
            <h3 className="text-[#EBD87D] text-2xl md:text-3xl font-elnath tracking-wider uppercase">Contact us</h3>
            <Contact />
          </div>
        </div>
      </div>
    </main>
  );
}
