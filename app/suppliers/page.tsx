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

interface MailConfig {
  provider: "gmail" | "outlook";
  email: string;
  appPassword: string;
}

const STORAGE_KEY = "supplier-settings";

const DEFAULT_SETTINGS: SupplierSettings = {
  companyName: "",
  contactPerson: "",
  email: "",
  paymentTerms: "Net 30",
  currencyPreference: "USD",
};

const DEFAULT_MAIL_CONFIG: MailConfig = {
  provider: "gmail",
  email: "",
  appPassword: "",
};

export default function SuppliersPage() {
  const [settings, setSettings] = useState<SupplierSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [mailConfig, setMailConfig] = useState<MailConfig>(DEFAULT_MAIL_CONFIG);
  const [mailSaved, setMailSaved] = useState(false);
  const [mailError, setMailError] = useState("");
  const [syncingInbox, setSyncingInbox] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsResponse, mailResponse] = await Promise.all([
          fetch(`/api/supplier-settings`),
          fetch(`/api/mail/config`),
        ]);

        if (!settingsResponse.ok) {
          throw new Error("Failed to fetch settings");
        }

        const data = await settingsResponse.json();
        if (data?.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...data.settings }));
        }

        if (mailResponse.ok) {
          const mailData = await mailResponse.json();
          if (mailData?.config) {
            setMailConfig((previous) => ({
              ...previous,
              provider: mailData.config.provider || previous.provider,
              email: mailData.config.email || "",
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load supplier settings from API, trying local cache:", error);
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as SupplierSettings;
            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          } catch (parseError) {
            console.error("Failed to parse cached supplier settings:", parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (field: keyof SupplierSettings, value: string) => {
    setSaved(false);
    setSettings((previous) => ({ ...previous, [field]: value }));
  };

  const handleSave = async () => {
    setSaveError("");
    try {
      const response = await fetch("/api/supplier-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save supplier settings:", error);
      setSaveError("Failed to save settings. Please try again.");
    }
  };

  const handleMailChange = (field: keyof MailConfig, value: string) => {
    setMailSaved(false);
    setMailError("");
    setMailConfig((previous) => ({ ...previous, [field]: value }));
  };

  const handleSaveMailConfig = async () => {
    setMailSaved(false);
    setMailError("");

    try {
      const response = await fetch("/api/mail/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: mailConfig }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mail integration");
      }

      setMailSaved(true);
      setTimeout(() => setMailSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save mail config:", error);
      setMailError("Failed to save mail integration settings.");
    }
  };

  const handleSyncInbox = async () => {
    setSyncingInbox(true);
    setLastSyncMessage("");

    try {
      const response = await fetch("/api/mail/sync", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to sync inbox");
      }

      setLastSyncMessage(`Inbox synced. ${data.synced || 0} new emails analyzed.`);
    } catch (error) {
      setLastSyncMessage(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setSyncingInbox(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </main>
    );
  }

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
              Save supplier details and preferences
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
              <p className="text-sm text-white/65">Stored securely in your account.</p>
              <Button onClick={handleSave} className="bg-linear-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400">
                Save Settings
              </Button>
            </div>

            {saved && <p className="text-sm font-medium text-emerald-300">Settings saved successfully.</p>}
            {saveError && <p className="text-sm font-medium text-rose-300">{saveError}</p>}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/10 text-white backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Email Integration</CardTitle>
            <CardDescription className="text-white/65">
              Connect Gmail or Outlook to auto-pull incoming emails and send replies directly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-white/80">Provider</label>
                <select
                  value={mailConfig.provider}
                  onChange={(event) => handleMailChange("provider", event.target.value as "gmail" | "outlook")}
                  className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-white/30"
                >
                  <option value="gmail" className="bg-neutral-900 text-white">Gmail</option>
                  <option value="outlook" className="bg-neutral-900 text-white">Outlook</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Mailbox Email</label>
                <input
                  type="email"
                  value={mailConfig.email}
                  onChange={(event) => handleMailChange("email", event.target.value)}
                  className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-white/30"
                  placeholder="finance@yourcompany.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80">App Password</label>
              <input
                type="password"
                value={mailConfig.appPassword}
                onChange={(event) => handleMailChange("appPassword", event.target.value)}
                className="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/45 focus:outline-hidden focus:ring-2 focus:ring-white/30"
                placeholder="Use Gmail/Outlook app password"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={handleSaveMailConfig} className="bg-linear-to-r from-blue-500 to-violet-500 text-white hover:from-blue-400 hover:to-violet-400">
                Save Mail Connection
              </Button>
              <Button
                variant="outline"
                onClick={handleSyncInbox}
                disabled={syncingInbox}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                {syncingInbox ? "Syncing..." : "Sync Inbox Now"}
              </Button>
            </div>

            {mailSaved && <p className="text-sm font-medium text-emerald-300">Mail integration saved successfully.</p>}
            {mailError && <p className="text-sm font-medium text-rose-300">{mailError}</p>}
            {lastSyncMessage && <p className="text-sm font-medium text-cyan-300">{lastSyncMessage}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}