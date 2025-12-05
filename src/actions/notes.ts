"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
});

export type NoteFormState = {
  error?: string;
  success?: boolean;
};

export async function createNote(
  prevState: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = noteSchema.safeParse({
    content: formData.get("content"),
    contactId: formData.get("contactId") || undefined,
    companyId: formData.get("companyId") || undefined,
    dealId: formData.get("dealId") || undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.note.create({
      data: {
        content: data.content,
        contactId: data.contactId || null,
        companyId: data.companyId || null,
        dealId: data.dealId || null,
        authorId: session.user.id,
      },
    });

    if (data.contactId) revalidatePath(`/contacts/${data.contactId}`);
    if (data.companyId) revalidatePath(`/companies/${data.companyId}`);
    if (data.dealId) revalidatePath(`/deals/${data.dealId}`);

    return { success: true };
  } catch {
    return { error: "Failed to create note" };
  }
}

export async function deleteNote(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.note.delete({
      where: { id, authorId: session.user.id },
    });

    return {};
  } catch {
    return { error: "Failed to delete note" };
  }
}

// Communication actions
const communicationSchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "OTHER"]),
  subject: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  duration: z.coerce.number().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
});

export async function createCommunication(
  prevState: NoteFormState,
  formData: FormData
): Promise<NoteFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = communicationSchema.safeParse({
    type: formData.get("type"),
    subject: formData.get("subject") || undefined,
    description: formData.get("description") || undefined,
    date: formData.get("date") || undefined,
    duration: formData.get("duration") || undefined,
    contactId: formData.get("contactId") || undefined,
    companyId: formData.get("companyId") || undefined,
    dealId: formData.get("dealId") || undefined,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.communication.create({
      data: {
        type: data.type,
        subject: data.subject || null,
        description: data.description || null,
        date: data.date ? new Date(data.date) : new Date(),
        duration: data.duration || null,
        contactId: data.contactId || null,
        companyId: data.companyId || null,
        dealId: data.dealId || null,
        authorId: session.user.id,
      },
    });

    if (data.contactId) revalidatePath(`/contacts/${data.contactId}`);
    if (data.companyId) revalidatePath(`/companies/${data.companyId}`);
    if (data.dealId) revalidatePath(`/deals/${data.dealId}`);

    return { success: true };
  } catch {
    return { error: "Failed to log communication" };
  }
}

