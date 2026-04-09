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
    expect(screen.getByText("9+")).toBeInTheDocument();
    expect(screen.getByText("15 000+")).toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
    expect(screen.getByText("44")).toBeInTheDocument();
  });
});
