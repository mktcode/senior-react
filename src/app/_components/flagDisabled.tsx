import { getFlags } from "~/server/unleash";

export default async function FlagDisabled({ flag, children }: { flag: string, children: React.ReactNode }) {
  const flags = await getFlags();

  if (flags.isEnabled(flag)) {
    return null;
  }

  return <>{children}</>;
}