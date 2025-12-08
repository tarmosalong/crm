"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface SearchResult {
  type: "contact" | "company" | "deal" | "task";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const session = await auth();
  if (!session?.user?.id || !query || query.length < 2) return [];

  const [contacts, companies, deals, tasks] = await Promise.all([
    // Search contacts
    db.contact.findMany({
      where: {
        ownerId: session.user.id,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, role: true },
      take: 5,
    }),
    // Search companies
    db.company.findMany({
      where: {
        ownerId: session.user.id,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { regNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, sector: true },
      take: 5,
    }),
    // Search deals
    db.deal.findMany({
      where: {
        ownerId: session.user.id,
        name: { contains: query, mode: "insensitive" },
      },
      select: { id: true, name: true, value: true, status: true },
      take: 5,
    }),
    // Search tasks
    db.task.findMany({
      where: {
        assigneeId: session.user.id,
        title: { contains: query, mode: "insensitive" },
      },
      select: { id: true, title: true, status: true },
      take: 5,
    }),
  ]);

  const results: SearchResult[] = [
    ...contacts.map((c) => ({
      type: "contact" as const,
      id: c.id,
      title: c.name,
      subtitle: c.role || c.email || undefined,
      href: `/contacts/${c.id}`,
    })),
    ...companies.map((c) => ({
      type: "company" as const,
      id: c.id,
      title: c.name,
      subtitle: c.sector || undefined,
      href: `/companies/${c.id}`,
    })),
    ...deals.map((d) => ({
      type: "deal" as const,
      id: d.id,
      title: d.name,
      subtitle: `€${Number(d.value).toLocaleString()} • ${d.status}`,
      href: `/deals/${d.id}`,
    })),
    ...tasks.map((t) => ({
      type: "task" as const,
      id: t.id,
      title: t.title,
      subtitle: t.status,
      href: `/tasks`,
    })),
  ];

  return results;
}

