"use client";

import { useState, useEffect } from "react";

interface Policy {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface PolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (policy: Policy) => void;
  policy?: Policy | null;
  mode: "add" | "edit";
}

const COLOR_OPTIONS = [
  {
    value: "blue",
    label: "Blue",
    class: "bg-blue-500",
  },
  {
    value: "green",
    label: "Green",
    class: "bg-green-500",
  },
  {
    value: "purple",
    label: "Purple",
    class: "bg-purple-500",
  },
  {
    value: "orange",
    label: "Orange",
    class: "bg-orange-500",
  },
  {
    value: "indigo",
    label: "Indigo",
    class: "bg-indigo-500",
  },
  {
    value: "pink",
    label: "Pink",
    class: "bg-pink-500",
  },
  {
    value: "teal",
    label: "Teal",
    class: "bg-teal-500",
  },
  {
    value: "yellow",
    label: "Yellow",
    class: "bg-yellow-500",
  },
  {
    value: "red",
    label: "Red",
    class: "bg-red-500",
  },
  {
    value: "gray",
    label: "Gray",
    class: "bg-gray-500",
  },
];

export default function PolicyDialog({
  isOpen,
  onClose,
  onSave,
  policy,
  mode,
}: PolicyDialogProps) {
  const [formData, setFormData] = useState<Policy>({
    id: "",
    title: "",
    description: "",
    color: "blue",
  });

  useEffect(() => {
    if (policy && mode === "edit") {
      setFormData(policy);
    } else {
      setFormData({
        id: "",
        title: "",
        description: "",
        color: "blue",
      });
    }
  }, [policy, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    const policyToSave = {
      ...formData,
      id:
        mode === "add"
          ? `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          : formData.id,
    };

    onSave(policyToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            {mode === "add" ? "Add New Policy" : "Edit Policy"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Policy Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Annual Leave"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="e.g., 20 days per year, must submit 3 business days in advance"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    className={`p-2 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? "border-white ring-2 ring-blue-500"
                        : "border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded ${color.class}`}></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === "add" ? "Add Policy" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
