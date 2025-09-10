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
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import { completeOnboarding } from "./_actions";

export default function OnboardingComponent() {
  const [error, setError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const { user } = useUser();
  const router = useRouter();
  const upsertUser = useMutation(api.users.upsertUserFromOnboarding);
  const [gender, setGender] = React.useState("");
  const [maritalStatus, setMaritalStatus] = React.useState("");
  const [meansOfIdentification, setMeansOfIdentification] = React.useState("");
  const [educationalBackground, setEducationalBackground] = React.useState("");
  const [nokGender, setNokGender] = React.useState("");
  const [nokRelationship, setNokRelationship] = React.useState("");
  const [stateValue, setStateValue] = React.useState("");
  const [lgaValue, setLgaValue] = React.useState("");
  const [dob, setDob] = React.useState<Date | undefined>();
  const [idStart, setIdStart] = React.useState<Date | undefined>();
  const [idExpiry, setIdExpiry] = React.useState<Date | undefined>();
  const [openDob, setOpenDob] = React.useState(false);
  const [openIdStart, setOpenIdStart] = React.useState(false);
  const [openIdExpiry, setOpenIdExpiry] = React.useState(false);
  const [nokDob, setNokDob] = React.useState<Date | undefined>();
  const [openNokDob, setOpenNokDob] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [fullName, setFullName] = React.useState(
    user?.fullName ||
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
      ""
  );

  // Update fullName when user data changes
  React.useEffect(() => {
    const userFullName =
      user?.fullName ||
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    if (userFullName && !fullName) {
      setFullName(userFullName);
    }
  }, [user, fullName]);

  function clearFieldError(field: string): void {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const rest = { ...prev };
      delete rest[field];
      return rest;
    });
  }

  const phoneRegex = /^\+?[0-9]{10,15}$/;
  const payloadSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    gender: z.string().min(1),
    nickName: z.string().min(1),
    motherMaidenName: z.string().min(1),
    dateOfBirth: z.string().min(1),
    placeOfBirth: z.string().min(1),
    nationality: z.string().min(1),
    stateOfOrigin: z.string().min(1),
    lga: z.string().min(1),
    homeTown: z.string().min(1),
    maritalStatus: z.string().min(1),
    mobilePhoneNumber: z
      .string()
      .regex(
        phoneRegex,
        "Enter a valid phone number (10-15 digits, optional +)"
      ),
    otherPhoneNumber: z
      .string()
      .optional()
      .superRefine((val, ctx) => {
        if (val && val.length > 0 && !phoneRegex.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter a valid phone number (10-15 digits, optional +)",
          });
        }
      }),
    residentialAddress: z.string().min(1),
    permanentAddress: z.string().min(1),
    taxIdentificationNumber: z.string().min(1),
    typeOfTrade: z.string().min(1),
    yearsInTrade: z.number().nonnegative(),
    otherTradeOrSkill: z.string().optional(),
    meansOfIdentification: z.string().min(1),
    meansOfIdentificationStartDate: z.string().min(1),
    meansOfIdentificationExpiryDate: z.string().min(1),
    educationalBackground: z.string().min(1),
    accountName: z.string().min(1),
    accountNumber: z.string().min(1),
    bankName: z.string().min(1),
    bvn: z.string().regex(/^\d{11}$/, "BVN must be exactly 11 digits"),
    nokSurname: z.string().min(1),
    nokFirstName: z.string().min(1),
    nokOtherName: z.string().min(1),
    nokTitle: z.string().min(1),
    nokDateOfBirth: z.string().min(1),
    nokGender: z.string().min(1),
    nokRelationship: z.string().min(1),
    nokPhoneNumber: z
      .string()
      .regex(
        phoneRegex,
        "Enter a valid phone number (10-15 digits, optional +)"
      ),
    nokEmail: z.string().email("Please enter a valid Next of Kin email"),
    nokHouseAddress: z.string().min(1),
  });

  // Using local bundled dataset (no async needed)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName:
        fullName ||
        user?.fullName ||
        `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
      email: user?.primaryEmailAddress?.emailAddress || "",
      gender: gender,
      nickName: String(fd.get("nickName") || ""),
      motherMaidenName: String(fd.get("motherMaidenName") || ""),
      dateOfBirth: dob ? dob.toISOString().split("T")[0] : "",
      placeOfBirth: String(fd.get("placeOfBirth") || ""),
      nationality: "Nigeria",
      stateOfOrigin: stateValue,
      lga: lgaValue,
      homeTown: String(fd.get("homeTown") || ""),
      maritalStatus: maritalStatus,
      mobilePhoneNumber: String(fd.get("mobilePhoneNumber") || ""),
      otherPhoneNumber: String(fd.get("otherPhoneNumber") || ""),
      residentialAddress: String(fd.get("residentialAddress") || ""),
      permanentAddress: String(fd.get("permanentAddress") || ""),
      taxIdentificationNumber: String(fd.get("taxIdentificationNumber") || ""),
      typeOfTrade: String(fd.get("typeOfTrade") || ""),
      yearsInTrade: Number(fd.get("yearsInTrade") || 0),
      otherTradeOrSkill: String(fd.get("otherTradeOrSkill") || ""),
      meansOfIdentification: meansOfIdentification,
      meansOfIdentificationStartDate: idStart
        ? idStart.toISOString().split("T")[0]
        : "",
      meansOfIdentificationExpiryDate: idExpiry
        ? idExpiry.toISOString().split("T")[0]
        : "",
      educationalBackground: educationalBackground,
      accountName: String(fd.get("accountName") || ""),
      accountNumber: String(fd.get("accountNumber") || ""),
      bankName: String(fd.get("bankName") || ""),
      bvn: String(fd.get("bvn") || ""),
      nokSurname: String(fd.get("nokSurname") || ""),
      nokFirstName: String(fd.get("nokFirstName") || ""),
      nokOtherName: String(fd.get("nokOtherName") || ""),
      nokTitle: String(fd.get("nokTitle") || ""),
      nokDateOfBirth: nokDob ? nokDob.toISOString().split("T")[0] : "",
      nokGender: nokGender,
      nokRelationship: nokRelationship,
      nokPhoneNumber: String(fd.get("nokPhoneNumber") || ""),
      nokEmail: String(fd.get("nokEmail") || ""),
      nokHouseAddress: String(fd.get("nokHouseAddress") || ""),
    };

    // Age restriction: must be at least 18 years old
    if (dob) {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }
      if (age < 18) {
        setFieldErrors((prev) => ({
          ...prev,
          dateOfBirth: "You must be at least 18 years old to subscribe.",
        }));
        setError("You must be at least 18 years old to subscribe.");
        toast.warning("Persons less than 18 years cannot subscribe");
        return;
      }
    }

    const parsed = payloadSchema.safeParse(payload);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = (issue.path?.[0] as string) || "";
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      setError(first?.message || "Please fill all required fields correctly.");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const res = await completeOnboarding(fd);
    if (res?.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    await user?.reload();
    // Confirm onboarding flag truly set before writing to Convex
    type CompleteOnboardingResult = {
      message?: { onboardingComplete?: boolean };
    };
    const result = res as CompleteOnboardingResult;
    const serverOnboardingComplete = Boolean(
      result?.message?.onboardingComplete === true
    );
    const clientOnboardingComplete = Boolean(
      (user?.publicMetadata as unknown as { onboardingComplete?: boolean })
        ?.onboardingComplete === true
    );
    if (!serverOnboardingComplete && !clientOnboardingComplete) {
      setError("Unable to confirm onboarding completion. Please try again.");
      toast.error("Onboarding not confirmed. Please try again.");
      setSubmitting(false);
      return;
    }

    await upsertUser(parsed.data);
    toast.success("Onboarding submitted successfully");
    router.push("/dashboard");
    setSubmitting(false);
  }

  const displayName =
    user?.fullName ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "there";

  return (
    <div className='w-full min-h-screen px-4 py-8 max-w-5xl mx-auto'>
      <h1 className='text-xl font-semibold'>Welcome, {displayName}</h1>
      <p className='text-muted-foreground'>
        Complete your profile to get started
      </p>
      <div className='mt-8 p-4 sm:p-6 border rounded-xl grid gap-4'>
        <form onSubmit={onSubmit} className='grid gap-6'>
          <section className='grid gap-4'>
            <h2 className='font-medium'>Personal Information</h2>
            <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4'>
              <div>
                <Label>Full name</Label>
                <Input
                  name='fullName'
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                />
                {fieldErrors.fullName && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={gender}
                  onValueChange={(v) => {
                    setGender(v);
                    clearFieldError("gender");
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.gender && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.gender}
                  </p>
                )}
              </div>
              <div>
                <Label>Marital status</Label>
                <Select
                  value={maritalStatus}
                  onValueChange={(v) => {
                    setMaritalStatus(v);
                    clearFieldError("maritalStatus");
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='single'>Single</SelectItem>
                    <SelectItem value='married'>Married</SelectItem>
                    <SelectItem value='divorced'>Divorced</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.maritalStatus && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.maritalStatus}
                  </p>
                )}
              </div>
              <div>
                <div>
                  <Label>Date of birth</Label>
                  <Popover open={openDob} onOpenChange={setOpenDob}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        id='dateOfBirth'
                        className='w-full justify-between font-normal'
                        type='button'>
                        {dob ? dob.toLocaleDateString() : "Select date"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto overflow-hidden p-0'
                      align='start'>
                      <Calendar
                        mode='single'
                        selected={dob}
                        captionLayout='dropdown'
                        onSelect={(date) => {
                          setDob(date as Date | undefined);
                          setOpenDob(false);
                          clearFieldError("dateOfBirth");
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldErrors.dateOfBirth && (
                    <p className='text-destructive text-xs mt-1'>
                      {fieldErrors.dateOfBirth}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>Place of birth</Label>
                <Input
                  name='placeOfBirth'
                  onChange={() => clearFieldError("placeOfBirth")}
                />
                {fieldErrors.placeOfBirth && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.placeOfBirth}
                  </p>
                )}
              </div>
              <div>
                <Label>Nick name</Label>
                <Input
                  name='nickName'
                  onChange={() => clearFieldError("nickName")}
                />
                {fieldErrors.nickName && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nickName}
                  </p>
                )}
              </div>
              <div>
                <Label>Mother&apos;s maiden name</Label>
                <Input
                  name='motherMaidenName'
                  onChange={() => clearFieldError("motherMaidenName")}
                />
                {fieldErrors.motherMaidenName && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.motherMaidenName}
                  </p>
                )}
              </div>

              <div>
                <Label>Nationality</Label>
                <Input name='nationality' value={"Nigeria"} readOnly />
                {fieldErrors.nationality && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nationality}
                  </p>
                )}
              </div>
              <div>
                <Label>State of origin</Label>
                <Select
                  value={stateValue}
                  onValueChange={(v) => {
                    setStateValue(v);
                    setLgaValue("");
                    clearFieldError("stateOfOrigin");
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select state' />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIA_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.stateOfOrigin && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.stateOfOrigin}
                  </p>
                )}
              </div>
              <div>
                <Label>LGA</Label>
                <Select
                  value={lgaValue}
                  onValueChange={(v) => {
                    setLgaValue(v);
                    clearFieldError("lga");
                  }}
                  disabled={!stateValue}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select LGA' />
                  </SelectTrigger>
                  <SelectContent>
                    {(NIGERIA_STATE_TO_LGAS[stateValue] ?? []).map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.lga && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.lga}
                  </p>
                )}
              </div>
              <div>
                <Label>Home town</Label>
                <Input
                  name='homeTown'
                  onChange={() => clearFieldError("homeTown")}
                />
                {fieldErrors.homeTown && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.homeTown}
                  </p>
                )}
              </div>

              <div>
                <Label>Mobile phone number</Label>
                <Input
                  name='mobilePhoneNumber'
                  type='tel'
                  onChange={() => clearFieldError("mobilePhoneNumber")}
                />
                {fieldErrors.mobilePhoneNumber && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.mobilePhoneNumber}
                  </p>
                )}
              </div>
              <div>
                <Label>Other phone number</Label>
                <Input
                  name='otherPhoneNumber'
                  type='tel'
                  onChange={() => clearFieldError("otherPhoneNumber")}
                />
                {fieldErrors.otherPhoneNumber && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.otherPhoneNumber}
                  </p>
                )}
              </div>
              <div className='sm:col-span-2'>
                <Label>Residential address</Label>
                <Textarea
                  name='residentialAddress'
                  rows={3}
                  onChange={() => clearFieldError("residentialAddress")}
                />
                {fieldErrors.residentialAddress && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.residentialAddress}
                  </p>
                )}
              </div>
              <div className='sm:col-span-2'>
                <Label>Permanent address</Label>
                <Textarea
                  name='permanentAddress'
                  rows={3}
                  onChange={() => clearFieldError("permanentAddress")}
                />
                {fieldErrors.permanentAddress && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.permanentAddress}
                  </p>
                )}
              </div>
              <div>
                <Label>Tax identification number</Label>
                <Input
                  name='taxIdentificationNumber'
                  onChange={() => clearFieldError("taxIdentificationNumber")}
                />
                {fieldErrors.taxIdentificationNumber && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.taxIdentificationNumber}
                  </p>
                )}
              </div>
              <div>
                <Label>Type of trade</Label>
                <Input
                  name='typeOfTrade'
                  onChange={() => clearFieldError("typeOfTrade")}
                />
                {fieldErrors.typeOfTrade && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.typeOfTrade}
                  </p>
                )}
              </div>
              <div>
                <Label>Number of years in trade</Label>
                <Input
                  name='yearsInTrade'
                  type='number'
                  min='0'
                  onChange={() => clearFieldError("yearsInTrade")}
                />
                {fieldErrors.yearsInTrade && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.yearsInTrade}
                  </p>
                )}
              </div>
              <div>
                <Label>Other trade or skill</Label>
                <Input
                  name='otherTradeOrSkill'
                  onChange={() => clearFieldError("otherTradeOrSkill")}
                />
                {fieldErrors.otherTradeOrSkill && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.otherTradeOrSkill}
                  </p>
                )}
              </div>
              <div>
                <Label>Means of identification</Label>
                <Select
                  value={meansOfIdentification}
                  onValueChange={(v) => {
                    setMeansOfIdentification(v);
                    clearFieldError("meansOfIdentification");
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select ID type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='national_id'>
                      National ID card
                    </SelectItem>
                    <SelectItem value='voters_card'>
                      Voter&apos;s card
                    </SelectItem>
                    <SelectItem value='passport'>
                      International passport
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.meansOfIdentification && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.meansOfIdentification}
                  </p>
                )}
              </div>
              <div>
                <div>
                  <Label>ID start date</Label>
                  <Popover open={openIdStart} onOpenChange={setOpenIdStart}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        id='idStart'
                        className='w-full justify-between font-normal'
                        type='button'>
                        {idStart ? idStart.toLocaleDateString() : "Select date"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto overflow-hidden p-0'
                      align='start'>
                      <Calendar
                        mode='single'
                        selected={idStart}
                        captionLayout='dropdown'
                        onSelect={(date) => {
                          setIdStart(date as Date | undefined);
                          setOpenIdStart(false);
                          clearFieldError("meansOfIdentificationStartDate");
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldErrors.meansOfIdentificationStartDate && (
                    <p className='text-destructive text-xs mt-1'>
                      {fieldErrors.meansOfIdentificationStartDate}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <div>
                  <Label>ID expiry date</Label>
                  <Popover open={openIdExpiry} onOpenChange={setOpenIdExpiry}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        id='idExpiry'
                        className='w-full justify-between font-normal'
                        type='button'>
                        {idExpiry
                          ? idExpiry.toLocaleDateString()
                          : "Select date"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto overflow-hidden p-0'
                      align='start'>
                      <Calendar
                        mode='single'
                        selected={idExpiry}
                        captionLayout='dropdown'
                        onSelect={(date) => {
                          setIdExpiry(date as Date | undefined);
                          setOpenIdExpiry(false);
                          clearFieldError("meansOfIdentificationExpiryDate");
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldErrors.meansOfIdentificationExpiryDate && (
                    <p className='text-destructive text-xs mt-1'>
                      {fieldErrors.meansOfIdentificationExpiryDate}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label>Educational background</Label>
                <Select
                  value={educationalBackground}
                  onValueChange={(v) => {
                    setEducationalBackground(v);
                    clearFieldError("educationalBackground");
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='fslc'>FSLC</SelectItem>
                    <SelectItem value='wassce'>WASSCE</SelectItem>
                    <SelectItem value='bsc_plus'>B.SC & above</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.educationalBackground && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.educationalBackground}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className='grid gap-4'>
            <h2 className='font-medium'>Account Details</h2>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div>
                <Label>Account name</Label>
                <Input
                  name='accountName'
                  onChange={() => clearFieldError("accountName")}
                />
                {fieldErrors.accountName && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.accountName}
                  </p>
                )}
              </div>
              <div>
                <Label>Account number</Label>
                <Input
                  name='accountNumber'
                  onChange={() => clearFieldError("accountNumber")}
                />
                {fieldErrors.accountNumber && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.accountNumber}
                  </p>
                )}
              </div>
              <div>
                <Label>Bank name</Label>
                <Input
                  name='bankName'
                  onChange={() => clearFieldError("bankName")}
                />
                {fieldErrors.bankName && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.bankName}
                  </p>
                )}
              </div>
              <div>
                <Label>BVN</Label>
                <Input name='bvn' onChange={() => clearFieldError("bvn")} />
                {fieldErrors.bvn && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.bvn}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className='grid gap-4'>
            <h2 className='font-medium'>Next of Kin</h2>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div>
                <Label>Surname</Label>
                <Input
                  name='nokSurname'
                  onChange={() => clearFieldError("nokSurname")}
                />
                {fieldErrors.nokSurname && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokSurname}
                  </p>
                )}
              </div>
              <div>
                <Label>First name</Label>
                <Input
                  name='nokFirstName'
                  onChange={() => clearFieldError("nokFirstName")}
                />
                {fieldErrors.nokFirstName && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokFirstName}
                  </p>
                )}
              </div>
              <div>
                <Label>Other name</Label>
                <Input
                  name='nokOtherName'
                  onChange={() => clearFieldError("nokOtherName")}
                />
                {fieldErrors.nokOtherName && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokOtherName}
                  </p>
                )}
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  name='nokTitle'
                  onChange={() => clearFieldError("nokTitle")}
                />
                {fieldErrors.nokTitle && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokTitle}
                  </p>
                )}
              </div>

              <div>
                <Label>Date of birth</Label>
                <Popover open={openNokDob} onOpenChange={setOpenNokDob}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      id='nokDateOfBirth'
                      className='w-full justify-between font-normal'
                      type='button'>
                      {nokDob ? nokDob.toLocaleDateString() : "Select date"}
                      <ChevronDown />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-auto overflow-hidden p-0'
                    align='start'>
                    <Calendar
                      mode='single'
                      selected={nokDob}
                      captionLayout='dropdown'
                      onSelect={(date) => {
                        setNokDob(date as Date | undefined);
                        setOpenNokDob(false);
                        clearFieldError("nokDateOfBirth");
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {fieldErrors.nokDateOfBirth && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokDateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <Label>Gender</Label>
                <Select
                  value={nokGender}
                  onValueChange={(v) => {
                    setNokGender(v);
                    clearFieldError("nokGender");
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.nokGender && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokGender}
                  </p>
                )}
              </div>
              <div>
                <Label>Relationship</Label>
                <Select
                  value={nokRelationship}
                  onValueChange={(v) => {
                    setNokRelationship(v);
                    clearFieldError("nokRelationship");
                  }}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='single'>Single</SelectItem>
                    <SelectItem value='married'>Married</SelectItem>
                    <SelectItem value='divorced'>Divorced</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.nokRelationship && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokRelationship}
                  </p>
                )}
              </div>
              <div>
                <Label>Phone number</Label>
                <Input
                  name='nokPhoneNumber'
                  type='tel'
                  onChange={() => clearFieldError("nokPhoneNumber")}
                />
                {fieldErrors.nokPhoneNumber && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokPhoneNumber}
                  </p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name='nokEmail'
                  type='email'
                  onChange={() => clearFieldError("nokEmail")}
                />
                {fieldErrors.nokEmail && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokEmail}
                  </p>
                )}
              </div>
              <div className='sm:col-span-2'>
                <Label>House address</Label>
                <Textarea
                  name='nokHouseAddress'
                  rows={3}
                  onChange={() => clearFieldError("nokHouseAddress")}
                />
                {fieldErrors.nokHouseAddress && (
                  <p className='text-destructive text-xs mt-1'>
                    {fieldErrors.nokHouseAddress}
                  </p>
                )}
              </div>
            </div>
          </section>

          {error && <p className='text-red-600'>Error: {error}</p>}
          <div>
            <button
              type='submit'
              disabled={submitting}
              className='h-10 px-4 rounded-md bg-primary text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed'>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
