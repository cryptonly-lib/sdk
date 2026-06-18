/** On-chain settlement breakdown when an invoice or deposit is paid/completed. */
export interface SettlementBreakdown {
  amountPaid: number;
  amountPaidUsd: number;
  commissionAmount: number;
  commissionAmountUsd: number;
  networkFeeAmount: number;
  networkFeeAmountUsd: number;
  networkFeeCurrencyCode: string;
  netAmount: number;
  netAmountUsd: number;
  txHash?: string;
  completedAt: string;
}
