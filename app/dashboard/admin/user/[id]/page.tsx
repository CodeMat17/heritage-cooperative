"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface User {
  _id: Id<"users">;
  clerkUserId: string;
  fullName: string;
  email: string;
  tier?: string;
  totalContributed?: number;
  role?: string;
  gender: string;
  nickName: string;
  motherMaidenName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  stateOfOrigin: string;
  lga: string;
  homeTown: string;
  maritalStatus: string;
  mobilePhoneNumber: string;
  otherPhoneNumber?: string;
  residentialAddress: string;
  permanentAddress: string;
  taxIdentificationNumber: string;
  typeOfTrade: string;
  yearsInTrade: number;
  otherTradeOrSkill?: string;
  meansOfIdentification: string;
  meansOfIdentificationStartDate: string;
  meansOfIdentificationExpiryDate: string;
  educationalBackground: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bvn: string;
  nokSurname: string;
  nokFirstName: string;
  nokOtherName: string;
  nokTitle: string;
  nokDateOfBirth: string;
  nokGender: string;
  nokRelationship: string;
  nokPhoneNumber: string;
  nokEmail: string;
  nokHouseAddress: string;
}

interface Contribution {
  _id: Id<"userContributions">;
  clerkUserId: string;
  fullName: string;
  email: string;
  transactionRef: string;
  gatewayRef?: string;
  amount: number;
  merchantAmount: number;
  currency: string;
  transactionStatus: string;
  transactionType: string;
  paymentType?: string;
  cardType?: string;
  pan?: string;
  tokenId?: string;
  customerMobile?: string;
  isRecurring?: boolean;
  meta?: Record<string, unknown>;
  merchantId?: string;
  squadCreatedAt: string;
  processedAt: number;
  isProcessed: boolean;
  processingNotes?: string;
}

interface LoanApplication {
  _id: Id<"loanApplications">;
  clerkUserId: string;
  fullName: string;
  email: string;
  loanAmount: number;
  loanPurpose: string;
  repaymentPeriod: number;
  monthlyIncome: number;
  employmentStatus: string;
  employerName?: string;
  employerAddress?: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorAddress: string;
  guarantorRelationship: string;
  status: string;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  reviewNotes?: string;
}

