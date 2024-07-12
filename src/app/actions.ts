"use server";

import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import {
  loanApplicationResponseSchema,
  loanApplicationSchema,
} from "@/loanApplicationSchema";

export async function generate(input: FormData) {
  "use server";

  const gottenInputs = JSON.stringify(Object.fromEntries(input.entries()));
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: google("models/gemini-1.5-pro-latest"),
      system:
        "You are a loan officer at a bank. Generate a loan application form for a customer. and then access the form to fill out the details. Analyze the form and provide feedback to the customer on the risk of the loan application. if they are eligible for the loan. or why they are not eligible for the loan.",
      prompt: `process the loan application form and provide feedback to the customer on the risk of the loan application. if they are eligible for the loan. or why they are not eligible for the loan. The loan application form contains the following details: ${gottenInputs}`,

      schema: loanApplicationResponseSchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
