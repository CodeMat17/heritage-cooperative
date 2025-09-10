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
  Eye,
  FileText,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const AdminPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [applicationSearch, setApplicationSearch] = useState("");

  // Queries
  const usersData = useQuery(api.users.getAllUsers) as User[] | undefined;

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
  // useEffect(() => {
  //   if (isLoaded && user) {
  //     const userRole = user.publicMetadata?.role as string;
  //     if (userRole !== "admin") {
  //       toast.error("Access denied. Admin privileges required.");
  //       router.push("/dashboard");
  //     }
  //   }
  // }, [isLoaded, user, router]);

  // Show loading state while checking authentication
  // if (!isLoaded) {
  //   return (
  //     <div className='container mx-auto p-6'>
  //       <div className='flex items-center justify-center min-h-[400px]'>
  //         <div className='text-center'>
  //           <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
  //           <p className='text-muted-foreground'>Loading...</p>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Don't render admin content if user is not admin
  if (!user || user.publicMetadata?.role !== "admin") {
    return null;
  }

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
      console.log(error);
    }
  };

  // Filter users based on search
  const filteredUsers = usersData?.filter((user) => {
    if (!userSearch) return true;
    const searchTerm = userSearch.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.mobilePhoneNumber.includes(searchTerm) ||
      (user.tier && user.tier.toLowerCase().includes(searchTerm))
    );
  });

  // Filter loan applications based on search
  const filteredApplications = loanApplications?.filter((application) => {
    if (!applicationSearch) return true;
    const searchTerm = applicationSearch.toLowerCase();
    return (
      application.fullName.toLowerCase().includes(searchTerm) ||
      application.email.toLowerCase().includes(searchTerm) ||
      application.loanPurpose.toLowerCase().includes(searchTerm) ||
      application.status.toLowerCase().includes(searchTerm)
    );
  });

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
    <div className='w-full min-h-screen max-w-7xl mx-auto px-3 sm:px-6 py-20 space-y-4 sm:space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0'>
        <h1 className='text-2xl sm:text-3xl font-bold'>Admin Dashboard</h1>
        <div className='flex items-center space-x-2'>
          <Users className='h-4 w-4 sm:h-5 sm:w-5' />
          <span className='text-xs sm:text-sm text-muted-foreground'>
            {filteredUsers?.length || 0} of {usersData?.length || 0} Users
          </span>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-3 sm:space-y-4'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger
            value='users'
            className='flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm'>
            <Users className='h-3 w-3 sm:h-4 sm:w-4' />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger
            value='applications'
            className='flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm'>
            <FileText className='h-3 w-3 sm:h-4 sm:w-4' />
            <span>Loan Applications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='users' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all registered users and view their details
                {userSearch && (
                  <span className='block mt-1 text-xs'>
                    Showing {filteredUsers?.length || 0} of{" "}
                    {usersData?.length || 0} results for &quot;{userSearch}
                    &quot;
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* User Search Filter */}
              <div className='flex items-center space-x-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search users by name, email, phone, or tier...'
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className='pl-10'
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch("")}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'>
                      <XCircle className='h-4 w-4' />
                    </button>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                {filteredUsers?.map((user) => (
                  <div
                    key={user._id}
                    className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-sm sm:text-base'>
                        {user.fullName}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        {user.mobilePhoneNumber}
                      </p>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-2 mt-2 sm:mt-1'>
                        <Badge variant='outline' className='text-xs'>
                          {user.tier || "No Tier"}
                        </Badge>
                        <span className='text-xs sm:text-sm text-muted-foreground'>
                          Contributed:{" "}
                          {formatCurrency(user.totalContributed || 0)}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant={"outline"} size={"sm"}>
                      <Link href={`/dashboard/admin/user/${user._id}`}>
                        <Eye className='w-4 h-4' />
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='applications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
              <CardDescription>
                Review and manage loan applications
                {applicationSearch && (
                  <span className='block mt-1 text-xs'>
                    Showing {filteredApplications?.length || 0} of{" "}
                    {loanApplications?.length || 0} results for &quot;
                    {applicationSearch}&quot;
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Loan Applications Search and Filter */}
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search applications by name, email, purpose, or status...'
                    value={applicationSearch}
                    onChange={(e) => setApplicationSearch(e.target.value)}
                    className='pl-10'
                  />
                  {applicationSearch && (
                    <button
                      onClick={() => setApplicationSearch("")}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'>
                      <XCircle className='h-4 w-4' />
                    </button>
                  )}
                </div>
                <Select
                  value={applicationStatus}
                  onValueChange={setApplicationStatus}>
                  <SelectTrigger className='w-full sm:w-[200px]'>
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
                {filteredApplications?.map((application) => (
                  <div
                    key={application._id}
                    className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-sm sm:text-base'>
                        {application.fullName}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        {application.email}
                      </p>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4 mt-2'>
                        <span className='text-xs sm:text-sm'>
                          <strong>Amount:</strong>{" "}
                          {formatCurrency(application.loanAmount)}
                        </span>
                        <span className='text-xs sm:text-sm'>
                          <strong>Purpose:</strong> {application.loanPurpose}
                        </span>
                        <span className='text-xs sm:text-sm'>
                          <strong>Period:</strong> {application.repaymentPeriod}{" "}
                          months
                        </span>
                        <span className='text-xs sm:text-sm'>
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
                            className='w-full sm:w-auto text-xs'
                            onClick={() => handleViewApplication(application)}>
                            <Eye className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto mx-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                          <DialogHeader>
                            <DialogTitle className='text-lg sm:text-xl'>
                              Loan Application Details
                            </DialogTitle>
                            <DialogDescription className='text-sm'>
                              Review application and take action
                            </DialogDescription>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className='space-y-4'>
                              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
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
                                  <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2'>
                                    <Button
                                      onClick={() =>
                                        handleUpdateLoanStatus(
                                          selectedApplication._id,
                                          "approved"
                                        )
                                      }
                                      className='bg-green-600 hover:bg-green-700 text-sm'>
                                      <CheckCircle className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleUpdateLoanStatus(
                                          selectedApplication._id,
                                          "rejected"
                                        )
                                      }
                                      variant='destructive'
                                      className='text-sm'>
                                      <XCircle className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
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
                <div className='text-center py-6 sm:py-8'>
                  <FileText className='h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4' />
                  <p className='text-sm sm:text-base text-muted-foreground'>
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
