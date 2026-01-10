import React from "react";
import { useNavigate } from "react-router-dom";

export default function SalesReportPrint({ data }) {
  const navigate = useNavigate();
  const { orders, totals, statusBoxes } = data;
  const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return value.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6">
      {/* ACTION BAR (hidden in print) */}
      <div className="flex justify-end mb-4 print:hidden gap-5">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-black text-white rounded text-sm"
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-black text-white rounded text-sm"
        >
          Back
        </button>
      </div>

      {/* REPORT */}
      <div className="print-area">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold">Sales Report</h1>
          <p className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Table */}
        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Flavour</th>
              <th className="border p-2">Size</th>
              <th className="border p-2 text-center">Qty</th>
              <th className="border p-2 text-right">Price</th>
              <th className="border p-2 text-right">Discount</th>
              <th className="border p-2 text-right">Commission</th>
              <th className="border p-2 text-right">Vendor Earn</th>
              <th className="border p-2 text-right">order Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr
                key={o.rowKey}
                className={
                  o.status === "Cancelled"
                    ? "bg-red-100"
                    : o.status === "Returned"
                    ? "bg-yellow-100"
                    : "bg-white"
                }
              >
                <td className="border p-2">
                  {new Date(o.orderDate).toLocaleDateString()}
                </td>
                <td className="border p-2">{o.customerName}</td>
                <td className="border p-2">{o.productName}</td>
                <td className="border p-2">{o.flavour}</td>
                <td className="border p-2">{o.sizeLabel}</td>
                <td className="border p-2 text-center">{o.quantity}</td>
                <td className="border p-2 text-right">
                  {formatCurrency(o.price)}
                </td>
                <td className="border p-2 text-right">
                  {formatCurrency(o.couponDiscount)}
                </td>
                <td className="border p-2 text-right">
                  {formatCurrency(o.commissionAmount)}
                </td>
                <td className="border p-2 text-right font-medium">
                  {formatCurrency(o.vendorEarning)}
                </td>
                <td className="border p-2 text-right font-medium">
                  {o.status}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Totals */}
          {/* <tfoot className="bg-gray-50 font-semibold">
            <tr>
              <td colSpan="5" className="border p-2 text-right">
                TOTAL EARNINGS
              </td>
              <td className="border p-2 text-center">{totals.totalQuantity}</td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalOriginalRevenue)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalDiscount)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalCommission)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalVendorEarning)}
              </td>
            </tr>
          </tfoot> */}
          <tfoot className="font-semibold">
            {/* GRAND TOTAL */}
            <tr className="bg-gray-50">
              <td colSpan="5" className="border p-2 text-right">
                GRAND TOTAL
              </td>
              <td className="border p-2 text-center">{totals.totalQuantity}</td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalOriginalRevenue)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalDiscount)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalCommission)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(totals.totalVendorEarning)}
              </td>
            </tr>

            {/* CANCELLED TOTAL */}
            <tr className="bg-red-100">
              <td colSpan="9" className="border p-2 text-right">
                TOTAL CANCELLED AMOUNT
              </td>
              <td colSpan="2" className="border p-2 text-right">
                {formatCurrency(statusBoxes.cancelledTotal)}
              </td>
            </tr>

            {/* RETURNED TOTAL */}
            <tr className="bg-yellow-100">
              <td colSpan="9" className="border p-2 text-right">
                TOTAL RETURNED AMOUNT
              </td>
              <td colSpan="2" className="border p-2 text-right">
                {formatCurrency(statusBoxes.returnedTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* PRINT STYLES */}
      <style>
        {`
          @media print {
            body {
              background: white;
            }
            .print-area {
              margin: 0;
              padding: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
