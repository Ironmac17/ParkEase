import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import axios from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";

const GeneralSettings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    bookingReminders: true,
    promotionalEmails: false,
    weeklyReport: true,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post("/user/settings", settings);
      showToast("Settings saved successfully", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save settings",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-lg transition"
          >
            <ChevronLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-3xl font-bold text-white">General Settings</h1>
        </div>

        {/* Settings Options */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Email Notifications
              </h3>
              <p className="text-gray-400 text-sm">
                Receive updates about your bookings via email
              </p>
            </div>
            <button
              onClick={() => handleToggle("emailNotifications")}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.emailNotifications ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition transform ${
                  settings.emailNotifications
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Push Notifications
              </h3>
              <p className="text-gray-400 text-sm">
                Receive instant alerts on your device
              </p>
            </div>
            <button
              onClick={() => handleToggle("pushNotifications")}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.pushNotifications ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition transform ${
                  settings.pushNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Booking Reminders
              </h3>
              <p className="text-gray-400 text-sm">
                Get reminded before your booking ends
              </p>
            </div>
            <button
              onClick={() => handleToggle("bookingReminders")}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.bookingReminders ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition transform ${
                  settings.bookingReminders ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Promotional Emails
              </h3>
              <p className="text-gray-400 text-sm">
                Receive exclusive offers and promotions
              </p>
            </div>
            <button
              onClick={() => handleToggle("promotionalEmails")}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.promotionalEmails ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition transform ${
                  settings.promotionalEmails ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="border-t border-white/10" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Weekly Report</h3>
              <p className="text-gray-400 text-sm">
                Get weekly summary of your parking activity
              </p>
            </div>
            <button
              onClick={() => handleToggle("weeklyReport")}
              className={`relative w-12 h-6 rounded-full transition ${
                settings.weeklyReport ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition transform ${
                  settings.weeklyReport ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
