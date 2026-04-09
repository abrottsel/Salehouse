import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Catalog from "@/components/Catalog";

describe("Catalog", () => {
  it("renders section heading", () => {
    render(<Catalog />);
    expect(screen.getByText("Наши посёлки")).toBeInTheDocument();
  });

  it("displays all villages by default", () => {
    render(<Catalog />);
    expect(screen.getByText("Фаворит")).toBeInTheDocument();
    expect(screen.getByText("Лесной остров")).toBeInTheDocument();
    expect(screen.getByText("РигаЛес")).toBeInTheDocument();
  });

  it("filters by direction", () => {
    render(<Catalog />);
    const dmButton = screen.getByText("Дмитровское шоссе");
    fireEvent.click(dmButton);

    expect(screen.getByText("ПриЛесной")).toBeInTheDocument();
    expect(screen.getByText("Триумфальный")).toBeInTheDocument();
    expect(screen.queryByText("Фаворит")).not.toBeInTheDocument();
  });

  it("shows prices for villages", () => {
    render(<Catalog />);
    expect(screen.getByText(/490\s*000/)).toBeInTheDocument();
  });

  it("renders filter buttons", () => {
    render(<Catalog />);
    expect(screen.getByText("Все")).toBeInTheDocument();
    expect(screen.getByText("Каширское шоссе")).toBeInTheDocument();
    expect(screen.getByText("Новорижское шоссе")).toBeInTheDocument();
  });
});
