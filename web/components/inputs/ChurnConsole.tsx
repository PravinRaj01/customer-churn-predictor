"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TenureSlider } from "./TenureSlider";
import { ChargesField } from "./ChargesField";
import { SegmentedControl } from "./SegmentedControl";
import {
  CONTRACT_OPTIONS,
  INTERNET_OPTIONS,
  PredictRequest,
} from "@/lib/types";

interface ChurnConsoleProps {
  onSubmit: (input: PredictRequest) => void;
  isSubmitting: boolean;
}

/**
 * The "churn console" — owns the four-input form state and hands off a
 * validated PredictRequest on submit. Purely static/functional in Phase 2;
 * Phase 3 wires the submit button into the ChurnBarrel phase machine.
 */
export function ChurnConsole({ onSubmit, isSubmitting }: ChurnConsoleProps) {
  const [tenure, setTenure] = useState(12);
  const [monthlyCharges, setMonthlyCharges] = useState(50);
  const [contract, setContract] =
    useState<(typeof CONTRACT_OPTIONS)[number]>("Month-to-month");
  const [internetService, setInternetService] =
    useState<(typeof INTERNET_OPTIONS)[number]>("DSL");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      tenure,
      monthly_charges: monthlyCharges,
      contract,
      internet_service: internetService,
    });
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <TenureSlider value={tenure} onChange={setTenure} />
        <ChargesField value={monthlyCharges} onChange={setMonthlyCharges} />
        <SegmentedControl
          name="contract"
          label="Contract"
          options={CONTRACT_OPTIONS}
          value={contract}
          onChange={setContract}
        />
        <SegmentedControl
          name="internet"
          label="Internet Service"
          options={INTERNET_OPTIONS}
          value={internetService}
          onChange={setInternetService}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Churning…" : "Churn It"}
        </Button>
      </form>
    </Card>
  );
}
