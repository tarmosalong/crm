"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
});

export type TagFormState = {
  error?: string;
  success?: boolean;
};

export async function createTag(
  prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Unauthorized - Admin only" };
  }

  const validatedFields = tagSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || "#6366f1",
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { name, color } = validatedFields.data;

  try {
    await db.tag.create({
      data: { name, color },
    });

    revalidatePath("/contacts");
    revalidatePath("/companies");
    return { success: true };
  } catch {
    return { error: "Failed to create tag (name may already exist)" };
  }
}

export async function deleteTag(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return { error: "Unauthorized - Admin only" };
  }

  try {
    await db.tag.delete({ where: { id } });
    revalidatePath("/contacts");
    revalidatePath("/companies");
    return {};
  } catch {
    return { error: "Failed to delete tag" };
  }
}

export async function getTags() {
  return db.tag.findMany({ orderBy: { name: "asc" } });
}

// Seed some default tags
export async function seedDefaultTags() {
  const existingTags = await db.tag.count();
  if (existingTags > 0) return;

  const defaultTags = [
    { name: "VIP", color: "#f59e0b" },
    { name: "Hot Lead", color: "#ef4444" },
    { name: "Cold", color: "#6366f1" },
    { name: "Partner", color: "#10b981" },
    { name: "Supplier", color: "#8b5cf6" },
  ];

  await db.tag.createMany({ data: defaultTags });
}

