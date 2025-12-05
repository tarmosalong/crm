"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  regNumber: z.string().optional(),
  address: z.string().optional(),
  sector: z.string().optional(),
  size: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  description: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export type CompanyFormState = {
  error?: string;
  success?: boolean;
};

export async function createCompany(
  prevState: CompanyFormState,
  formData: FormData
): Promise<CompanyFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = companySchema.safeParse({
    name: formData.get("name"),
    regNumber: formData.get("regNumber") || undefined,
    address: formData.get("address") || undefined,
    sector: formData.get("sector") || undefined,
    size: formData.get("size") || undefined,
    website: formData.get("website") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    description: formData.get("description") || undefined,
    tagIds: formData.getAll("tagIds").filter(Boolean),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.company.create({
      data: {
        name: data.name,
        regNumber: data.regNumber || null,
        address: data.address || null,
        sector: data.sector || null,
        size: data.size || null,
        website: data.website || null,
        phone: data.phone || null,
        email: data.email || null,
        description: data.description || null,
        ownerId: session.user.id,
        tags: data.tagIds?.length
          ? {
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
    });

    revalidatePath("/companies");
    return { success: true };
  } catch {
    return { error: "Failed to create company" };
  }
}

export async function updateCompany(
  id: string,
  prevState: CompanyFormState,
  formData: FormData
): Promise<CompanyFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validatedFields = companySchema.safeParse({
    name: formData.get("name"),
    regNumber: formData.get("regNumber") || undefined,
    address: formData.get("address") || undefined,
    sector: formData.get("sector") || undefined,
    size: formData.get("size") || undefined,
    website: formData.get("website") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    description: formData.get("description") || undefined,
    tagIds: formData.getAll("tagIds").filter(Boolean),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const data = validatedFields.data;

  try {
    await db.companyTag.deleteMany({ where: { companyId: id } });

    await db.company.update({
      where: { id, ownerId: session.user.id },
      data: {
        name: data.name,
        regNumber: data.regNumber || null,
        address: data.address || null,
        sector: data.sector || null,
        size: data.size || null,
        website: data.website || null,
        phone: data.phone || null,
        email: data.email || null,
        description: data.description || null,
        tags: data.tagIds?.length
          ? {
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
    });

    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
    return { success: true };
  } catch {
    return { error: "Failed to update company" };
  }
}

export async function deleteCompany(id: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.company.delete({
      where: { id, ownerId: session.user.id },
    });

    revalidatePath("/companies");
    return {};
  } catch {
    return { error: "Failed to delete company" };
  }
}

export async function getCompanies(params: { search?: string; tagId?: string }) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const { search, tagId } = params;

  const companies = await db.company.findMany({
    where: {
      ownerId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { regNumber: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(tagId && {
        tags: { some: { tagId } },
      }),
    },
    include: {
      tags: {
        include: {
          tag: { select: { id: true, name: true, color: true } },
        },
      },
      _count: {
        select: { contacts: true, deals: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Serialize for client components
  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    sector: company.sector,
    size: company.size,
    website: company.website,
    regNumber: company.regNumber,
    address: company.address,
    phone: company.phone,
    email: company.email,
    description: company.description,
    tags: company.tags,
    _count: company._count,
  }));
}

export async function getCompany(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.company.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      contacts: {
        include: {
          contact: true,
        },
      },
      deals: {
        include: {
          stage: true,
        },
        orderBy: { updatedAt: "desc" },
      },
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
    },
  });
}

