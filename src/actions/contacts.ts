"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
  linkedin: z.string().optional(),
  companyIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

export type ContactFormState = {
  error?: string;
  success?: boolean;
};

export async function createContact(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    role: formData.get("role") || undefined,
    notes: formData.get("notes") || undefined,
    linkedin: formData.get("linkedin") || undefined,
    companyIds: formData.getAll("companyIds").filter(Boolean),
    tagIds: formData.getAll("tagIds").filter(Boolean),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { name, email, phone, role, notes, linkedin, companyIds, tagIds } =
    validatedFields.data;

  try {
    await db.contact.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        role: role || null,
        notes: notes || null,
        linkedin: linkedin || null,
        ownerId: session.user.id,
        companies: companyIds?.length
          ? {
              create: companyIds.map((companyId) => ({
                companyId,
              })),
            }
          : undefined,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/contacts");
    return { success: true };
  } catch {
    return { error: "Failed to create contact" };
  }
}

export async function updateContact(
  id: string,
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    role: formData.get("role") || undefined,
    notes: formData.get("notes") || undefined,
    linkedin: formData.get("linkedin") || undefined,
    companyIds: formData.getAll("companyIds").filter(Boolean),
    tagIds: formData.getAll("tagIds").filter(Boolean),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { name, email, phone, role, notes, linkedin, companyIds, tagIds } =
    validatedFields.data;

  try {
    // Delete existing company and tag relations
    await db.contactCompany.deleteMany({ where: { contactId: id } });
    await db.contactTag.deleteMany({ where: { contactId: id } });

    await db.contact.update({
      where: { id, ownerId: session.user.id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        role: role || null,
        notes: notes || null,
        linkedin: linkedin || null,
        companies: companyIds?.length
          ? {
              create: companyIds.map((companyId) => ({
                companyId,
              })),
            }
          : undefined,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to update contact" };
  }
}

export async function deleteContact(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.contact.delete({
      where: { id, ownerId: session.user.id },
    });

    revalidatePath("/contacts");
    return {};
  } catch {
    return { error: "Failed to delete contact" };
  }
}

export async function getContacts(params: {
  search?: string;
  tagId?: string;
  companyId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const { search, tagId, companyId } = params;

  const contacts = await db.contact.findMany({
    where: {
      ownerId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tagId && {
        tags: { some: { tagId } },
      }),
      ...(companyId && {
        companies: { some: { companyId } },
      }),
    },
    include: {
      companies: {
        include: {
          company: { select: { id: true, name: true } },
        },
      },
      tags: {
        include: {
          tag: { select: { id: true, name: true, color: true } },
        },
      },
      _count: {
        select: { deals: true, tasks: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Serialize for client components
  return contacts.map((contact) => ({
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    role: contact.role,
    notes: contact.notes,
    linkedin: contact.linkedin,
    companies: contact.companies,
    tags: contact.tags,
    _count: contact._count,
  }));
}

export async function getContact(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.contact.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      companies: {
        include: {
          company: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      deals: {
        include: {
          stage: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      tasks: {
        where: { status: "OPEN" },
        orderBy: { dueDate: "asc" },
      },
      contactNotes: {
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
    },
  });
}

