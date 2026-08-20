"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "@/lib/actions";
import StepCredentials from "@/components/auth/step-credentials";
import StepPersona from "@/components/auth/step-persona";
import StepAvatar, { AVATAR_PRESETS } from "@/components/auth/step-avatar";
import { Sparkles, ArrowRight } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Step Tracker: 1, 2, 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("founder");
  const [bio, setBio] = useState("Startup Founder & Builder. Building the future.");
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatar, setCustomAvatar] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate username from name if not manually edited
  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username === name.toLowerCase().replace(/\s+/g, "")) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9]/g, ""));
    }
  };

  const handleRoleSelect = (roleId: string, defaultBio: string) => {
    setRole(roleId);
    setBio(defaultBio);
  };

  // Step 1 Validation
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setStep(2);
  };

  // Step 2 Validation
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Please enter a unique username handle.");
      return;
    }

    setStep(3);
  };

  // Final Submission
  const handleFinalSubmit = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const finalAvatar = customAvatar.trim() || avatar;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("bio", bio);
    formData.append("image", finalAvatar);

    const res = await registerAction(null, formData);

    setIsSubmitting(false);

    if (res.status === "SUCCESS") {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setErrorMessage(res.error || "Failed to create your account.");
    }
  };

  return (
    <div className="w-full max-w-xl bg-white border-4 border-black rounded-4xl p-6 sm:p-10 shadow-[10px_10px_0px_0px_#000000] relative">
      {/* Step Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#EE2B69] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            STEP {step} OF 3
          </span>
          <span className="text-xs font-bold text-zinc-500">
            {step === 1 && "Account Credentials"}
            {step === 2 && "Profile & Persona"}
            {step === 3 && "Avatar & Launch"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-zinc-100 border-2 border-black rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-[#EE2B69] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-100 border-2 border-red-600 text-red-700 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm">
          {errorMessage}
        </div>
      )}

      {/* Step 1 Component (SRP) */}
      {step === 1 && (
        <StepCredentials
          name={name}
          email={email}
          password={password}
          onNameChange={handleNameChange}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onNext={handleStep1Next}
        />
      )}

      {/* Step 2 Component (SRP) */}
      {step === 2 && (
        <StepPersona
          username={username}
          role={role}
          bio={bio}
          onUsernameChange={setUsername}
          onRoleSelect={handleRoleSelect}
          onBioChange={setBio}
          onBack={() => setStep(1)}
          onNext={handleStep2Next}
        />
      )}

      {/* Step 3 Component (SRP) */}
      {step === 3 && (
        <StepAvatar
          name={name}
          username={username}
          bio={bio}
          avatar={avatar}
          customAvatar={customAvatar}
          isSubmitting={isSubmitting}
          onAvatarSelect={(url) => {
            setAvatar(url);
            setCustomAvatar("");
          }}
          onCustomAvatarChange={setCustomAvatar}
          onBack={() => setStep(2)}
          onSubmit={handleFinalSubmit}
        />
      )}

      {/* Bottom Login Link */}
      <div className="mt-8 pt-6 border-t-2 border-zinc-100 text-center">
        <p className="text-xs font-bold text-zinc-600">
          Already have an account?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="text-[#EE2B69] hover:underline font-black inline-flex items-center gap-1"
          >
            Sign In <ArrowRight className="w-3 h-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterOnboardingPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-10 px-4">
      <Suspense fallback={<div className="font-bold text-sm">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
