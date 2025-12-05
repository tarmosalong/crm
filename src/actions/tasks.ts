"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
});

export type TaskFormState = {
  error?: string;
  success?: boolean;
};

export async function createTask(
  prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const contactId = formData.get("contactId") as string;
  const dealId = formData.get("dealId") as string;

  const validatedFields = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    priority: formData.get("priority") || "MEDIUM",
    contactId: contactId && contactId !== "none" ? contactId : undefined,
    dealId: dealId && dealId !== "none" ? dealId : undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        assigneeId: session.user.id,
        creatorId: session.user.id,
      },
    });

    revalidatePath("/tasks");
    return { success: true };
  } catch {
    return { error: "Failed to create task" };
  }
}

export async function updateTask(
  id: string,
  prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const contactId = formData.get("contactId") as string;
  const dealId = formData.get("dealId") as string;

  const validatedFields = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    priority: formData.get("priority") || "MEDIUM",
    contactId: contactId && contactId !== "none" ? contactId : undefined,
    dealId: dealId && dealId !== "none" ? dealId : undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.task.update({
      where: { id, assigneeId: session.user.id },
      data: {
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
      },
    });

    revalidatePath("/tasks");
    return { success: true };
  } catch {
    return { error: "Failed to update task" };
  }
}

export async function toggleTaskStatus(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const task = await db.task.findUnique({
      where: { id, assigneeId: session.user.id },
    });

    if (!task) {
      return { error: "Task not found" };
    }

    await db.task.update({
      where: { id },
      data: {
        status: task.status === "OPEN" ? "DONE" : "OPEN",
        completedAt: task.status === "OPEN" ? new Date() : null,
      },
    });

    revalidatePath("/tasks");
    return {};
  } catch {
    return { error: "Failed to update task" };
  }
}

export async function deleteTask(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.task.delete({
      where: { id, assigneeId: session.user.id },
    });

    revalidatePath("/tasks");
    return {};
  } catch {
    return { error: "Failed to delete task" };
  }
}

export async function getTasks(params: {
  filter?: "today" | "week" | "all" | "completed";
}) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const { filter = "all" } = params;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  let where: object = { assigneeId: session.user.id };

  switch (filter) {
    case "today":
      where = {
        ...where,
        status: "OPEN",
        dueDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      };
      break;
    case "week":
      where = {
        ...where,
        status: "OPEN",
        dueDate: {
          gte: today,
          lt: nextWeek,
        },
      };
      break;
    case "completed":
      where = {
        ...where,
        status: "DONE",
      };
      break;
    case "all":
    default:
      where = {
        ...where,
        status: "OPEN",
      };
  }

  return db.task.findMany({
    where,
    include: {
      contact: { select: { id: true, name: true } },
      deal: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

