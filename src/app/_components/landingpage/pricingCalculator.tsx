"use client";

import { Field, Textarea } from "@headlessui/react";
import { useState } from "react";
import { api } from "~/trpc/react";
import Spinner from "../spinner";

export default function PricingCalculator() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const { data: price } = api.tokens.calculatePrice.useQuery({
    input,
    output,
  });

  return (
    <div className="p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
      <div className="flex flex-col rounded-2xl ring-1 ring-inset ring-gray-200">
        <div className="p-3 text-sm font-semibold text-white">
          <Field>
            <Textarea
              className="no-scrollbar block w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-800 focus:bg-white"
              placeholder="Input"
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </Field>
          <Field>
            <Textarea
              className="no-scrollbar mt-3 block w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-800 focus:bg-white"
              placeholder="Output"
              rows={4}
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              spellCheck={false}
            />
          </Field>
        </div>
        {!price && (
          <div className="flex items-center justify-center rounded-b-2xl bg-indigo-600 p-6">
            <Spinner />
          </div>
        )}
        {price && (
          <div className="rounded-b-2xl bg-indigo-600 p-3">
            <table className="w-full rounded-lg bg-white/10 text-sm text-white">
              <tbody className="text-center">
                <tr>
                  <th></th>
                  <td className="px-3 py-2 text-indigo-100">Length</td>
                  <td className="px-3 py-2 text-indigo-100">Tokens</td>
                  <td className="px-3 py-2 text-right text-indigo-100">
                    Price
                  </td>
                </tr>
                <tr>
                  <td className="px-3 text-left text-indigo-100">Input</td>
                  <td className="px-3">{input.length}</td>
                  <td className="px-3">{price.inputTokens}</td>
                  <td className="px-3 text-right font-semibold">
                    {price.inputPrice.toFixed(3)} €
                  </td>
                </tr>
                <tr>
                  <td className="px-3 text-left text-indigo-100">Output</td>
                  <td className="px-3">{output.length}</td>
                  <td className="px-3">{price.outputTokens}</td>
                  <td className="px-3 text-right font-semibold">
                    {price.outputPrice.toFixed(3)} €
                  </td>
                </tr>
                <tr>
                  <td className="col-span-3 h-3" />
                </tr>
                <tr className="text-xl">
                  <td className="px-3 text-left">Total</td>
                  <td className="px-3 py-1">{input.length + output.length}</td>
                  <td className="px-3 py-1">
                    {price.inputTokens + price.outputTokens}
                  </td>
                  <td className="px-3 py-1 text-right font-bold">
                    {(price.inputPrice + price.outputPrice).toFixed(3)} €
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
