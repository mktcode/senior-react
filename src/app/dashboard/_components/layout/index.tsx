import { type PropsWithChildren } from "react";

export function DashboardHeader({ children }: PropsWithChildren) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
        {children}
      </div>
    </header>
  );
}

export function DashboardHeaderH1({ children }: PropsWithChildren) {
  return (
    <h1 className="flex grow items-center text-2xl font-bold tracking-tight text-gray-900">
      {children}
    </h1>
  );
}
