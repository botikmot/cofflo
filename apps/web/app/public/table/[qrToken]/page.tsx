"use client";

import { useParams, useRouter } from "next/navigation";

import { usePublicTable } from "@/hooks/public/use-public-table";

export default function PublicTablePage() {
  const params = useParams<{ qrToken: string }>();

  const router = useRouter();

  const qrToken = params.qrToken;

  const { data, isLoading, isError } = usePublicTable(qrToken);

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <p className="text-sm text-muted-foreground">Loading table...</p>
        </section>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="min-h-screen">
        <section className="mx-auto max-w-md px-4 py-8">
          <div className="rounded-2xl border p-6 text-center">
            <h1 className="text-xl font-bold">Table not found</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This table QR code is invalid or no longer available.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const { table, branch, organization } = data;

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-md px-4 py-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{organization.name}</p>

            <h1 className="text-3xl font-bold">{branch.name}</h1>
          </div>

          <div className="rounded-2xl border p-6 text-center">
            <p className="text-sm text-muted-foreground">You are at</p>

            <h2 className="mt-1 text-3xl font-bold">{table.name}</h2>

            {table.location && (
              <p className="mt-1 text-sm text-muted-foreground">
                {table.location}
              </p>
            )}
          </div>

          {table.photoUrl && (
            <div className="overflow-hidden rounded-2xl border">
              <img
                src={table.photoUrl}
                alt={table.name}
                className="h-56 w-full object-cover"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              router.push(`/public/${branch.id}/order?qrToken=${qrToken}`)
            }
            className="w-full rounded-2xl bg-black px-5 py-4 font-medium text-white"
          >
            View Menu & Order
          </button>
        </div>
      </section>
    </main>
  );
}
