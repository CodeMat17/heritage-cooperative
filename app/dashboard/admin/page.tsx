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
import { Input } from "@/components/ui/input";
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Type definitions
interface User {
  _id: Id<"users">;
  clerkUserId: string;
  fullName: string;
  email: string;
  tier?: string;
  totalContributed?: number;
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

interface UsersData {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("all");

  // Queries
  const usersData = useQuery(api.users.getAllUsers, {
    search: userSearch,
    page: userPage,
    limit: 20,
  }) as UsersData | undefined;

  const loanApplications = useQuery(
    api.loanApplications.getAllLoanApplications,
    {
      status: applicationStatus === "all" ? undefined : applicationStatus,
    }
  ) as LoanApplication[] | undefined;

  // Mutations
  const updateLoanStatus = useMutation(
    api.loanApplications.updateLoanApplicationStatus
  );

  // Check admin role and redirect if not admin
  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata?.role as string;
      if (userRole !== "admin") {
        toast.error("Access denied. Admin privileges required.");
        router.push("/dashboard");
      }
    }
  }, [isLoaded, user, router]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render admin content if user is not admin
  if (!user || user.publicMetadata?.role !== "admin") {
    return null;
  }

  const handleUserSearch = (value: string) => {
    setUserSearch(value);
    setUserPage(1);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleViewApplication = (application: LoanApplication) => {
    setSelectedApplication(application);
  };

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
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-NG", {
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
    };
    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        <div className='flex items-center space-x-2'>
          <Users className='h-5 w-5' />
          <span className='text-sm text-muted-foreground'>
            {usersData?.total || 0} Total Users
          </span>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='users' className='flex items-center space-x-2'>
            <Users className='h-4 w-4' />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger
            value='applications'
            className='flex items-center space-x-2'>
            <FileText className='h-4 w-4' />
            <span>Loan Applications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all registered users and view their details
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search users by name, email, or phone...'
                    value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                {usersData?.users.map((user) => (
                  <div
                    key={user._id}
                    className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex-1'>
                      <h3 className='font-semibold'>{user.fullName}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {user.mobilePhoneNumber}
                      </p>
                      <div className='flex items-center space-x-2 mt-1'>
                        <Badge variant='outline'>
                          {user.tier || "No Tier"}
                        </Badge>
                        <span className='text-sm text-muted-foreground'>
                          Contributed:{" "}
                          {formatCurrency(user.totalContributed || 0)}
                        </span>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleViewUser(user)}>
                          <Eye className='h-4 w-4 mr-2' />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                        <DialogHeader>
                          <DialogTitle>User Details</DialogTitle>
                          <DialogDescription>
                            Complete user information
                          </DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                          <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <h4 className='font-semibold'>
                                  Personal Information
                                </h4>
                                <p>
                                  <strong>Full Name:</strong>{" "}
                                  {selectedUser.fullName}
                                </p>
                                <p>
                                  <strong>Email:</strong> {selectedUser.email}
                                </p>
                                <p>
                                  <strong>Phone:</strong>{" "}
                                  {selectedUser.mobilePhoneNumber}
                                </p>
                                <p>
                                  <strong>Gender:</strong> {selectedUser.gender}
                                </p>
                                <p>
                                  <strong>Date of Birth:</strong>{" "}
                                  {selectedUser.dateOfBirth}
                                </p>
                                <p>
                                  <strong>Nationality:</strong>{" "}
                                  {selectedUser.nationality}
                                </p>
                                <p>
                                  <strong>State of Origin:</strong>{" "}
                                  {selectedUser.stateOfOrigin}
                                </p>
                                <p>
                                  <strong>LGA:</strong> {selectedUser.lga}
                                </p>
                                <p>
                                  <strong>Home Town:</strong>{" "}
                                  {selectedUser.homeTown}
                                </p>
                                <p>
                                  <strong>Marital Status:</strong>{" "}
                                  {selectedUser.maritalStatus}
                                </p>
                              </div>
                              <div>
                                <h4 className='font-semibold'>
                                  Address Information
                                </h4>
                                <p>
                                  <strong>Residential Address:</strong>{" "}
                                  {selectedUser.residentialAddress}
                                </p>
                                <p>
                                  <strong>Permanent Address:</strong>{" "}
                                  {selectedUser.permanentAddress}
                                </p>
                                <h4 className='font-semibold mt-4'>
                                  Employment Information
                                </h4>
                                <p>
                                  <strong>Type of Trade:</strong>{" "}
                                  {selectedUser.typeOfTrade}
                                </p>
                                <p>
                                  <strong>Years in Trade:</strong>{" "}
                                  {selectedUser.yearsInTrade}
                                </p>
                                <p>
                                  <strong>Educational Background:</strong>{" "}
                                  {selectedUser.educationalBackground}
                                </p>
                                <h4 className='font-semibold mt-4'>
                                  Account Information
                                </h4>
                                <p>
                                  <strong>Account Name:</strong>{" "}
                                  {selectedUser.accountName}
                                </p>
                                <p>
                                  <strong>Account Number:</strong>{" "}
                                  {selectedUser.accountNumber}
                                </p>
                                <p>
                                  <strong>Bank Name:</strong>{" "}
                                  {selectedUser.bankName}
                                </p>
                                <p>
                                  <strong>BVN:</strong> {selectedUser.bvn}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h4 className='font-semibold'>Next of Kin</h4>
                              <p>
                                <strong>Name:</strong> {selectedUser.nokTitle}{" "}
                                {selectedUser.nokSurname}{" "}
                                {selectedUser.nokFirstName}{" "}
                                {selectedUser.nokOtherName}
                              </p>
                              <p>
                                <strong>Phone:</strong>{" "}
                                {selectedUser.nokPhoneNumber}
                              </p>
                              <p>
                                <strong>Email:</strong> {selectedUser.nokEmail}
                              </p>
                              <p>
                                <strong>Address:</strong>{" "}
                                {selectedUser.nokHouseAddress}
                              </p>
                              <p>
                                <strong>Relationship:</strong>{" "}
                                {selectedUser.nokRelationship}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {usersData && usersData.totalPages > 1 && (
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-muted-foreground'>
                    Showing {(userPage - 1) * 20 + 1} to{" "}
                    {Math.min(userPage * 20, usersData.total)} of{" "}
                    {usersData.total} users
                  </p>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setUserPage(userPage - 1)}
                      disabled={userPage === 1}>
                      <ChevronLeft className='h-4 w-4' />
                      Previous
                    </Button>
                    <span className='text-sm'>
                      Page {userPage} of {usersData.totalPages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setUserPage(userPage + 1)}
                      disabled={userPage === usersData.totalPages}>
                      Next
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='applications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
              <CardDescription>
                Review and manage loan applications
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Select
                  value={applicationStatus}
                  onValueChange={setApplicationStatus}>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Applications</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='approved'>Approved</SelectItem>
                    <SelectItem value='rejected'>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                {loanApplications?.map((application) => (
                  <div
                    key={application._id}
                    className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex-1'>
                      <h3 className='font-semibold'>{application.fullName}</h3>
                      <p className='text-sm text-muted-foreground'>
                        {application.email}
                      </p>
                      <div className='flex items-center space-x-4 mt-2'>
                        <span className='text-sm'>
                          <strong>Amount:</strong>{" "}
                          {formatCurrency(application.loanAmount)}
                        </span>
                        <span className='text-sm'>
                          <strong>Purpose:</strong> {application.loanPurpose}
                        </span>
                        <span className='text-sm'>
                          <strong>Period:</strong> {application.repaymentPeriod}{" "}
                          months
                        </span>
                        <span className='text-sm'>
                          <strong>Submitted:</strong>{" "}
                          {formatDate(application.submittedAt)}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 mt-2'>
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewApplication(application)}>
                            <Eye className='h-4 w-4 mr-2' />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                          <DialogHeader>
                            <DialogTitle>Loan Application Details</DialogTitle>
                            <DialogDescription>
                              Review application and take action
                            </DialogDescription>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className='space-y-4'>
                              <div className='grid grid-cols-2 gap-4'>
                                <div>
                                  <h4 className='font-semibold'>
                                    Applicant Information
                                  </h4>
                                  <p>
                                    <strong>Name:</strong>{" "}
                                    {selectedApplication.fullName}
                                  </p>
                                  <p>
                                    <strong>Email:</strong>{" "}
                                    {selectedApplication.email}
                                  </p>
                                  <p>
                                    <strong>Loan Amount:</strong>{" "}
                                    {formatCurrency(
                                      selectedApplication.loanAmount
                                    )}
                                  </p>
                                  <p>
                                    <strong>Purpose:</strong>{" "}
                                    {selectedApplication.loanPurpose}
                                  </p>
                                  <p>
                                    <strong>Repayment Period:</strong>{" "}
                                    {selectedApplication.repaymentPeriod} months
                                  </p>
                                  <p>
                                    <strong>Monthly Income:</strong>{" "}
                                    {formatCurrency(
                                      selectedApplication.monthlyIncome
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <h4 className='font-semibold'>
                                    Employment Details
                                  </h4>
                                  <p>
                                    <strong>Status:</strong>{" "}
                                    {selectedApplication.employmentStatus}
                                  </p>
                                  {selectedApplication.employerName && (
                                    <p>
                                      <strong>Employer:</strong>{" "}
                                      {selectedApplication.employerName}
                                    </p>
                                  )}
                                  {selectedApplication.employerAddress && (
                                    <p>
                                      <strong>Employer Address:</strong>{" "}
                                      {selectedApplication.employerAddress}
                                    </p>
                                  )}
                                  <h4 className='font-semibold mt-4'>
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
                                    <strong>Address:</strong>{" "}
                                    {selectedApplication.guarantorAddress}
                                  </p>
                                  <p>
                                    <strong>Relationship:</strong>{" "}
                                    {selectedApplication.guarantorRelationship}
                                  </p>
                                </div>
                              </div>

                              {selectedApplication.status === "pending" && (
                                <div className='space-y-4'>
                                  <div>
                                    <label className='text-sm font-medium'>
                                      Review Notes
                                    </label>
                                    <Textarea
                                      placeholder='Add review notes...'
                                      value={reviewNotes}
                                      onChange={(e) =>
                                        setReviewNotes(e.target.value)
                                      }
                                      className='mt-1'
                                    />
                                  </div>
                                  <div className='flex items-center space-x-2'>
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
                                  </div>
                                </div>
                              )}

                              {selectedApplication.status !== "pending" && (
                                <div>
                                  <h4 className='font-semibold'>
                                    Review Information
                                  </h4>
                                  <p>
                                    <strong>Status:</strong>{" "}
                                    {selectedApplication.status}
                                  </p>
                                  {selectedApplication.reviewedAt && (
                                    <p>
                                      <strong>Reviewed At:</strong>{" "}
                                      {formatDate(
                                        selectedApplication.reviewedAt
                                      )}
                                    </p>
                                  )}
                                  {selectedApplication.reviewNotes && (
                                    <p>
                                      <strong>Notes:</strong>{" "}
                                      {selectedApplication.reviewNotes}
                                    </p>
                                  )}
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

              {(!loanApplications || loanApplications.length === 0) && (
                <div className='text-center py-8'>
                  <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No loan applications found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
