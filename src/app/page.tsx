"use client";

import { useRef, useState } from "react";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  loanApplicationResponsePropsSchemaType,
  loanApplicationResponseSchemaType,
} from "@/loanApplicationSchema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const InterviewPage: React.FC = () => {
  const [generation, setGeneration] =
    useState<loanApplicationResponsePropsSchemaType | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState("bg-gray-500");
  const formRef = useRef<HTMLFormElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const generateRecipeFn = async (input: FormData) => {
    setLoading(true);

    const { object } = await generate(input);

    for await (const partialObject of readStreamableValue(object)) {
      if (partialObject?.response) {
        switch (partialObject.response.risk) {
          case "low":
            setBgColor("bg-green-500");
            break;
          case "medium":
            setBgColor("bg-yellow-500");
            break;
          case "high":
            setBgColor("bg-red-500");
            break;
          default:
            setBgColor("bg-gray-500");
        }

        setGeneration(partialObject.response);
        setDialogOpen(true);
        formRef?.current?.reset();
      } else {
        console.error(
          "Invalid partialObject structure",
          partialObject.response
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4 mx-auto flex items-start justify-evenly">
      <div className="space-y-4">
        <form
          className="gap-3 max-w-4xl"
          action={generateRecipeFn}
          ref={formRef}
        >
          <div className="w-full max-w-md mx-auto mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Loan Application Checker</CardTitle>
                <CardDescription>
                  Fill out the form to check your loan application details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input name="name" placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount</Label>
                    <Input
                      name="amount"
                      type="number"
                      placeholder="Enter loan amount"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Loan Purpose</Label>
                    <Select name="loanPurpose">
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school fees">School Fee</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="home">Home Purchase</SelectItem>
                        <SelectItem value="auto">Auto Loan</SelectItem>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                        <SelectItem value="business">Business Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment">Employment Status</Label>
                    <Select name="employmentStatus">
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">Employed</SelectItem>
                        <SelectItem value="self-employed">
                          Self-Employed
                        </SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Annual Income</Label>
                  <Input
                    name="income"
                    type="number"
                    placeholder="Enter your annual income"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {/* <Button variant="outline">Clear</Button> */}
                <Button disabled={loading} type="submit">
                  {loading ? "Checking..." : "Check Application"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
      {generation && (
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {" "}
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                </CardHeader>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="space-y-4 p-4">
                  <Card className="gap-3 max-w-4xl p-4">
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex space-x-2 items-center">
                          <Badge className={`w-[60px] ${bgColor}`}>Risk</Badge>
                          <p>{generation?.risk}</p>
                        </div>
                        <div className="flex space-x-2 items-center">
                          <Badge className={`${cn(bgColor)}`}>Eligible</Badge>
                          <p>{generation?.eligible.toString()}</p>
                        </div>
                        <div className="flex space-x-2 items-start">
                          <Badge className={`h-fit ${cn(bgColor)}`}>
                            Reason
                          </Badge>
                          <span>{generation?.reason}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default InterviewPage;
