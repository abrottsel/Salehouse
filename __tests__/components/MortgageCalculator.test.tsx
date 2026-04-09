import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MortgageCalculator from "@/components/MortgageCalculator";

describe("MortgageCalculator", () => {
  it("renders section heading", () => {
    render(<MortgageCalculator />);
    expect(screen.getByText("Ипотечный калькулятор")).toBeInTheDocument();
  });

  it("shows calculation result", () => {
    render(<MortgageCalculator />);
    expect(screen.getByText("Ежемесячный платёж")).toBeInTheDocument();
    expect(screen.getByText("Сумма кредита")).toBeInTheDocument();
    expect(screen.getByText("Переплата")).toBeInTheDocument();
  });

  it("renders CTA button", () => {
    render(<MortgageCalculator />);
    expect(screen.getByText("Рассчитать ипотеку")).toBeInTheDocument();
  });

  it("has all slider inputs", () => {
    render(<MortgageCalculator />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(4);
  });
});
