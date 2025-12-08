"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function escapeCsvField(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return "";
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerRow = headers.map(escapeCsvField).join(",");
  const dataRows = rows.map((row) => row.map(escapeCsvField).join(","));
  return [headerRow, ...dataRows].join("\n");
}

export async function exportContacts(): Promise<{ csv?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const contacts = await db.contact.findMany({
      where: { ownerId: session.user.id },
      include: {
        companies: {
          include: {
            company: { select: { name: true } },
          },
        },
        tags: {
          include: {
            tag: { select: { name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const headers = ["Name", "Email", "Phone", "Role", "Companies", "Tags", "Notes", "Created"];
    const rows = contacts.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.role,
      c.companies.map((cc) => cc.company.name).join("; "),
      c.tags.map((ct) => ct.tag.name).join("; "),
      c.notes,
      c.createdAt.toISOString().split("T")[0],
    ]);

    return { csv: arrayToCsv(headers, rows) };
  } catch {
    return { error: "Failed to export contacts" };
  }
}

export async function exportCompanies(): Promise<{ csv?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const companies = await db.company.findMany({
      where: { ownerId: session.user.id },
      include: {
        tags: {
          include: {
            tag: { select: { name: true } },
          },
        },
        _count: {
          select: { contacts: true, deals: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const headers = [
      "Name",
      "Reg Number",
      "Address",
      "Sector",
      "Size",
      "Website",
      "Phone",
      "Email",
      "Tags",
      "Contacts Count",
      "Deals Count",
      "Created",
    ];
    const rows = companies.map((c) => [
      c.name,
      c.regNumber,
      c.address,
      c.sector,
      c.size,
      c.website,
      c.phone,
      c.email,
      c.tags.map((ct) => ct.tag.name).join("; "),
      c._count.contacts,
      c._count.deals,
      c.createdAt.toISOString().split("T")[0],
    ]);

    return { csv: arrayToCsv(headers, rows) };
  } catch {
    return { error: "Failed to export companies" };
  }
}

export async function exportDeals(): Promise<{ csv?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const deals = await db.deal.findMany({
      where: { ownerId: session.user.id },
      include: {
        stage: { select: { name: true } },
        company: { select: { name: true } },
        contact: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Name",
      "Value",
      "Currency",
      "Probability",
      "Stage",
      "Status",
      "Company",
      "Contact",
      "Expected Close",
      "Won Date",
      "Lost Reason",
      "Created",
    ];
    const rows = deals.map((d) => [
      d.name,
      Number(d.value),
      d.currency,
      d.probability,
      d.stage.name,
      d.status,
      d.company?.name,
      d.contact?.name,
      d.expectedCloseDate?.toISOString().split("T")[0],
      d.wonDate?.toISOString().split("T")[0],
      d.lostReason,
      d.createdAt.toISOString().split("T")[0],
    ]);

    return { csv: arrayToCsv(headers, rows) };
  } catch {
    return { error: "Failed to export deals" };
  }
}


