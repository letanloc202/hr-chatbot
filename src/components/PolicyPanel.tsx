"use client";

import { useState } from "react";
import PolicyDialog from "./PolicyDialog";

interface Policy {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface PolicyPanelProps {
  policies: Policy[];
  onAddPolicy: (policy: Policy) => void;
  onEditPolicy: (policy: Policy) => void;
  onDeletePolicy: (policyId: string) => void;
  loading?: boolean;
}

const COLOR_CLASSES = {
  blue: "bg-slate-700 border-l-4 border-blue-400 text-blue-300",
  green: "bg-slate-700 border-l-4 border-green-400 text-green-300",
  purple: "bg-slate-700 border-l-4 border-purple-400 text-purple-300",
  orange: "bg-slate-700 border-l-4 border-orange-400 text-orange-300",
  indigo: "bg-slate-700 border-l-4 border-indigo-400 text-indigo-300",
  pink: "bg-slate-700 border-l-4 border-pink-400 text-pink-300",
  teal: "bg-slate-700 border-l-4 border-teal-400 text-teal-300",
  yellow: "bg-slate-700 border-l-4 border-yellow-400 text-yellow-300",
  red: "bg-slate-700 border-l-4 border-red-400 text-red-300",
  gray: "bg-slate-700 border-l-4 border-slate-400 text-slate-300",
};

export default function PolicyPanel({
  policies,
  onAddPolicy,
  onEditPolicy,
  onDeletePolicy,
  loading = false,
}: PolicyPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const handleAddPolicy = () => {
    setDialogMode("add");
    setEditingPolicy(null);
    setIsDialogOpen(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setDialogMode("edit");
    setEditingPolicy(policy);
    setIsDialogOpen(true);
  };

  const handleDeletePolicy = (policyId: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) {
      return;
    }
    onDeletePolicy(policyId);
  };

  const handleSavePolicy = (policy: Policy) => {
    if (dialogMode === "add") {
      onAddPolicy(policy);
    } else {
      onEditPolicy(policy);
    }
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4 min-h-0">
        <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2 flex-shrink-0">
          <h3 className="text-lg font-bold text-white">Company Policies</h3>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Đang tải chính sách...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 min-h-0">
      <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2 flex-shrink-0">
        <h3 className="text-lg font-bold text-white">Company Policies</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddPolicy}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Add Policy
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-300 space-y-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {policies.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p>No policies found.</p>
            <p className="text-xs mt-2">
              Click &quot;Add Policy&quot; to create your first policy.
            </p>
          </div>
        ) : (
          policies.map((policy) => (
            <div
              key={policy.id}
              className={`p-2 rounded-lg ${
                COLOR_CLASSES[policy.color as keyof typeof COLOR_CLASSES] ||
                COLOR_CLASSES.blue
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{policy.title}</p>
                  <p
                    className="text-slate-300 overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: "vertical",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {policy.description}
                  </p>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => handleEditPolicy(policy)}
                    className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PolicyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSavePolicy}
        policy={editingPolicy}
        mode={dialogMode}
      />
    </div>
  );
}
