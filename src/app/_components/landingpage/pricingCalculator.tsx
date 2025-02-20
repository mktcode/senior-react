"use client";

import {
  Field,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Textarea,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";
import Spinner from "../spinner";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useDebounce } from "@uidotdev/usehooks";

function applyLlmMargin(price: number, margin: number) {
  return price * (1 + margin / 100);
}

export default function PricingCalculator({
  llmProviders,
  defaultLlm,
}: {
  llmProviders: RouterOutputs["llmProviders"]["all"];
  defaultLlm: RouterOutputs["llmProviders"]["all"][0]["llms"][0];
}) {
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 500);

  const [output, setOutput] = useState("");
  const debouncedOutput = useDebounce(output, 500);

  const [llmId, setLlmId] = useState(defaultLlm.id);

  const [price, setPrice] =
    useState<RouterOutputs["tokens"]["calculatePrice"]>();

  const llms = llmProviders.flatMap((provider) => provider.llms);
  const selectedLlm = llms.find((llm) => llm.id === llmId);

  const calculatePrice = api.tokens.calculatePrice.useMutation({
    onSuccess: (data) => {
      setPrice(data);
    },
  });

  useEffect(() => {
    calculatePrice.mutate({
      input: debouncedInput,
      output: debouncedOutput,
      llmId,
    });
  }, [debouncedInput, debouncedOutput, llmId]);

  return (
    <div className="lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
      <div className="flex flex-col rounded-2xl ring-1 ring-inset ring-gray-200">
        <div className="p-3 text-sm font-semibold text-white">
          <Field>
            <Textarea
              className="no-scrollbar block w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:font-normal focus:bg-white"
              placeholder="Input"
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field>
            <Textarea
              className="no-scrollbar mt-3 block w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:font-normal focus:bg-white"
              placeholder="Output"
              rows={4}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              spellCheck={false}
            />
          </Field>
        </div>
        <Menu as="div" className="bg-indigo-600 p-3 pb-0">
          <MenuButton className="inline-flex w-full items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm/6 font-semibold text-white focus:outline-none data-[hover]:bg-white/20 data-[open]:bg-white/20 data-[focus]:outline-1 data-[focus]:outline-white">
            {selectedLlm ? selectedLlm.label : "Select AI Model"}
            <ChevronDownIcon className="ml-auto size-4 fill-white/60" />
          </MenuButton>

          <MenuItems
            transition
            anchor="bottom start"
            className="w-52 origin-top-right rounded-xl border border-white/5 bg-indigo-500 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {llms.map(({ id: llmId, label }) => (
              <MenuItem key={llmId}>
                <button
                  className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 data-[focus]:bg-white/10"
                  onClick={() => setLlmId(llmId)}
                >
                  {label}
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
        {!price && (
          <div className="flex items-center justify-center rounded-b-2xl bg-indigo-600 p-6">
            <Spinner />
          </div>
        )}
        {price && selectedLlm && (
          <div className="rounded-b-2xl bg-indigo-600 p-3">
            <table className="w-full rounded-lg bg-white/10 text-xs text-white lg:text-sm">
              <tbody className="text-center">
                <tr>
                  <th></th>
                  <td className="px-3 py-2 text-indigo-300">Length</td>
                  <td className="px-3 py-2 text-indigo-300">Tokens</td>
                  <td className="px-3 py-2 text-right text-indigo-300">
                    Price
                  </td>
                </tr>
                <tr>
                  <td className="px-3 text-left text-indigo-300">Input</td>
                  <td className="px-3">{input.length}</td>
                  <td className="px-3">{price.inputTokens}</td>
                  <td className="px-3 text-right font-semibold">
                    $
                    {applyLlmMargin(
                      price.inputPrice,
                      selectedLlm.margin,
                    ).toFixed(3)}
                  </td>
                </tr>
                <tr>
                  <td className="px-3 text-left text-indigo-300">Output</td>
                  <td className="px-3">{output.length}</td>
                  <td className="px-3">{price.outputTokens}</td>
                  <td className="px-3 text-right font-semibold">
                    $
                    {applyLlmMargin(
                      price.outputPrice,
                      selectedLlm.margin,
                    ).toFixed(3)}
                  </td>
                </tr>
                <tr>
                  <td className="col-span-3 h-3" />
                </tr>
                <tr className="text-lg lg:text-xl">
                  <td className="px-3 pb-2 text-left">Total</td>
                  <td className="px-3 pb-2">{input.length + output.length}</td>
                  <td className="px-3 pb-2">
                    {price.inputTokens + price.outputTokens}
                  </td>
                  <td className="px-3 pb-2 text-right font-bold">
                    $
                    {applyLlmMargin(
                      price.inputPrice + price.outputPrice,
                      selectedLlm.margin,
                    ).toFixed(3)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
