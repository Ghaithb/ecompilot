import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';
import * as XLSX from 'xlsx';

export interface ExportButtonProps {
  orders: Order[];
  format: "csv" | "excel";
  disabled?: boolean;
}

export const ExportButton = ({ orders, format, disabled }: ExportButtonProps) => {
  const handleExport = () => {
    if (!orders.length) return;

    // Prepare data for export
    const data = orders.map((order) => ({
      "Order Number": order.orderNumber,
      "Email": order.customerEmail,
      "Status": order.status,
      "Payment Status": order.paymentStatus,
      "Subtotal": `$${order.subtotal.toFixed(2)}`,
      "Tax": `$${order.taxAmount.toFixed(2)}`,
      "Shipping": `$${order.shippingAmount.toFixed(2)}`,
      "Discount": `$${order.discountAmount.toFixed(2)}`,
      "Total": `$${order.total.toFixed(2)}`,
      "Currency": order.currency,
      "Date Created": new Date(order.createdAt).toLocaleDateString(),
      "Date Updated": new Date(order.updatedAt).toLocaleDateString(),
    }));

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = format === 'excel' ? 'xlsx' : 'csv';
    const filename = `orders_${timestamp}.${extension}`;

    // Write and download file
    XLSX.writeFile(wb, filename);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || orders.length === 0}
    >
      <Download className="w-4 h-4 mr-2" />
      Export {format.toUpperCase()}
    </Button>
  );
};