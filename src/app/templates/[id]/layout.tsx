import "~/styles/globals.css";
import { api, HydrateClient } from "~/trpc/server";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Senior - Template",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function TemplateLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { id: string } }>) {
  void api.template.getOne.prefetch({ id: params.id });

  return <HydrateClient>{children}</HydrateClient>;
}
