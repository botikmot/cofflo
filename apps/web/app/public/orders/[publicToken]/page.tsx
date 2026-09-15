"use client";

import { useParams } from "next/navigation";

import { usePublicOrder } from "@/hooks/orders/use-public-order";

function getOrderStatusMessage(status: string) {
  switch (status) {
    case "PENDING":
      return "Your order has been received and is waiting for confirmation.";

    case "CONFIRMED":
      return "Your order has been confirmed by the café.";

    case "PREPARING":
      return "Your order is being prepared.";

    case "READY":
      return "Your order is ready!";

    case "COMPLETED":
      return "Your order has been completed. Thank you!";

    case "CANCELLED":
      return "This order has been cancelled.";

    default:
      return "Your order status has been updated.";
  }
}

export default function PublicOrderPage() {
  const params = useParams<{ publicToken: string }>();

  const publicToken = params.publicToken;

  const { data, isLoading, isError } = usePublicOrder(publicToken);

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <p className="text-sm text-muted-foreground">Loading order...</p>
        </section>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border p-6 text-center">
            <h1 className="text-xl font-bold">Order not found</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This order link may be invalid or unavailable.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const formatMoney = (amount: string) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: data.currency,
    }).format(Number(amount));

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-md px-4 py-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Order</p>

            <h1 className="text-2xl font-bold">{data.orderNumber}</h1>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-xs text-muted-foreground">Status</p>

            <p className="mt-1 text-2xl font-bold">{data.status}</p>

            <p className="mt-2 text-sm text-muted-foreground">
              {getOrderStatusMessage(data.status)}
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border p-5">
            {data.items.map((item, index) => (
              <div
                key={`${item.productName}-${index}`}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium">{item.productName}</p>

                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatMoney(item.unitPrice)}
                  </p>
                </div>

                <p className="font-medium">{formatMoney(item.subtotal)}</p>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>

                <span className="text-xl font-bold">
                  {formatMoney(data.total)}
                </span>
              </div>
            </div>
          </div>

          {data.table && (
            <div className="rounded-2xl border p-5">
              <p className="text-xs text-muted-foreground">Table</p>

              <p className="mt-1 font-medium">{data.table.name}</p>

              {data.table.location && (
                <p className="text-sm text-muted-foreground">
                  {data.table.location}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
