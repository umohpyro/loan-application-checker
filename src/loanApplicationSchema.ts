import { z } from "zod";

const loanApplicationSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  amount: z.number().min(0, "Loan amount must be a positive number"),
  purpose: z.enum(["home", "auto", "personal", "business"]),
  employment: z.enum(["employed", "self-employed", "retired", "student"]),
  income: z.number().min(0, "Annual income must be a positive number")
});

export { loanApplicationSchema };

export type loanApplicationSchemaType = z.infer<typeof loanApplicationSchema>;


const loanApplicationResponsePropsSchema = z.object({
    risk: z.enum(["low", "medium", "high"]),
    eligible: z.boolean(),
    reason: z.string().optional()
    });


const loanApplicationResponseSchema = z.object({
  response: loanApplicationResponsePropsSchema ,
    });

export { loanApplicationResponseSchema,  loanApplicationResponsePropsSchema};

export type loanApplicationResponseSchemaType = z.infer<typeof loanApplicationResponseSchema>;

export type loanApplicationResponsePropsSchemaType = z.infer<typeof loanApplicationResponsePropsSchema>;
