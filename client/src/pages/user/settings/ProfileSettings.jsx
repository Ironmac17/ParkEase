import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save, Upload, Plus, Trash2 } from "lucide-react";
import axios from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";
import { useAuth } from "../../../context/AuthContext";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || "");

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    registrationNumber: "",
    model: "",
    color: "",
    type: "car",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const res = await axios.get("/vehicles");
      setVehicles(Array.isArray(res.data) ? res.data : res.data.vehicles || []);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAddVehicle = async () => {
    if (
      !newVehicle.registrationNumber ||
      !newVehicle.model ||
      !newVehicle.color
    ) {
      showToast("Please fill all vehicle fields", "warning");
      return;
    }

    try {
      const res = await axios.post("/vehicles", newVehicle);
      setVehicles([...vehicles, res.data.vehicle]);
      showToast("Vehicle added successfully", "success");
      setNewVehicle({
        registrationNumber: "",
        model: "",
        color: "",
        type: "car",
      });
      setShowAddVehicle(false);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add vehicle",
        "error",
      );
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    setDeletingId(vehicleId);
    try {
      await axios.delete(`/vehicles/${vehicleId}`);
      setVehicles(vehicles.filter((v) => v._id !== vehicleId));
      showToast("Vehicle deleted successfully", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete vehicle",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await axios.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(res.data.user);
      showToast("Profile updated successfully", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update profile",
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
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        </div>

        {/* Profile Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {/* Profile Picture */}
          <div className="mb-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img
                src={
                  imagePreview || "https://via.placeholder.com/128?text=Profile"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-white/20"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <Upload size={18} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-gray-400 text-sm">
              Click to upload profile picture
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-400 opacity-50 cursor-not-allowed"
              />
              <p className="text-gray-500 text-xs mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+91 XXXXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
              />
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
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>

        {/* Vehicles Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">My Vehicles</h2>

          {/* Add Vehicle Button */}
          <button
            onClick={() => setShowAddVehicle(!showAddVehicle)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition mb-6"
          >
            <Plus size={20} />
            Add New Vehicle
          </button>

          {/* Add Vehicle Form */}
          {showAddVehicle && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Add Vehicle</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={newVehicle.registrationNumber}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        registrationNumber: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., DL 01 AB 1234"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">
                    Model/Make
                  </label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, model: e.target.value })
                    }
                    placeholder="e.g., Toyota Fortuner"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      value={newVehicle.color}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          color: e.target.value,
                        })
                      }
                      placeholder="e.g., Black"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Type
                    </label>
                    <select
                      value={newVehicle.type}
                      onChange={(e) =>
                        setNewVehicle({ ...newVehicle, type: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="car" className="bg-[#0b0f1a]">
                        Car
                      </option>
                      <option value="bike" className="bg-[#0b0f1a]">
                        Bike
                      </option>
                      <option value="truck" className="bg-[#0b0f1a]">
                        Truck
                      </option>
                      <option value="bus" className="bg-[#0b0f1a]">
                        Bus
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddVehicle}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Add Vehicle
                  </button>
                  <button
                    onClick={() => setShowAddVehicle(false)}
                    className="flex-1 border border-white/20 hover:bg-white/5 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vehicles List */}
          {loadingVehicles ? (
            <p className="text-gray-400 text-center py-8">
              Loading vehicles...
            </p>
          ) : vehicles.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No vehicles added yet
            </p>
          ) : (
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between hover:bg-white/8 transition"
                >
                  <div className="flex-1">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">
                          Registration
                        </p>
                        <p className="text-white font-bold text-lg">
                          {vehicle.registrationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Model</p>
                        <p className="text-white font-semibold">
                          {vehicle.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Color</p>
                        <p className="text-white font-semibold">
                          {vehicle.color}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Type</p>
                        <p className="text-white font-semibold capitalize">
                          {vehicle.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteVehicle(vehicle._id)}
                    disabled={deletingId === vehicle._id}
                    className="ml-4 bg-red-600/30 hover:bg-red-600/50 disabled:bg-red-600/30 border border-red-500/50 text-red-300 p-3 rounded-lg transition"
                  >
                    <Trash2
                      size={18}
                      className={
                        deletingId === vehicle._id ? "animate-spin" : ""
                      }
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
