"use client";

import { useState, useEffect } from "react";
import PolicyDialog from "./PolicyDialog";

interface Policy {
  id: string;
  title: string;
  description: string;
  color: string;
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

export default function PolicyPanel() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch("/api/policies");
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) {
      return;
    }

    try {
      const response = await fetch(`/api/policies?id=${policyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPolicies();
      }
    } catch (error) {
      console.error("Failed to delete policy:", error);
    }
  };

  const handleSavePolicy = async (policy: Policy) => {
    try {
      const url = "/api/policies";
      const method = dialogMode === "add" ? "POST" : "PUT";
      const body =
        dialogMode === "add" ? policy : { ...policy, id: editingPolicy?.id };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchPolicies();
      }
    } catch (error) {
      console.error("Failed to save policy:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4 min-h-0">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-600 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 min-h-0">
      <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2 flex-shrink-0">
        <h3 className="text-lg font-bold text-white">Company Policies</h3>
        <button
          onClick={handleAddPolicy}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Add Policy
        </button>
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
