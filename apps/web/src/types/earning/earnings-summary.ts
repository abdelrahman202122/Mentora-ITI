export type EarningsSummary = {
  pending: {
    count: number;
    totalAmount: number;
  };
  available: {
    count: number;
    totalAmount: number;
  };
  paid_out: {
    count: number;
    totalAmount: number;
  };
};