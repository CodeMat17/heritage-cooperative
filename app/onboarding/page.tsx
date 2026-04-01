"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { NIGERIA_STATES, NIGERIA_STATE_TO_LGAS } from "@/lib/nigeria";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { Building2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { completeOnboarding } from "./_actions";

const phoneRegex = /^\+?[0-9]{10,15}$/;

const step1Schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email required"),
  gender: z.string().min(1, "Gender is required"),
  nickName: z.string().min(1, "Nickname is required"),
  motherMaidenName: z.string().min(1, "Mother's maiden name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  nationality: z.string().min(1),
  stateOfOrigin: z.string().min(1, "State of origin is required"),
  lga: z.string().min(1, "LGA is required"),
  homeTown: z.string().min(1, "Home town is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  mobilePhoneNumber: z.string().regex(phoneRegex, "Enter a valid phone number"),
  otherPhoneNumber: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val && val.length > 0 && !phoneRegex.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid phone number",
        });
      }
    }),
  residentialAddress: z.string().min(1, "Residential address is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  taxIdentificationNumber: z.string().min(1, "TIN is required"),
  typeOfTrade: z.string().min(1, "Type of trade is required"),
  yearsInTrade: z.number().nonnegative(),
  otherTradeOrSkill: z.string().optional(),
  meansOfIdentification: z.string().min(1, "Means of ID is required"),
  meansOfIdentificationStartDate: z.string().min(1, "ID start date is required"),
  meansOfIdentificationExpiryDate: z.string().min(1, "ID expiry date is required"),
  educationalBackground: z.string().min(1, "Educational background is required"),
});

const step2Schema = z.object({
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
});

const step3Schema = z.object({
  nokSurname: z.string().min(1, "Surname is required"),
  nokFirstName: z.string().min(1, "First name is required"),
  nokOtherName: z.string().min(1, "Other name is required"),
  nokTitle: z.string().min(1, "Title is required"),
  nokDateOfBirth: z.string().min(1, "Date of birth is required"),
  nokGender: z.string().min(1, "Gender is required"),
  nokRelationship: z.string().min(1, "Relationship is required"),
  nokPhoneNumber: z.string().regex(phoneRegex, "Enter a valid phone number"),
  nokEmail: z.string().email("Valid email required"),
  nokHouseAddress: z.string().min(1, "Address is required"),
});

const STEPS = [
  { title: "Personal Information", desc: "Tell us about yourself" },
  { title: "Banking Details", desc: "Your account information" },
  { title: "Next of Kin", desc: "Emergency contact details" },
];

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-destructive text-xs mt-1">{error}</p>;
}

