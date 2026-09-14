'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/auth-store';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/login');
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading Cofflo...
        </p>
      </div>
    );
  }

  const firstMembership = user.memberships?.[0];
  const organization = firstMembership?.organization;
  const branch = firstMembership?.branch;

  return (
    <main className="min-h-screen bg-muted/30 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-start justify-between gap-4">
            <div>
                <p className="text-sm text-muted-foreground">
                {organization?.name ?? 'Your organization'}
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Welcome back, {user.firstName}!
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                Here&apos;s what&apos;s happening with your café today.
                </p>
            </div>

            <ThemeToggle />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            label="Today's sales"
            value="₱0.00"
            description="No sales recorded yet"
          />

          <DashboardCard
            label="Orders today"
            value="0"
            description="No orders recorded yet"
          />

          <DashboardCard
            label="Products"
            value="0"
            description="Products will appear here"
          />

          <DashboardCard
            label="Team members"
            value={String(user.memberships?.length ?? 0)}
            description="Organization members"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-background p-6 lg:col-span-2">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Getting started
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Set up your café workspace to start using Cofflo.
              </p>
            </div>

            <div className="space-y-4">
              <GettingStartedItem
                number="1"
                title="Set up your organization"
                description="Review your café business information."
                completed={Boolean(organization)}
              />

              <GettingStartedItem
                number="2"
                title="Add your branches"
                description="Create and manage your café locations."
                completed={Boolean(branch)}
              />

              <GettingStartedItem
                number="3"
                title="Invite your team"
                description="Add staff members who will use Cofflo."
                completed={false}
              />

              <GettingStartedItem
                number="4"
                title="Add your products"
                description="Set up your menu and product catalog."
                completed={false}
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-background p-6">
            <h2 className="text-lg font-semibold">
              Workspace
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow
                label="Organization"
                value={organization?.name ?? 'Not available'}
              />

              <InfoRow
                label="Branch"
                value={branch?.name ?? 'All branches'}
              />

              <InfoRow
                label="Role"
                value={firstMembership?.role ?? 'Member'}
              />

              <InfoRow
                label="Email"
                value={user.email}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function GettingStartedItem({
  number,
  title,
  description,
  completed,
}: {
  number: string;
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          completed
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {completed ? '✓' : number}
      </div>

      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="max-w-[60%] text-right text-sm font-medium">
        {value}
      </span>
    </div>
  );
}