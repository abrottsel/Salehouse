import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContactForm from "@/components/ContactForm";

describe("ContactForm", () => {
  it("renders section heading", () => {
    render(<ContactForm />);
    expect(screen.getByText("Свяжитесь с нами")).toBeInTheDocument();
  });

  it("displays phone number", () => {
    render(<ContactForm />);
    expect(screen.getByText("+7 (495) 989-10-70")).toBeInTheDocument();
  });

  it("displays email", () => {
    render(<ContactForm />);
    expect(screen.getByText("office@zemexx.ru")).toBeInTheDocument();
  });

  it("renders form fields", () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText("Как к вам обращаться?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("+7 (___) ___-__-__")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("mail@example.com")).toBeInTheDocument();
  });

  it("has submit button", () => {
    render(<ContactForm />);
    expect(screen.getByText("Отправить заявку")).toBeInTheDocument();
  });

  it("has lead type selector", () => {
    render(<ContactForm />);
    expect(screen.getByText("Что вас интересует?")).toBeInTheDocument();
  });

  it("shows address", () => {
    render(<ContactForm />);
    expect(screen.getByText(/Москва, пр. Мира/)).toBeInTheDocument();
  });
});
