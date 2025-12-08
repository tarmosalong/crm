"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, Users, Building2, Handshake } from "lucide-react";
import { toast } from "sonner";
import { exportContacts, exportCompanies, exportDeals } from "@/actions/export";

export function ExportButtons() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: "contacts" | "companies" | "deals") => {
    setIsExporting(type);
    try {
      let result;
      let filename;
      
      switch (type) {
        case "contacts":
          result = await exportContacts();
          filename = "contacts.csv";
          break;
        case "companies":
          result = await exportCompanies();
          filename = "companies.csv";
          break;
        case "deals":
          result = await exportDeals();
          filename = "deals.csv";
          break;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.csv) {
        // Create blob and download
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
        <DropdownMenuLabel className="text-slate-400">Export Data</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem
          onClick={() => handleExport("contacts")}
          disabled={isExporting !== null}
          className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
        >
          <Users className="h-4 w-4 mr-2 text-blue-400" />
          Contacts
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("companies")}
          disabled={isExporting !== null}
          className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
        >
          <Building2 className="h-4 w-4 mr-2 text-emerald-400" />
          Companies
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("deals")}
          disabled={isExporting !== null}
          className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
        >
          <Handshake className="h-4 w-4 mr-2 text-violet-400" />
          Deals
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

