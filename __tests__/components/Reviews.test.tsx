import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Reviews from "@/components/Reviews";

describe("Reviews", () => {
  it("renders section heading", () => {
    render(<Reviews />);
    expect(screen.getByText("Отзывы наших клиентов")).toBeInTheDocument();
  });

  it("displays all reviews", () => {
    render(<Reviews />);
    expect(screen.getByText("Алексей и Мария К.")).toBeInTheDocument();
    expect(screen.getByText("Дмитрий С.")).toBeInTheDocument();
    expect(screen.getByText("Елена В.")).toBeInTheDocument();
  });

  it("shows stats", () => {
    render(<Reviews />);
    expect(screen.getByText("30+")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("24/7")).toBeInTheDocument();
  });
});
