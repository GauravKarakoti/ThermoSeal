import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { AddressCard } from "./components/AddressCard";
import { ConnectSection } from "./components/ConnectSection";
import { LanguageToggle } from "./components/LanguageToggle";
import { RoleToggle } from "./components/RoleToggle";
import { ThermoSealDashboard } from "./components/ThermoSeal/ThermoSealDashboard";
import AuditorScope from "./pages/AuditorScope";
import ShipperRegister from "./pages/ShipperRegister";
import ShipperAuditors from "./pages/ShipperAuditors";
import CarrierLeg from "./pages/CarrierLeg";
import VerifyShipment from "./pages/VerifyShipment";
import { useWallet } from "./contexts/useWallet";
import { getCurrentRole, type Role } from "./utils/role";

function MainContent() {
  const { state } = useWallet();
  const [currentRole, setCurrentRole] = useState<Role>(getCurrentRole());

  useEffect(() => {
    const handleRoleChange = () => {
      setCurrentRole(getCurrentRole());
    };
    window.addEventListener("role-changed", handleRoleChange);
    return () => window.removeEventListener("role-changed", handleRoleChange);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start px-4 py-8 bg-slate-950 text-slate-100">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <a href="/" className="font-bold text-lg text-emerald-400 tracking-tight hover:opacity-90">
          ThermoSeal
        </a>
        <div className="flex items-center gap-3">
          <RoleToggle />
          <LanguageToggle />
        </div>
      </div>

      <Routes>
        <Route path="/auditor/:grantId" element={<AuditorScope />} />
        <Route path="/shipper/register" element={<ShipperRegister />} />
        <Route path="/shipper/auditors" element={<ShipperAuditors />} />
        <Route path="/carrier/:shipmentId/leg/:n" element={<CarrierLeg />} />
        <Route path="/verify/:shipmentId" element={<VerifyShipment />} />
        <Route
          path="*"
          element={
            state.status === "connected" ? (
              <div className="flex flex-col gap-6 w-full max-w-4xl">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <AddressCard />
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Active Persona</span>
                    <span className="text-sm font-medium capitalize text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full inline-block mt-1">
                      {currentRole}
                    </span>
                  </div>
                </div>

                <ThermoSealDashboard role={currentRole} />
              </div>
            ) : (
              <div className="flex min-h-[70vh] items-center justify-center w-full">
                <ConnectSection />
              </div>
            )
          }
        />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
}

export default App;