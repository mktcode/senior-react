"use client";

import { type Session } from "next-auth";
import Form from "./form";
import Result from "./result";
import { useState } from "react";
import { type Output } from "~/server/api/routers/proofreader";

export default function Main({ session }: { session: Session | null }) {
  const [output, setOutput] = useState<Output>({
    language: "",
    corrections: [],
    suggestions: [],
    correctedText: "",
  });

  return (
    <div className="grid grow grid-cols-1 lg:grid-cols-2">
      <Form session={session} setOutput={setOutput} />
      <Result output={output} />
    </div>
  );
}