const UserDetailsPage = () => {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const userId = params.id as Id<"users">;

  const [activeTab, setActiveTab] = useState("overview");
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);

  // Queries
  const userData = useQuery(api.users.getUserById, { id: userId }) as
    | User
    | undefined;
  const contributions = useQuery(api.userContributions.getByUserId, {
    clerkUserId: userData?.clerkUserId || "",
  }) as Contribution[] | undefined;
  const loanApplications = useQuery(
    api.loanApplications.getUserLoanApplications
  ) as LoanApplication[] | undefined;

  // Mutations
  const updateLoanStatus = useMutation(
    api.loanApplications.updateLoanApplicationStatus
  );

  // Check admin role
  if (!user || user.publicMetadata?.role !== "admin") {
    return (
      <div className='px-4 py-8 min-h-screen max-w-7xl mx-auto'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-600'>Access Denied</h1>
          <p className='text-muted-foreground'>Admin privileges required</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className='px-4 py-8 min-h-screen max-w-7xl mx-auto'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='px-4 py-8 min-h-screen max-w-7xl mx-auto'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-600'>User Not Found</h1>
          <p className='text-muted-foreground'>
            The requested user could not be found
          </p>
          <Button asChild className='mt-4'>
            <Link href='/dashboard/admin'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateLoanStatus = async (
    id: Id<"loanApplications">,
    status: string
  ) => {
    try {
      await updateLoanStatus({
        id,
        status,
        reviewNotes: reviewNotes || undefined,
      });
      toast.success(`Loan application ${status}`);
      setReviewNotes("");
      setSelectedApplication(null);
    } catch (error) {
      toast.error("Failed to update loan status");
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (timestamp: number | string) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      repaid: "bg-emerald-100 text-emerald-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return <Badge variant='outline'>No Tier</Badge>;

    const variants: Record<string, string> = {
      bronze: "bg-orange-100 text-orange-800",
      silver: "bg-gray-100 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      diamond: "bg-blue-100 text-blue-800",
      emerald: "bg-green-100 text-green-800",
    };

    return (
      <Badge
        className={variants[tier.toLowerCase()] || "bg-gray-100 text-gray-800"}>
        {tier}
      </Badge>
    );
  };

  return (
    <div className='px-4 py-8 min-h-screen max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button asChild variant='outline' size='sm'>
            <Link href='/dashboard/admin'>
              <ArrowLeft className='w-4 h-4' />
              <span className='sm:inline-block hidden'>Back</span>
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold'>
              {userData.fullName}
            </h1>
            <p className='text-muted-foreground'>{userData.email}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {getTierBadge(userData.tier)}
          <Badge variant='outline'>
            {formatCurrency(userData.totalContributed || 0)} Total
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4 gap-3'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='payments'>Payments</TabsTrigger>
          <TabsTrigger value='loans'>Loans</TabsTrigger>
          <TabsTrigger value='admin'>Admin</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='w-5 h-5' />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Full Name
                    </Label>
                    <p className='font-medium'>{userData.fullName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Nickname
                    </Label>
                    <p className='font-medium'>{userData.nickName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Gender
                    </Label>
                    <p className='font-medium'>{userData.gender}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Date of Birth
                    </Label>
                    <p className='font-medium'>{userData.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Place of Birth
                    </Label>
                    <p className='font-medium'>{userData.placeOfBirth}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Nationality
                    </Label>
                    <p className='font-medium'>{userData.nationality}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Marital Status
                    </Label>
                    <p className='font-medium'>{userData.maritalStatus}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Mother&apos;s Maiden Name
                    </Label>
                    <p className='font-medium'>{userData.motherMaidenName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Phone className='w-5 h-5' />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-muted-foreground' />
                    <span className='font-medium'>{userData.email}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {userData.mobilePhoneNumber}
                    </span>
                  </div>
                  {userData.otherPhoneNumber && (
                    <div className='flex items-center gap-2'>
                      <Phone className='w-4 h-4 text-muted-foreground' />
                      <span className='font-medium'>
                        {userData.otherPhoneNumber}
                      </span>
                    </div>
                  )}
                  <div className='flex items-start gap-2'>
                    <MapPin className='w-4 h-4 text-muted-foreground mt-1' />
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Residential Address
                      </Label>
                      <p className='font-medium'>
                        {userData.residentialAddress}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-2'>
                    <Home className='w-4 h-4 text-muted-foreground mt-1' />
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Permanent Address
                      </Label>
                      <p className='font-medium'>{userData.permanentAddress}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Origin Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='w-5 h-5' />
                  Origin Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      State of Origin
                    </Label>
                    <p className='font-medium'>{userData.stateOfOrigin}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      LGA
                    </Label>
                    <p className='font-medium'>{userData.lga}</p>
                  </div>
                  <div className='col-span-2'>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Home Town
                    </Label>
                    <p className='font-medium'>{userData.homeTown}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Building2 className='w-5 h-5' />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Type of Trade
                    </Label>
                    <p className='font-medium'>{userData.typeOfTrade}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Years in Trade
                    </Label>
                    <p className='font-medium'>{userData.yearsInTrade} years</p>
                  </div>
                  {userData.otherTradeOrSkill && (
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Other Trade/Skill
                      </Label>
                      <p className='font-medium'>
                        {userData.otherTradeOrSkill}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Educational Background
                    </Label>
                    <p className='font-medium'>
                      {userData.educationalBackground}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identification */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='w-5 h-5' />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Means of Identification
                    </Label>
                    <p className='font-medium'>
                      {userData.meansOfIdentification}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      TIN
                    </Label>
                    <p className='font-medium'>
                      {userData.taxIdentificationNumber}
                    </p>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Start Date
                      </Label>
                      <p className='font-medium'>
                        {userData.meansOfIdentificationStartDate}
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Expiry Date
                      </Label>
                      <p className='font-medium'>
                        {userData.meansOfIdentificationExpiryDate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CreditCard className='w-5 h-5' />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Account Name
                    </Label>
                    <p className='font-medium'>{userData.accountName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Account Number
                    </Label>
                    <p className='font-medium'>{userData.accountNumber}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Bank Name
                    </Label>
                    <p className='font-medium'>{userData.bankName}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      BVN
                    </Label>
                    <p className='font-medium'>{userData.bvn}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next of Kin */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Next of Kin
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Full Name
                    </Label>
                    <p className='font-medium'>
                      {userData.nokTitle} {userData.nokFirstName}{" "}
                      {userData.nokOtherName} {userData.nokSurname}
                    </p>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Gender
                      </Label>
                      <p className='font-medium'>{userData.nokGender}</p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Date of Birth
                      </Label>
                      <p className='font-medium'>{userData.nokDateOfBirth}</p>
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      Relationship
                    </Label>
                    <p className='font-medium'>{userData.nokRelationship}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-muted-foreground' />
                    <span className='font-medium'>
                      {userData.nokPhoneNumber}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-muted-foreground' />
                    <span className='font-medium'>{userData.nokEmail}</span>
                  </div>
                  <div className='flex items-start gap-2'>
                    <MapPin className='w-4 h-4 text-muted-foreground mt-1' />
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Address
                      </Label>
                      <p className='font-medium'>{userData.nokHouseAddress}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contributions Tab */}
        <TabsContent value='payments' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                {/* <DollarSign className='w-5 h-5' /> */}
                Payment History
              </CardTitle>
              <CardDescription>
                All payments made by {userData.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contributions && contributions.length > 0 ? (
                <div className='space-y-4'>
                  {contributions.map((contribution) => (
                    <div
                      key={contribution._id}
                      className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h3 className='font-semibold'>
                            {formatCurrency(contribution.amount / 100)}
                          </h3>
                          {getStatusBadge(contribution.transactionStatus)}
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground'>
                          <div>
                            <strong>Transaction Ref:</strong>{" "}
                            {contribution.transactionRef}
                          </div>
                          <div>
                            <strong>Type:</strong>{" "}
                            {contribution.transactionType}
                          </div>
                          <div>
                            <strong>Payment:</strong>{" "}
                            {contribution.paymentType || "N/A"}
                          </div>
                          <div>
                            <strong>Date:</strong>{" "}
                            {formatDate(contribution.squadCreatedAt)}
                          </div>
                          <div>
                            <strong>Processed:</strong>{" "}
                            {contribution.isProcessed ? "Yes" : "No"}
                          </div>
                          {contribution.gatewayRef && (
                            <div>
                              <strong>Gateway Ref:</strong>{" "}
                              {contribution.gatewayRef}
                            </div>
                          )}
                        </div>
                        {contribution.processingNotes && (
                          <div className='mt-2'>
                            <strong className='text-sm'>Notes:</strong>
                            <p className='text-sm text-muted-foreground'>
                              {contribution.processingNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <DollarSign className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No contributions found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value='loans' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='w-5 h-5' />
                Loan Applications
              </CardTitle>
              <CardDescription>
                All loan applications by {userData.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loanApplications && loanApplications.length > 0 ? (
                <div className='space-y-4'>
                  {loanApplications
                    .filter((app) => app.clerkUserId === userData.clerkUserId)
                    .map((application) => (
                      <div
                        key={application._id}
                        className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-semibold'>
                              {formatCurrency(application.loanAmount)}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground'>
                            <div>
                              <strong>Purpose:</strong>{" "}
                              {application.loanPurpose}
                            </div>
                            <div>
                              <strong>Period:</strong>{" "}
                              {application.repaymentPeriod} months
                            </div>
                            <div>
                              <strong>Monthly Income:</strong>{" "}
                              {formatCurrency(application.monthlyIncome)}
                            </div>
                            <div>
                              <strong>Employment:</strong>{" "}
                              {application.employmentStatus}
                            </div>
                            <div>
                              <strong>Submitted:</strong>{" "}
                              {formatDate(application.submittedAt)}
                            </div>
                            {application.reviewedAt && (
                              <div>
                                <strong>Reviewed:</strong>{" "}
                                {formatDate(application.reviewedAt)}
                              </div>
                            )}
                          </div>
                          {application.reviewNotes && (
                            <div className='mt-2'>
                              <strong className='text-sm'>Review Notes:</strong>
                              <p className='text-sm text-muted-foreground'>
                                {application.reviewNotes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className='flex items-center gap-2'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  setSelectedApplication(application)
                                }>
                                <Eye className='h-4 w-4 mr-2' />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                              <DialogHeader>
                                <DialogTitle>
                                  Loan Application Details
                                </DialogTitle>
                                <DialogDescription>
                                  Review application and take action
                                </DialogDescription>
                              </DialogHeader>
                              {selectedApplication && (
                                <div className='space-y-4'>
                                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                      <h4 className='font-semibold'>
                                        Application Details
                                      </h4>
                                      <p>
                                        <strong>Amount:</strong>{" "}
                                        {formatCurrency(
                                          selectedApplication.loanAmount
                                        )}
                                      </p>
                                      <p>
                                        <strong>Purpose:</strong>{" "}
                                        {selectedApplication.loanPurpose}
                                      </p>
                                      <p>
                                        <strong>Period:</strong>{" "}
                                        {selectedApplication.repaymentPeriod}{" "}
                                        months
                                      </p>
                                      <p>
                                        <strong>Monthly Income:</strong>{" "}
                                        {formatCurrency(
                                          selectedApplication.monthlyIncome
                                        )}
                                      </p>
                                      <p>
                                        <strong>Employment:</strong>{" "}
                                        {selectedApplication.employmentStatus}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className='font-semibold'>
                                        Guarantor Information
                                      </h4>
                                      <p>
                                        <strong>Name:</strong>{" "}
                                        {selectedApplication.guarantorName}
                                      </p>
                                      <p>
                                        <strong>Phone:</strong>{" "}
                                        {selectedApplication.guarantorPhone}
                                      </p>
                                      <p>
                                        <strong>Relationship:</strong>{" "}
                                        {
                                          selectedApplication.guarantorRelationship
                                        }
                                      </p>
                                      <p>
                                        <strong>Address:</strong>{" "}
                                        {selectedApplication.guarantorAddress}
                                      </p>
                                    </div>
                                  </div>

                                  {(selectedApplication.status === "pending" || selectedApplication.status === "approved") && (
                                    <div className='space-y-4'>
                                      <div>
                                        <Label>Review Notes</Label>
                                        <Textarea
                                          placeholder='Add review notes...'
                                          value={reviewNotes}
                                          onChange={(e) =>
                                            setReviewNotes(e.target.value)
                                          }
                                        />
                                      </div>
                                      <div className='flex flex-wrap gap-2'>
                                        {selectedApplication.status === "pending" && (
                                          <Button
                                            onClick={() =>
                                              handleUpdateLoanStatus(
                                                selectedApplication._id,
                                                "approved"
                                              )
                                            }
                                            className='bg-green-600 hover:bg-green-700'>
                                            <CheckCircle className='h-4 w-4 mr-2' />
                                            Approve
                                          </Button>
                                        )}
                                        {selectedApplication.status === "pending" && (
                                          <Button
                                            onClick={() =>
                                              handleUpdateLoanStatus(
                                                selectedApplication._id,
                                                "rejected"
                                              )
                                            }
                                            variant='destructive'>
                                            <XCircle className='h-4 w-4 mr-2' />
                                            Reject
                                          </Button>
                                        )}
                                        {selectedApplication.status === "approved" && (
                                          <Button
                                            onClick={() =>
                                              handleUpdateLoanStatus(
                                                selectedApplication._id,
                                                "repaid"
                                              )
                                            }
                                            className='bg-emerald-600 hover:bg-emerald-700'>
                                            <CheckCircle className='h-4 w-4 mr-2' />
                                            Mark as Repaid
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <CreditCard className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No loan applications found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value='admin' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Edit className='w-5 h-5' />
                Admin Controls
              </CardTitle>
              <CardDescription>
                Manage user settings and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* User Info */}
              <div className='space-y-1'>
                <h3 className='font-semibold'>Current Package</h3>
                <p className='text-sm text-muted-foreground capitalize'>
                  {userData.tier || "No package assigned"}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Package can only be changed by the user after a loan is marked as repaid.
                </p>
              </div>

              {/* User Statistics */}
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-semibold text-sm text-muted-foreground'>
                    Total Contributions
                  </h4>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(userData.totalContributed || 0)}
                  </p>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-semibold text-sm text-muted-foreground'>
                    Contribution Count
                  </h4>
                  <p className='text-2xl font-bold'>
                    {contributions?.length || 0}
                  </p>
                </div>
                <div className='p-4 border rounded-lg'>
                  <h4 className='font-semibold text-sm text-muted-foreground'>
                    Loan Applications
                  </h4>
                  <p className='text-2xl font-bold'>
                    {loanApplications?.filter(
                      (app) => app.clerkUserId === userData.clerkUserId
                    ).length || 0}
                  </p>
                </div>
              </div>

              {/* Account Information */}
              <div className='space-y-4'>
                <h3 className='font-semibold'>Account Information</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <Label className='text-muted-foreground'>User ID</Label>
                    <p className='font-mono'>{userData._id}</p>
                  </div>
                  <div>
                    <Label className='text-muted-foreground'>
                      Clerk User ID
                    </Label>
                    <p className='font-mono'>{userData.clerkUserId}</p>
                  </div>
                  <div>
                    <Label className='text-muted-foreground'>Role</Label>
                    <p>{userData.role || "User"}</p>
                  </div>
                  <div>
                    <Label className='text-muted-foreground'>Email</Label>
                    <p>{userData.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailsPage;
