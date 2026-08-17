import { currency, dateTimeShort } from "./format.js";

const BUSINESS_NAME = import.meta.env.VITE_BUSINESS_NAME || import.meta.env.VITE_APP_NAME || "Ledger";
const BUSINESS_ADDRESS = import.meta.env.VITE_BUSINESS_ADDRESS || "";
const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_PHONE || "";

// Opens a small popup with a print-ready receipt and triggers the browser
// print dialog. Styled narrow (80mm-ish) and in a monospace font so it lays
// out sensibly on a standard POS thermal printer as well as on plain paper.
export const printReceipt = (sale) => {
  const win = window.open("", "_blank", "width=380,height=600");
  if (!win) return;

  const rows = sale.items
    .map(
      (it) => `
        <tr>
          <td colspan="2">${it.product?.productName || "Item"}</td>
        </tr>
        <tr>
          <td>${it.quantity} x ${currency(it.price)}</td>
          <td class="right">${currency(it.price * it.quantity)}</td>
        </tr>`
    )
    .join("");

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt ${sale.receiptNumber || ""}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: "Courier New", monospace;
            font-size: 12px;
            width: 280px;
            margin: 0 auto;
            padding: 12px;
            color: #111;
          }
          h1 { font-size: 14px; margin: 0 0 2px; text-align: center; }
          .muted { text-align: center; color: #444; margin: 0 0 2px; }
          hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 1px 0; vertical-align: top; }
          .right { text-align: right; }
          .totals td { padding: 2px 0; }
          .grand { font-weight: bold; font-size: 13px; }
          .thankyou { text-align: center; margin-top: 10px; }
          @media print {
            body { width: 100%; }
          }
        </style>
      </head>
      <body>
        <h1>${BUSINESS_NAME}</h1>
        ${BUSINESS_ADDRESS ? `<p class="muted">${BUSINESS_ADDRESS}</p>` : ""}
        ${BUSINESS_PHONE ? `<p class="muted">${BUSINESS_PHONE}</p>` : ""}
        <hr />
        <table>
          <tr><td>Receipt #</td><td class="right">${sale.receiptNumber || "—"}</td></tr>
          <tr><td>Date</td><td class="right">${dateTimeShort(sale.createdAt)}</td></tr>
          <tr><td>Cashier</td><td class="right">${sale.cashier?.fullName || "—"}</td></tr>
          <tr><td>Customer</td><td class="right">${sale.customer?.fullName || "Walk-in"}</td></tr>
        </table>
        <hr />
        <table>${rows}</table>
        <hr />
        <table class="totals">
          <tr><td>Subtotal</td><td class="right">${currency(sale.subtotal)}</td></tr>
          <tr><td>Discount</td><td class="right">-${currency(sale.discount)}</td></tr>
          <tr><td>Tax</td><td class="right">${currency(sale.tax)}</td></tr>
          <tr class="grand"><td>Total</td><td class="right">${currency(sale.total)}</td></tr>
          <tr><td>Paid (${sale.paymentMethod})</td><td class="right">${currency(sale.amountPaid)}</td></tr>
          <tr><td>Change</td><td class="right">${currency(sale.change)}</td></tr>
        </table>
        <p class="thankyou">Thank you for your purchase!</p>
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
    </html>
  `);
  win.document.close();
};
