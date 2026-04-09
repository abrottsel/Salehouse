import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Steps from "@/components/Steps";

describe("Steps", () => {
  it("renders section heading", () => {
    render(<Steps />);
    expect(screen.getByText("Как купить участок")).toBeInTheDocument();
  });

  it("displays all 6 steps", () => {
    render(<Steps />);
    expect(screen.getByText("Консультация")).toBeInTheDocument();
    expect(screen.getByText("Просмотр участка")).toBeInTheDocument();
    expect(screen.getByText("Бронирование")).toBeInTheDocument();
    expect(screen.getByText("Проверка документов")).toBeInTheDocument();
    expect(screen.getByText("Оформление сделки")).toBeInTheDocument();
    expect(screen.getByText("Ваш участок!")).toBeInTheDocument();
  });

  it("shows guarantee section", () => {
    render(<Steps />);
    expect(screen.getByText("Гарантия безопасности сделки")).toBeInTheDocument();
    expect(screen.getByText("Забронировать участок")).toBeInTheDocument();
  });
});
