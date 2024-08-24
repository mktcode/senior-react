"use client";

import { MenuItem } from "@headlessui/react";
import { ArrowUpCircleIcon } from "@heroicons/react/16/solid";
import { api } from "~/trpc/react";

export default function TopupButton() {
  const createTopUp = api.balance.createTopUp.useMutation({
    onSuccess: (url) => {
      window.open(url, "_blank");
    },
  });

  return (
    <MenuItem>
      <button onClick={() => createTopUp.mutate()}>
        <ArrowUpCircleIcon className="size-4 fill-gray-300" />
        {createTopUp.isPending ? "Redirecting..." : "Top up"}
      </button>
    </MenuItem>
  );
}
