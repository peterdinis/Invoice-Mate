import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import connectToDB from "@/lib/auth/mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const [
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalInvoices,
      thisMonthInvoices,
      lastMonthInvoices,
      paidInvoices,
    ] = await Promise.all([
      // Total revenue (all paid invoices)
      Invoice.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // This month revenue
      Invoice.aggregate([
        {
          $match: {
            status: "paid",
            invoiceDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Last month revenue
      Invoice.aggregate([
        {
          $match: {
            status: "paid",
            invoiceDate: { $gte: firstDayOfLastMonth, $lt: firstDayOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Total invoices
      Invoice.countDocuments(),

      // This month invoices
      Invoice.countDocuments({
        invoiceDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      }),

      // Last month invoices
      Invoice.countDocuments({
        invoiceDate: { $gte: firstDayOfLastMonth, $lt: firstDayOfMonth },
      }),

      // Paid invoices this month
      Invoice.countDocuments({
        status: "paid",
        invoiceDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      }),
    ]);

    const totalRevenueAmount = totalRevenue[0]?.total || 0;
    const thisMonthAmount = thisMonthRevenue[0]?.total || 0;
    const lastMonthAmount = lastMonthRevenue[0]?.total || 0;

    // Calculate percentage changes
    const revenueChange =
      lastMonthAmount > 0
        ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
        : 0;

    const invoiceChange =
      lastMonthInvoices > 0
        ? ((thisMonthInvoices - lastMonthInvoices) / lastMonthInvoices) * 100
        : 0;

    return NextResponse.json({
      totalRevenue: totalRevenueAmount,
      revenueChange: parseFloat(revenueChange.toFixed(1)),
      totalInvoices,
      invoiceChange: parseFloat(invoiceChange.toFixed(1)),
      thisMonthRevenue: thisMonthAmount,
      thisMonthInvoices,
      paidInvoicesThisMonth: paidInvoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch statistics", message: error.message },
      { status: 500 },
    );
  }
}
