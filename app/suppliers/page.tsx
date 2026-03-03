"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SupplierSettings {
  companyName: string;
  contactPerson: string;
  email: string;
  paymentTerms: string;
  currencyPreference: string;
}

const STORAGE_KEY = "supplier-settings";

const DEFAULT_SETTINGS: SupplierSettings = {
  companyName: "",
  contactPerson: "",
  email: "",
  paymentTerms: "Net 30",
  currencyPreference: "USD",
};

export default function SuppliersPage() {
  const [settings, setSettings] = useState<SupplierSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (!savedSettings) return;
    try {
      const parsed = JSON.parse(savedSettings) as SupplierSettings;
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
    } catch (error) {
      console.error("Failed to parse supplier settings:", error);
    }
  }, []);

  const handleChange = (field: keyof SupplierSettings, value: string) => {
    setSaved(false);
    setSettings((previous) => ({ ...previous, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="container mx-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="bg-linear-to-r from-white to-white/70 bg-clip-text text-3xl font-bold text-transparent">Supplier Settings</h1>
          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>

        <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Supplier Profile</CardTitle>
            <CardDescription className="text-white/65">
              Save supplier details and preferences locally for now
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(event) => handleChange("companyName", event.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-white/30"
                placeholder="Acme Supplies Ltd"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Contact Person</label>
              <input
                type="text"
                value={settings.contactPerson}
                onChange={(event) => handleChange("contactPerson", event.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-white/30"
                placeholder="Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-white/30"
                placeholder="contact@acme.com"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-white/80">Payment Terms</label>
                <select
                  value={settings.paymentTerms}
                  onChange={(event) => handleChange("paymentTerms", event.target.value)}
                  className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-white/30"
                >
                  <option value="Net 15" className="bg-neutral-900 text-white">Net 15</option>
                  <option value="Net 30" className="bg-neutral-900 text-white">Net 30</option>
                  <option value="Net 45" className="bg-neutral-900 text-white">Net 45</option>
                  <option value="Net 60" className="bg-neutral-900 text-white">Net 60</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Currency Preference</label>
                <select
                  value={settings.currencyPreference}
                  onChange={(event) => handleChange("currencyPreference", event.target.value)}
                  className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-white/30"
                >
                  <option value="USD" className="bg-neutral-900 text-white">USD</option>
                  <option value="EUR" className="bg-neutral-900 text-white">EUR</option>
                  <option value="GBP" className="bg-neutral-900 text-white">GBP</option>
                  <option value="INR" className="bg-neutral-900 text-white">INR</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-white/65">Stored in your browser local storage.</p>
              <Button onClick={handleSave} className="bg-linear-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400">
                Save Settings
              </Button>
            </div>

            {saved && <p className="text-sm font-medium text-emerald-300">Settings saved successfully.</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}