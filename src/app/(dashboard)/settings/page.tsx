import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Tag, Shield } from "lucide-react";
import { TagManager } from "./tag-manager";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, tags] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    db.tag.findMany({
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Manage your account and application settings
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            Profile
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{user.name}</h3>
              <p className="text-slate-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className={
                    isAdmin
                      ? "border-amber-500 text-amber-400"
                      : "border-slate-500 text-slate-400"
                  }
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Member since</p>
              <p className="text-white">
                {new Date(user.createdAt).toLocaleDateString("et-EE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-400">User ID</p>
              <p className="text-white font-mono text-xs">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags Management (Admin only) */}
      {isAdmin && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Tag className="h-5 w-5 text-emerald-500" />
              Tags Management
            </CardTitle>
            <CardDescription className="text-slate-400">
              Create and manage tags for contacts and companies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagManager tags={tags} />
          </CardContent>
        </Card>
      )}

      {/* App Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">About</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-400 space-y-2">
          <p>
            <span className="text-white font-medium">Simple CRM</span> - Customer
            Relationship Management
          </p>
          <p>Version 1.0.0</p>
          <p>Built with Next.js, Prisma, and PostgreSQL</p>
        </CardContent>
      </Card>
    </div>
  );
}

