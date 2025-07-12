import React from "react";
import { Order } from "@/lib/api";
import { getStatusBadge, getVietQRUrl } from "../../app/orders/page";

interface InvoicePrintProps {
  order: Order;
}

export const InvoicePrint = React.forwardRef<HTMLDivElement, InvoicePrintProps>(({ order }, ref) => (
  <div ref={ref} className="print-invoice-modal p-6 bg-white">
    {/* Header hóa đơn */}
    <div className="text-center border-b pb-4 avoid-break">
      <h3 className="text-xl font-bold">HÓA ĐƠN BÁN HÀNG</h3>
      <div className="flex justify-between text-sm mt-2">
        <span>Mã đơn hàng: {order.orderNumber}</span>
        <span>Ngày: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
      </div>
      <div className="flex justify-between text-sm mt-1">
        <span>Số TK: {process.env.NEXT_PUBLIC_ACCOUNT_NO}</span>
        <span>{process.env.NEXT_PUBLIC_ACCOUNT_NAME}</span>
      </div>
      <div className="text-sm mt-1">{process.env.NEXT_PUBLIC_BANK_NAME || ''}</div>
    </div>
    {/* Thông tin khách hàng và trạng thái */}
    <div className="grid grid-cols-2 gap-4 text-sm avoid-break mt-4">
      <div>
        <strong>Thông tin khách hàng:</strong>
        <div>Họ tên: {order.customerName}</div>
        <div>Điện thoại: {order.customerPhone}</div>
        <div>Địa chỉ: {order.customerAddress}</div>
      </div>
      <div>
        <strong>Trạng thái đơn hàng:</strong>
        <div className="mt-1">{getStatusBadge(order.status)}</div>
        {order.notes && (
          <div className="mt-2">
            <strong>Ghi chú:</strong> {order.notes}
          </div>
        )}
      </div>
    </div>
    {/* Bảng chi tiết sản phẩm */}
    <div className="overflow-x-auto mt-4 avoid-break">
      <table className="invoice-table w-full border border-black text-sm">
        <thead>
          <tr>
            <th className="border border-black px-2 py-2">STT</th>
            <th className="border border-black px-2 py-2">Tên sản phẩm</th>
            <th className="border border-black px-2 py-2">Đơn giá</th>
            <th className="border border-black px-2 py-2">Số lượng</th>
            <th className="border border-black px-2 py-2">Đơn vị</th>
            <th className="border border-black px-2 py-2">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-black px-2 py-2 text-center">{index + 1}</td>
              <td className="border border-black px-2 py-2">{item.productName}</td>
              <td className="border border-black px-2 py-2 text-right">{item.productPrice.toLocaleString("vi-VN")}đ</td>
              <td className="border border-black px-2 py-2 text-center">{item.quantity}</td>
              <td className="border border-black px-2 py-2 text-center">{item.unit}</td>
              <td className="border border-black px-2 py-2 text-right">{item.totalPrice.toLocaleString("vi-VN")}đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/* Tổng cộng + QR code */}
    <div className="flex justify-end mt-4 avoid-break gap-8 items-start">
      <div className="w-64 space-y-1 align-top">
        <div className="flex justify-between">
          <span>Tổng tiền hàng:</span>
          <span>{order.subtotal.toLocaleString("vi-VN")}đ</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span>{order.shippingFee.toLocaleString("vi-VN")}đ</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-1">
          <span>Tổng cộng:</span>
          <span>{order.total.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
      <div className="print-qr flex flex-col items-center avoid-break w-[220px]">
        <img
          src={getVietQRUrl(order.total, order.orderNumber)}
          alt="QR chuyển khoản"
          style={{ width: 200, height: 200 }}
        />
        <div className="text-sm mt-2">
          Quét mã để thanh toán đơn hàng
        </div>
      </div>
    </div>
  </div>
));

InvoicePrint.displayName = "InvoicePrint"; 