import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  computeTransactionCount,
  formatCurrency,
  formatPercent,
} from "./financial-utils";
import type { FinancialMovement } from "./financial-types";

const sampleMovements: FinancialMovement[] = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 250,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
  {
    create_date: "2024-02-01",
    amount: 500,
    operation_type: "income",
    category: "sales",
    business_type: "B2C",
  },
];

describe("computeKPIs", () => {
  it("calculates totals and profit values", () => {
    const metrics = computeKPIs(sampleMovements);

    expect(metrics).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
      transactionCount: 3,
    });
  });

  it("returns zeroed totals for an empty list", () => {
    expect(computeKPIs([])).toEqual({
      totalIncome: 0,
      totalOutcome: 0,
      profit: 0,
      profitPercent: 0,
      transactionCount: 0,
    });
  });

  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
});

describe("computeTransactionCount", () => {
  it("returns the number of movements", () => {
    expect(computeTransactionCount(sampleMovements)).toBe(3);
  });

  it("returns 0 for an empty list", () => {
    expect(computeTransactionCount([])).toBe(0);
  });
});

describe("computeMonthlyData", () => {
  it("returns an empty list when there are no movements", () => {
    expect(computeMonthlyData([])).toEqual([]);
  });

  it("returns chronological year-month points with aggregated totals", () => {
    const unsortedCrossYearMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-08",
        amount: 300,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2025-12-05",
        amount: 200,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-03",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];
    const monthlyData = computeMonthlyData(unsortedCrossYearMovements);

    expect(monthlyData).toHaveLength(2);
    expect(monthlyData[0]).toEqual({
      month: "Dec 2025",
      income: 1000,
      outcome: 200,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profitPercent: 100,
    });
  });

  it("keeps profitPercent at 0 for months with only outcomes", () => {
    const outcomeOnlyMovements: FinancialMovement[] = [
      {
        create_date: "2024-04-02",
        amount: 120,
        operation_type: "outcome",
        category: "suppliers",
        business_type: "B2B",
      },
      {
        create_date: "2024-04-18",
        amount: 80,
        operation_type: "outcome",
        category: "administrative",
        business_type: "B2C",
      },
    ];

    expect(computeMonthlyData(outcomeOnlyMovements)).toEqual([
      {
        month: "Apr 2024",
        income: 0,
        outcome: 200,
        profitPercent: 0,
      },
    ]);
  });

  it("aggregates multiple operations in the same month", () => {
    const sameMonthMovements: FinancialMovement[] = [
      {
        create_date: "2024-05-01",
        amount: 700,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
      {
        create_date: "2024-05-12",
        amount: 300,
        operation_type: "income",
        category: "others",
        business_type: "B2C",
      },
      {
        create_date: "2024-05-20",
        amount: 250,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2024-05-27",
        amount: 150,
        operation_type: "outcome",
        category: "suppliers",
        business_type: "B2C",
      },
    ];

    expect(computeMonthlyData(sameMonthMovements)).toEqual([
      {
        month: "May 2024",
        income: 1000,
        outcome: 400,
        profitPercent: 60,
      },
    ]);
  });
});

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});