export default function OnboardingPage() {
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const { user } = useUser();
  const router = useRouter();
  const upsertUser = useMutation(api.users.upsertUserFromOnboarding);

  // Step 1 state
  const [fullName, setFullName] = React.useState(
    user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || ""
  );
  const [gender, setGender] = React.useState("");
  const [maritalStatus, setMaritalStatus] = React.useState("");
  const [meansOfIdentification, setMeansOfIdentification] = React.useState("");
  const [educationalBackground, setEducationalBackground] = React.useState("");
  const [stateValue, setStateValue] = React.useState("");
  const [lgaValue, setLgaValue] = React.useState("");
  const [dob, setDob] = React.useState<Date | undefined>();
  const [idStart, setIdStart] = React.useState<Date | undefined>();
  const [idExpiry, setIdExpiry] = React.useState<Date | undefined>();
  const [openDob, setOpenDob] = React.useState(false);
  const [openIdStart, setOpenIdStart] = React.useState(false);
  const [openIdExpiry, setOpenIdExpiry] = React.useState(false);

  // Step 3 state
  const [nokGender, setNokGender] = React.useState("");
  const [nokRelationship, setNokRelationship] = React.useState("");
  const [nokDob, setNokDob] = React.useState<Date | undefined>();
  const [openNokDob, setOpenNokDob] = React.useState(false);

  // Form ref to read uncontrolled inputs
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    const name =
      user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    if (name && !fullName) setFullName(name);
  }, [user, fullName]);

  function clearErr(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function collectStep1(fd: FormData) {
    return {
      fullName,
      email: user?.primaryEmailAddress?.emailAddress || "",
      gender,
      nickName: String(fd.get("nickName") || ""),
      motherMaidenName: String(fd.get("motherMaidenName") || ""),
      dateOfBirth: dob ? dob.toISOString().split("T")[0] : "",
      placeOfBirth: String(fd.get("placeOfBirth") || ""),
      nationality: "Nigeria",
      stateOfOrigin: stateValue,
      lga: lgaValue,
      homeTown: String(fd.get("homeTown") || ""),
      maritalStatus,
      mobilePhoneNumber: String(fd.get("mobilePhoneNumber") || ""),
      otherPhoneNumber: String(fd.get("otherPhoneNumber") || ""),
      residentialAddress: String(fd.get("residentialAddress") || ""),
      permanentAddress: String(fd.get("permanentAddress") || ""),
      taxIdentificationNumber: String(fd.get("taxIdentificationNumber") || ""),
      typeOfTrade: String(fd.get("typeOfTrade") || ""),
      yearsInTrade: Number(fd.get("yearsInTrade") || 0),
      otherTradeOrSkill: String(fd.get("otherTradeOrSkill") || ""),
      meansOfIdentification,
      meansOfIdentificationStartDate: idStart ? idStart.toISOString().split("T")[0] : "",
      meansOfIdentificationExpiryDate: idExpiry ? idExpiry.toISOString().split("T")[0] : "",
      educationalBackground,
    };
  }

  function collectStep2(fd: FormData) {
    return {
      accountName: String(fd.get("accountName") || ""),
      accountNumber: String(fd.get("accountNumber") || ""),
      bankName: String(fd.get("bankName") || ""),
      bvn: String(fd.get("bvn") || ""),
    };
  }

  function collectStep3(fd: FormData) {
    return {
      nokSurname: String(fd.get("nokSurname") || ""),
      nokFirstName: String(fd.get("nokFirstName") || ""),
      nokOtherName: String(fd.get("nokOtherName") || ""),
      nokTitle: String(fd.get("nokTitle") || ""),
      nokDateOfBirth: nokDob ? nokDob.toISOString().split("T")[0] : "",
      nokGender,
      nokRelationship,
      nokPhoneNumber: String(fd.get("nokPhoneNumber") || ""),
      nokEmail: String(fd.get("nokEmail") || ""),
      nokHouseAddress: String(fd.get("nokHouseAddress") || ""),
    };
  }

  function validateStep(stepNum: number, fd: FormData): boolean {
    let result;
    if (stepNum === 1) {
      if (dob) {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 18) {
          setFieldErrors({ dateOfBirth: "You must be at least 18 years old." });
          toast.warning("Persons under 18 cannot subscribe.");
          return false;
        }
      }
      result = step1Schema.safeParse(collectStep1(fd));
    } else if (stepNum === 2) {
      result = step2Schema.safeParse(collectStep2(fd));
    } else {
      result = step3Schema.safeParse(collectStep3(fd));
    }

    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = (issue.path?.[0] as string) || "";
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      toast.error("Please fix the highlighted fields.");
      return false;
    }

    setFieldErrors({});
    return true;
  }

  function handleNext() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    if (validateStep(step, fd)) setStep(step + 1);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!validateStep(3, fd)) return;

    const payload = {
      ...collectStep1(fd),
      ...collectStep2(fd),
      ...collectStep3(fd),
    };

    setSubmitting(true);

    try {
      // Step 1 — save profile to Convex first while the user is already authenticated.
      // This must happen before completeOnboarding() because that call updates the
      // Clerk JWT, which triggers a WebSocket reconnect in Convex. Calling upsertUser
      // after that reconnect causes an "Unauthenticated" race condition.
      await upsertUser(payload);

      // Step 2 — mark onboarding complete in Clerk
      const res = await completeOnboarding(fd);
      if (res?.error) {
        toast.error(res.error);
        setSubmitting(false);
        return;
      }

      // Step 3 — reload the Clerk session so the new JWT (with onboardingComplete: true)
      // is available for the middleware redirect check on /dashboard
      await user?.reload();

      toast.success("Profile complete! Now choose your package.");
      router.push("/dashboard/select-package");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const displayName =
    user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm">Heritage Cooperative</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {displayName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete your membership profile to get started — takes about 5 minutes.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => {
              const stepNum = idx + 1;
              const done = step > stepNum;
              const active = step === stepNum;
              return (
                <React.Fragment key={s.title}>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        done
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : active
                            ? "border-emerald-600 text-emerald-600 bg-background"
                            : "border-muted text-muted-foreground bg-background"
                      }`}
                    >
                      {done ? "✓" : stepNum}
                    </div>
                    <span
                      className={`text-xs mt-1.5 font-medium hidden sm:block ${
                        active
                          ? "text-emerald-600"
                          : done
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 sm:mx-3 transition-colors ${
                        step > stepNum ? "bg-emerald-600" : "bg-muted"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="sm:hidden mt-3">
            <p className="text-sm font-medium">{STEPS[step - 1].title}</p>
            <p className="text-xs text-muted-foreground">{STEPS[step - 1].desc}</p>
          </div>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="rounded-2xl border bg-card p-5 sm:p-7 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">{STEPS[step - 1].title}</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {STEPS[step - 1].desc}
            </p>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <Label>Full name *</Label>
                  <Input
                    name="fullName"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); clearErr("fullName"); }}
                  />
                  <FieldError error={fieldErrors.fullName} />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select value={gender} onValueChange={(v) => { setGender(v); clearErr("gender"); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.gender} />
                </div>
                <div>
                  <Label>Marital status *</Label>
                  <Select value={maritalStatus} onValueChange={(v) => { setMaritalStatus(v); clearErr("maritalStatus"); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.maritalStatus} />
                </div>
                <div>
                  <Label>Date of birth *</Label>
                  <Popover open={openDob} onOpenChange={setOpenDob}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" type="button" className="w-full justify-between font-normal">
                        {dob ? dob.toLocaleDateString() : "Select date"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dob} captionLayout="dropdown"
                        onSelect={(d) => { setDob(d as Date | undefined); setOpenDob(false); clearErr("dateOfBirth"); }} />
                    </PopoverContent>
                  </Popover>
                  <FieldError error={fieldErrors.dateOfBirth} />
                </div>
                <div>
                  <Label>Place of birth *</Label>
                  <Input name="placeOfBirth" onChange={() => clearErr("placeOfBirth")} />
                  <FieldError error={fieldErrors.placeOfBirth} />
                </div>
                <div>
                  <Label>Nickname *</Label>
                  <Input name="nickName" onChange={() => clearErr("nickName")} />
                  <FieldError error={fieldErrors.nickName} />
                </div>
                <div>
                  <Label>Mother&apos;s maiden name *</Label>
                  <Input name="motherMaidenName" onChange={() => clearErr("motherMaidenName")} />
                  <FieldError error={fieldErrors.motherMaidenName} />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input name="nationality" value="Nigeria" readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>State of origin *</Label>
                  <Select value={stateValue} onValueChange={(v) => { setStateValue(v); setLgaValue(""); clearErr("stateOfOrigin"); }}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {NIGERIA_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.stateOfOrigin} />
                </div>
                <div>
                  <Label>LGA *</Label>
                  <Select value={lgaValue} onValueChange={(v) => { setLgaValue(v); clearErr("lga"); }} disabled={!stateValue}>
                    <SelectTrigger><SelectValue placeholder="Select LGA" /></SelectTrigger>
                    <SelectContent>
                      {(NIGERIA_STATE_TO_LGAS[stateValue] ?? []).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.lga} />
                </div>
                <div>
                  <Label>Home town *</Label>
                  <Input name="homeTown" onChange={() => clearErr("homeTown")} />
                  <FieldError error={fieldErrors.homeTown} />
                </div>
                <div>
                  <Label>Mobile phone *</Label>
                  <Input name="mobilePhoneNumber" type="tel" onChange={() => clearErr("mobilePhoneNumber")} />
                  <FieldError error={fieldErrors.mobilePhoneNumber} />
                </div>
                <div>
                  <Label>Other phone</Label>
                  <Input name="otherPhoneNumber" type="tel" onChange={() => clearErr("otherPhoneNumber")} />
                  <FieldError error={fieldErrors.otherPhoneNumber} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Residential address *</Label>
                  <Textarea name="residentialAddress" rows={2} onChange={() => clearErr("residentialAddress")} />
                  <FieldError error={fieldErrors.residentialAddress} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Permanent address *</Label>
                  <Textarea name="permanentAddress" rows={2} onChange={() => clearErr("permanentAddress")} />
                  <FieldError error={fieldErrors.permanentAddress} />
                </div>
                <div>
                  <Label>Tax identification number *</Label>
                  <Input name="taxIdentificationNumber" onChange={() => clearErr("taxIdentificationNumber")} />
                  <FieldError error={fieldErrors.taxIdentificationNumber} />
                </div>
                <div>
                  <Label>Type of trade *</Label>
                  <Input name="typeOfTrade" onChange={() => clearErr("typeOfTrade")} />
                  <FieldError error={fieldErrors.typeOfTrade} />
                </div>
                <div>
                  <Label>Years in trade *</Label>
                  <Input name="yearsInTrade" type="number" min="0" onChange={() => clearErr("yearsInTrade")} />
                  <FieldError error={fieldErrors.yearsInTrade} />
                </div>
                <div>
                  <Label>Other trade / skill</Label>
                  <Input name="otherTradeOrSkill" />
                </div>
                <div>
                  <Label>Means of identification *</Label>
                  <Select value={meansOfIdentification} onValueChange={(v) => { setMeansOfIdentification(v); clearErr("meansOfIdentification"); }}>
                    <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national_id">National ID card</SelectItem>
                      <SelectItem value="voters_card">Voter&apos;s card</SelectItem>
                      <SelectItem value="passport">International passport</SelectItem>
                      <SelectItem value="drivers_license">Driver&apos;s licence</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.meansOfIdentification} />
                </div>
                <div>
                  <Label>ID issue date *</Label>
                  <Popover open={openIdStart} onOpenChange={setOpenIdStart}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" type="button" className="w-full justify-between font-normal">
                        {idStart ? idStart.toLocaleDateString() : "Select date"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={idStart} captionLayout="dropdown"
                        onSelect={(d) => { setIdStart(d as Date | undefined); setOpenIdStart(false); clearErr("meansOfIdentificationStartDate"); }} />
                    </PopoverContent>
                  </Popover>
                  <FieldError error={fieldErrors.meansOfIdentificationStartDate} />
                </div>
                <div>
                  <Label>ID expiry date *</Label>
                  <Popover open={openIdExpiry} onOpenChange={setOpenIdExpiry}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" type="button" className="w-full justify-between font-normal">
                        {idExpiry ? idExpiry.toLocaleDateString() : "Select date"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={idExpiry} captionLayout="dropdown"
                        onSelect={(d) => { setIdExpiry(d as Date | undefined); setOpenIdExpiry(false); clearErr("meansOfIdentificationExpiryDate"); }} />
                    </PopoverContent>
                  </Popover>
                  <FieldError error={fieldErrors.meansOfIdentificationExpiryDate} />
                </div>
                <div>
                  <Label>Educational background *</Label>
                  <Select value={educationalBackground} onValueChange={(v) => { setEducationalBackground(v); clearErr("educationalBackground"); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fslc">FSLC</SelectItem>
                      <SelectItem value="wassce">WASSCE / SSCE</SelectItem>
                      <SelectItem value="nd_hnd">ND / HND</SelectItem>
                      <SelectItem value="bsc_plus">B.Sc. & above</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.educationalBackground} />
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Account name *</Label>
                  <Input name="accountName" onChange={() => clearErr("accountName")} />
                  <FieldError error={fieldErrors.accountName} />
                </div>
                <div>
                  <Label>Account number *</Label>
                  <Input name="accountNumber" maxLength={10} onChange={() => clearErr("accountNumber")} />
                  <FieldError error={fieldErrors.accountNumber} />
                </div>
                <div>
                  <Label>Bank name *</Label>
                  <Input name="bankName" onChange={() => clearErr("bankName")} />
                  <FieldError error={fieldErrors.bankName} />
                </div>
                <div>
                  <Label>BVN *</Label>
                  <Input name="bvn" maxLength={11} placeholder="11-digit BVN" onChange={() => clearErr("bvn")} />
                  <FieldError error={fieldErrors.bvn} />
                </div>
                <div className="sm:col-span-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-700 dark:text-amber-400">
                  Your banking details are used solely for loan disbursement and are stored securely.
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Surname *</Label>
                  <Input name="nokSurname" onChange={() => clearErr("nokSurname")} />
                  <FieldError error={fieldErrors.nokSurname} />
                </div>
                <div>
                  <Label>First name *</Label>
                  <Input name="nokFirstName" onChange={() => clearErr("nokFirstName")} />
                  <FieldError error={fieldErrors.nokFirstName} />
                </div>
                <div>
                  <Label>Other name *</Label>
                  <Input name="nokOtherName" onChange={() => clearErr("nokOtherName")} />
                  <FieldError error={fieldErrors.nokOtherName} />
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input name="nokTitle" placeholder="Mr / Mrs / Dr …" onChange={() => clearErr("nokTitle")} />
                  <FieldError error={fieldErrors.nokTitle} />
                </div>
                <div>
                  <Label>Date of birth *</Label>
                  <Popover open={openNokDob} onOpenChange={setOpenNokDob}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" type="button" className="w-full justify-between font-normal">
                        {nokDob ? nokDob.toLocaleDateString() : "Select date"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={nokDob} captionLayout="dropdown"
                        onSelect={(d) => { setNokDob(d as Date | undefined); setOpenNokDob(false); clearErr("nokDateOfBirth"); }} />
                    </PopoverContent>
                  </Popover>
                  <FieldError error={fieldErrors.nokDateOfBirth} />
                </div>
                <div>
                  <Label>Gender *</Label>
                  <Select value={nokGender} onValueChange={(v) => { setNokGender(v); clearErr("nokGender"); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.nokGender} />
                </div>
                <div>
                  <Label>Relationship *</Label>
                  <Select value={nokRelationship} onValueChange={(v) => { setNokRelationship(v); clearErr("nokRelationship"); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError error={fieldErrors.nokRelationship} />
                </div>
                <div>
                  <Label>Phone number *</Label>
                  <Input name="nokPhoneNumber" type="tel" onChange={() => clearErr("nokPhoneNumber")} />
                  <FieldError error={fieldErrors.nokPhoneNumber} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input name="nokEmail" type="email" onChange={() => clearErr("nokEmail")} />
                  <FieldError error={fieldErrors.nokEmail} />
                </div>
                <div className="sm:col-span-2">
                  <Label>House address *</Label>
                  <Textarea name="nokHouseAddress" rows={2} onChange={() => clearErr("nokHouseAddress")} />
                  <FieldError error={fieldErrors.nokHouseAddress} />
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <span className="text-sm text-muted-foreground">
              Step {step} of {STEPS.length}
            </span>
            {step < STEPS.length ? (
              <Button
                type="button"
                onClick={handleNext}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? "Submitting…" : "Complete Profile"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
