"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const dealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.coerce.number().min(0, "Value must be positive").default(0),
  currency: z.string().default("EUR"),
  probability: z.coerce.number().min(0).max(100).default(0),
  expectedCloseDate: z.string().optional(),
  description: z.string().optional(),
  stageId: z.string().min(1, "Stage is required"),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
});

export type DealFormState = {
  error?: string;
  success?: boolean;
};

export async function createDeal(
  prevState: DealFormState,
  formData: FormData
): Promise<DealFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const companyId = formData.get("companyId") as string;
  const contactId = formData.get("contactId") as string;

  const validatedFields = dealSchema.safeParse({
    name: formData.get("name"),
    value: formData.get("value"),
    currency: formData.get("currency") || "EUR",
    probability: formData.get("probability"),
    expectedCloseDate: formData.get("expectedCloseDate") || undefined,
    description: formData.get("description") || undefined,
    stageId: formData.get("stageId"),
    companyId: companyId && companyId !== "none" ? companyId : undefined,
    contactId: contactId && contactId !== "none" ? contactId : undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.deal.create({
      data: {
        name: data.name,
        value: data.value,
        currency: data.currency,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate
          ? new Date(data.expectedCloseDate)
          : null,
        description: data.description || null,
        stageId: data.stageId,
        companyId: data.companyId || null,
        contactId: data.contactId || null,
        ownerId: session.user.id,
      },
    });

    revalidatePath("/deals");
    return { success: true };
  } catch {
    return { error: "Failed to create deal" };
  }
}

export async function updateDeal(
  id: string,
  prevState: DealFormState,
  formData: FormData
): Promise<DealFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const companyId = formData.get("companyId") as string;
  const contactId = formData.get("contactId") as string;

  const validatedFields = dealSchema.safeParse({
    name: formData.get("name"),
    value: formData.get("value"),
    currency: formData.get("currency") || "EUR",
    probability: formData.get("probability"),
    expectedCloseDate: formData.get("expectedCloseDate") || undefined,
    description: formData.get("description") || undefined,
    stageId: formData.get("stageId"),
    companyId: companyId && companyId !== "none" ? companyId : undefined,
    contactId: contactId && contactId !== "none" ? contactId : undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.deal.update({
      where: { id, ownerId: session.user.id },
      data: {
        name: data.name,
        value: data.value,
        currency: data.currency,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate
          ? new Date(data.expectedCloseDate)
          : null,
        description: data.description || null,
        stageId: data.stageId,
        companyId: data.companyId || null,
        contactId: data.contactId || null,
      },
    });

    revalidatePath("/deals");
    revalidatePath(`/deals/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to update deal" };
  }
}

export async function updateDealStage(
  id: string,
  stageId: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.deal.update({
      where: { id, ownerId: session.user.id },
      data: { stageId },
    });

    revalidatePath("/deals");
    return {};
  } catch {
    return { error: "Failed to update deal stage" };
  }
}

export async function markDealWon(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.deal.update({
      where: { id, ownerId: session.user.id },
      data: {
        status: "WON",
        wonDate: new Date(),
        probability: 100,
      },
    });

    revalidatePath("/deals");
    return {};
  } catch {
    return { error: "Failed to mark deal as won" };
  }
}

export async function markDealLost(
  id: string,
  reason?: string
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.deal.update({
      where: { id, ownerId: session.user.id },
      data: {
        status: "LOST",
        lostReason: reason || null,
        probability: 0,
      },
    });

    revalidatePath("/deals");
    return {};
  } catch {
    return { error: "Failed to mark deal as lost" };
  }
}

export async function deleteDeal(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.deal.delete({
      where: { id, ownerId: session.user.id },
    });

    revalidatePath("/deals");
    return {};
  } catch {
    return { error: "Failed to delete deal" };
  }
}

export async function getDeals() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const deals = await db.deal.findMany({
    where: { ownerId: session.user.id, status: "OPEN" },
    include: {
      stage: true,
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Serialize Decimal values to numbers for client components
  return deals.map((deal) => ({
    ...deal,
    value: Number(deal.value),
  }));
}

export async function getPipelineStages() {
  const stages = await db.pipelineStage.findMany({
    orderBy: { order: "asc" },
  });

  // Serialize for client components
  return stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    order: stage.order,
    color: stage.color,
    isDefault: stage.isDefault,
  }));
}

export async function getDeal(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.deal.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      stage: true,
      company: true,
      contact: true,
      notes: {
        include: {
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      communications: {
        include: {
          author: { select: { name: true } },
        },
        orderBy: { date: "desc" },
      },
      tasks: {
        where: { status: "OPEN" },
        orderBy: { dueDate: "asc" },
      },
    },
  });
}

// Seed default pipeline stages
export async function seedPipelineStages() {
  const existingStages = await db.pipelineStage.count();
  if (existingStages > 0) return;

  const defaultStages = [
    { name: "Lead", order: 1, color: "#94a3b8", isDefault: true },
    { name: "Qualified", order: 2, color: "#3b82f6" },
    { name: "Proposal", order: 3, color: "#8b5cf6" },
    { name: "Negotiation", order: 4, color: "#f59e0b" },
    { name: "Won", order: 5, color: "#10b981" },
    { name: "Lost", order: 6, color: "#ef4444" },
  ];

  await db.pipelineStage.createMany({
    data: defaultStages,
  });
}

