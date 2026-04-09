import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Hero from "@/components/Hero";

describe("Hero", () => {
  it("renders the main heading", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("displays the price from 180 000", () => {
    render(<Hero />);
    expect(screen.getByText(/180 000/)).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    render(<Hero />);
    expect(screen.getByText("Выбрать участок")).toBeInTheDocument();
    expect(screen.getByText("Записаться на просмотр")).toBeInTheDocument();
  });

  it("shows trust badges", () => {
    render(<Hero />);
    expect(screen.getByText("Юридическая чистота")).toBeInTheDocument();
    expect(screen.getByText(/30\+ посёлков/)).toBeInTheDocument();
    expect(screen.getByText("Категория ИЖС")).toBeInTheDocument();
  });
});
