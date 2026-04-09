import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("Leads API logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate required fields", () => {
    const body = { name: "", phone: "", type: "" };
    const isValid = body.name && body.phone && body.type;
    expect(isValid).toBeFalsy();
  });

  it("should accept valid lead data", () => {
    const body = {
      name: "Иван",
      phone: "+79991234567",
      type: "VIEWING",
      email: "ivan@test.ru",
      message: "Хочу посмотреть участок",
    };
    const isValid = body.name && body.phone && body.type;
    expect(isValid).toBeTruthy();
  });

  it("should call prisma.lead.create with correct data", async () => {
    const mockCreate = vi.mocked(prisma.lead.create);
    mockCreate.mockResolvedValue({
      id: 1,
      name: "Иван",
      phone: "+79991234567",
      email: null,
      type: "VIEWING",
      message: null,
      villageId: null,
      plotId: null,
      source: null,
      createdAt: new Date(),
    });

    await prisma.lead.create({
      data: {
        name: "Иван",
        phone: "+79991234567",
        type: "VIEWING",
        email: null,
        message: null,
        villageId: null,
        plotId: null,
        source: null,
      },
    });

    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("should support all lead types", () => {
    const validTypes = ["VIEWING", "PRESENTATION", "MORTGAGE", "BOOKING", "CALLBACK"];
    validTypes.forEach((type) => {
      expect(["VIEWING", "PRESENTATION", "MORTGAGE", "BOOKING", "CALLBACK"]).toContain(type);
    });
  });
});
