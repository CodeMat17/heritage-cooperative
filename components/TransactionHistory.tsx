"use client";

import { Transaction } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  HandCoins,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TRANSACTIONS_PER_PAGE = 10;

export default function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
  );

  // Calculate pagination
  const totalPages = Math.ceil(
    sortedTransactions.length / TRANSACTIONS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "contribution":
        return <TrendingUp className='h-4 w-4 text-green-600' />;
      case "withdrawal":
        return <TrendingDown className='h-4 w-4 text-red-600' />;
      case "fund":
        return <Wallet className='h-4 w-4 text-blue-600' />;
      case "loan":
        return <HandCoins className='h-4 w-4 text-purple-600' />;
      default:
        return <Wallet className='h-4 w-4 text-gray-600' />;
    }
  };

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    switch (type) {
      case "contribution":
        return "Contribution";
      case "withdrawal":
        return "Withdrawal";
      case "fund":
        return "Funding";
      case "loan":
        return "Loan";
      default:
        return "Transaction";
    }
  };

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "contribution":
        return "text-green-600";
      case "withdrawal":
        return "text-red-600";
      case "fund":
        return "text-blue-600";
      case "loan":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getAmountPrefix = (type: Transaction["type"]) => {
    switch (type) {
      case "contribution":
      case "fund":
        return "+";
      case "withdrawal":
      case "loan":
        return "-";
      default:
        return "";
    }
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center py-8'>
            <Wallet className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No Transactions Yet</h3>
            <p className='text-muted-foreground'>
              Your transaction history will appear here once you start making
              contributions or withdrawals.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4 w-full'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Transaction History</h2>
        <div className='text-sm text-muted-foreground'>
          {sortedTransactions.length} total transactions
        </div>
      </div>

      <div className='space-y-3'>
        {currentTransactions.map((transaction) => (
          <Card
            key={transaction.id}
            className='hover:shadow-md transition-shadow'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='flex-shrink-0'>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium text-sm'>
                        {getTransactionTypeLabel(transaction.type)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-muted ${getTransactionColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </div>
                    {transaction.note && (
                      <p className='text-sm text-muted-foreground truncate'>
                        {transaction.note}
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground'>
                      {formatDate(transaction.createdAtIso)}
                    </p>
                  </div>
                </div>
                <div className='flex-shrink-0 text-right'>
                  <div
                    className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {getAmountPrefix(transaction.type)}
                    N{(transaction.amountNaira)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between pt-4'>
          <div className='text-sm text-muted-foreground'>
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, sortedTransactions.length)} of{" "}
            {sortedTransactions.length} transactions
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}>
              <ChevronLeft className='h-4 w-4' />
              Previous
            </Button>
            <div className='flex items-center space-x-1'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size='sm'
                    onClick={() => setCurrentPage(page)}
                    className='w-8 h-8 p-0'>
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}>
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
