import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Advantages from "@/components/Advantages";

describe("Advantages", () => {
  it("renders section heading", () => {
    render(<Advantages />);
    expect(screen.getByText("Почему выбирают нас")).toBeInTheDocument();
  });

  it("renders all 8 advantages", () => {
    render(<Advantages />);
    expect(screen.getByText("Юридическая чистота")).toBeInTheDocument();
    expect(screen.getByText("Асфальтированные дороги")).toBeInTheDocument();
    expect(screen.getByText("Охраняемая территория")).toBeInTheDocument();
    expect(screen.getByText("Все коммуникации")).toBeInTheDocument();
    expect(screen.getByText("Природа рядом")).toBeInTheDocument();
    expect(screen.getByText("Прозрачные цены")).toBeInTheDocument();
    expect(screen.getByText("Развитая инфраструктура")).toBeInTheDocument();
    expect(screen.getByText("Рассрочка без переплат")).toBeInTheDocument();
  });
});
