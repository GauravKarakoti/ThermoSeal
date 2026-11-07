import { useEffect, useState } from "react";
import { getCurrentRole, setRole, type Role } from "@/utils/role";
import { Button } from "@/components/ui/button";

const ROLES: { id: Role; label: string }[] = [
  { id: "shipper", label: "Shipper" },
  { id: "carrier", label: "Carrier" },
  { id: "verifier", label: "Verifier" },
  { id: "auditor", label: "Auditor" },
];

export function RoleToggle() {
  const [currentRole, setCurrentRole] = useState<Role>(getCurrentRole());

  useEffect(() => {
    const handleRoleChange = () => {
      setCurrentRole(getCurrentRole());
    };
    window.addEventListener("role-changed", handleRoleChange);
    return () => window.removeEventListener("role-changed", handleRoleChange);
  }, []);

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
      {ROLES.map((r) => (
        <Button
          key={r.id}
          variant={currentRole === r.id ? "default" : "ghost"}
          size="sm"
          className={`h-7 px-2.5 text-xs capitalize ${
            currentRole === r.id
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          onClick={() => setRole(r.id)}
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}