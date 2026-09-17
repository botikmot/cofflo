"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, ExternalLink, Printer, QrCode, X } from "lucide-react";

type TableQrDialogProps = {
  open: boolean;
  table: {
    name: string;
    location: string | null;
    qrToken: string;
  } | null;
  branchId: string;
  onClose: () => void;
};

export function TableQrDialog({
  open,
  table,
  branchId,
  onClose,
}: TableQrDialogProps) {
  const [qrData, setQrData] = useState<{
    url: string;
    dataUrl: string;
  } | null>(null);

  const qrUrl = useMemo(() => {
    if (!table) {
      return "";
    }

    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/public/${branchId}/order?qrToken=${encodeURIComponent(
      table.qrToken,
    )}`;
  }, [branchId, table]);

  useEffect(() => {
    if (!open || !qrUrl) {
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(qrUrl, {
      width: 420,
      margin: 2,
      errorCorrectionLevel: "H",
    })
      .then((dataUrl) => {
        if (cancelled) {
          return;
        }

        setQrData({
          url: qrUrl,
          dataUrl,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setQrData(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, qrUrl]);

  const qrDataUrl = qrData?.url === qrUrl ? qrData.dataUrl : "";

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !table) {
    return null;
  }

  const downloadQr = () => {
    if (!qrDataUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = qrDataUrl;
    link.download = `${table.name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const printQr = () => {
    if (!qrDataUrl) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=700,height=800");

    if (!printWindow) {
      return;
    }

    const safeTableName = escapeHtml(table.name);
    const safeLocation = escapeHtml(table.location ?? "Table");
    const safeQrDataUrl = escapeAttribute(qrDataUrl);

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${safeTableName} QR Code</title>
          <style>
            @page {
              size: auto;
              margin: 18mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              background: #ffffff;
              color: #2B2118;
            }

            .card {
              width: 100%;
              max-width: 420px;
              text-align: center;
            }

            .eyebrow {
              margin: 0 0 8px;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: #6F4E37;
            }

            h1 {
              margin: 0;
              font-size: 32px;
            }

            .location {
              margin: 8px 0 24px;
              font-size: 14px;
              color: #75665A;
            }

            img {
              width: 300px;
              height: 300px;
              object-fit: contain;
            }

            .instruction {
              margin: 22px 0 0;
              font-size: 18px;
              font-weight: 700;
            }

            .subtext {
              margin: 8px 0 0;
              font-size: 13px;
              line-height: 1.5;
              color: #75665A;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <p class="eyebrow">Scan to order</p>
            <h1>${safeTableName}</h1>
            <p class="location">${safeLocation}</p>

            <img src="${safeQrDataUrl}" alt="QR code for ${safeTableName}" />

            <p class="instruction">Scan this code to order</p>
            <p class="subtext">
              Use your phone camera to open the menu and place your dine-in order.
            </p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const openQrLink = () => {
    if (!qrUrl) {
      return;
    }

    window.open(qrUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-qr-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#E5D9CD] bg-[#FFFDF9] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8DDD3] px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0E7DF] text-[#6F4E37]">
                <QrCode className="h-4.5 w-4.5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B7A6C]">
                  Table QR
                </p>

                <h2
                  id="table-qr-title"
                  className="text-lg font-semibold text-[#2B2118]"
                >
                  {table.name}
                </h2>
              </div>
            </div>

            {table.location && (
              <p className="mt-2 text-xs text-[#7A6B60]">{table.location}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#7C6D61] transition hover:bg-[#F2EBE5] hover:text-[#2B2118]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR */}
        <div className="px-5 pb-5 pt-6 sm:px-6">
          <div className="rounded-2xl border border-[#E8DDD3] bg-white p-5">
            <div className="flex min-h-[320px] items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${table.name}`}
                  className="h-[300px] w-[300px] max-w-full object-contain"
                />
              ) : (
                <div className="space-y-3 text-center">
                  <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-[#ECE3DA]" />

                  <p className="text-sm text-[#7D6E62]">
                    Generating QR code...
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-[#2B2118]">
              Scan to order at {table.name}
            </p>

            <p className="mt-1 text-xs leading-5 text-[#817268]">
              Customers will be taken directly to the dine-in menu for this
              table.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadQr}
              disabled={!qrDataUrl}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DCCFC3] bg-white px-3 text-sm font-semibold text-[#5F5146] transition hover:border-[#BCA997] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Download
            </button>

            <button
              type="button"
              onClick={printQr}
              disabled={!qrDataUrl}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DCCFC3] bg-white px-3 text-sm font-semibold text-[#5F5146] transition hover:border-[#BCA997] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>

          <button
            type="button"
            onClick={openQrLink}
            disabled={!qrUrl}
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2B2118] px-4 text-sm font-semibold text-white transition hover:bg-[#3A2B20] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open customer page
          </button>

          <p className="mt-3 break-all text-center font-mono text-[10px] leading-4 text-[#9A8A7D]">
            {qrUrl}
          </p>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return value.replaceAll('"', "&quot;");
}
