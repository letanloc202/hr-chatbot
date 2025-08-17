"use client";

import { useState, useEffect, useCallback } from "react";
import EmployeePanel from "@/components/EmployeePanel";
import PolicyPanel from "@/components/PolicyPanel";
import ChatWindow from "@/components/ChatWindow";

interface Policy {
  id: string;
  title: string;
  description: string;
  color: string;
}

interface Employee {
  name: string;
  position: string;
  department: string;
  remainingLeaveDays: number;
  totalLeaveDays: number;
  hireDate: string;
  employeeId: string;
}

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [userInfo, setUserInfo] = useState<string>("");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [chatRefreshKey, setChatRefreshKey] = useState<number>(0);

  const refreshChatMessages = useCallback(() => {
    setChatRefreshKey((prev) => prev + 1);
  }, []);

  const handleEmployeeChange = useCallback(
    (employee: Employee) => {
      setCurrentEmployee(employee);
      const userInfoString = `Employee: ${employee.name} (${employee.position}) - Department: ${employee.department} - Hire Date: ${employee.hireDate}`;
      setUserInfo(userInfoString);
      refreshChatMessages();
    },
    [refreshChatMessages]
  );

  // Load default policies from API
  useEffect(() => {
    const loadDefaultPolicies = async () => {
      setPoliciesLoading(true);
      try {
        const response = await fetch("/api/policies");
        if (response.ok) {
          const defaultPolicies = await response.json();
          setPolicies(defaultPolicies);
        } else {
          console.error("Failed to load policies from API");
          setPolicies([]);
        }
      } catch (error) {
        console.error("Failed to load default policies:", error);
        setPolicies([]);
      } finally {
        setPoliciesLoading(false);
      }
    };

    loadDefaultPolicies();
  }, []);

  const handleAddPolicy = async (policy: Policy) => {
    const newPolicy = {
      ...policy,
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPolicy),
      });

      if (response.ok) {
        setPolicies((prev) => [...prev, newPolicy]);
      } else {
        console.error("Failed to save policy");
      }
    } catch (error) {
      console.error("Error saving policy:", error);
    }
  };

  const handleEditPolicy = async (policy: Policy) => {
    try {
      const response = await fetch("/api/policies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(policy),
      });

      if (response.ok) {
        setPolicies((prev) =>
          prev.map((p) => (p.id === policy.id ? policy : p))
        );
      } else {
        console.error("Failed to update policy");
      }
    } catch (error) {
      console.error("Error updating policy:", error);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/policies?id=${policyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPolicies((prev) => prev.filter((p) => p.id !== policyId));
      } else {
        console.error("Failed to delete policy");
      }
    } catch (error) {
      console.error("Error deleting policy:", error);
    }
  };

  return (
    <div className="h-screen bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="h-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Left Column - Employee Info & Company Policy */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0">
            {/* Employee Info Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 min-h-0 flex-1">
              <EmployeePanel
                onEmployeeRefresh={refreshChatMessages}
                onEmployeeChange={handleEmployeeChange}
              />
            </div>

            {/* Company Policy Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 min-h-0 flex-1">
              <PolicyPanel
                policies={policies}
                onAddPolicy={handleAddPolicy}
                onEditPolicy={handleEditPolicy}
                onDeletePolicy={handleDeletePolicy}
                loading={policiesLoading}
              />
            </div>
          </div>

          {/* Right Column - Chat (Wider) */}
          <div className="lg:col-span-3 h-full min-h-0">
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 h-full min-h-0">
              <ChatWindow
                key={`${currentEmployee?.employeeId}-${chatRefreshKey}`}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                userInfo={userInfo}
                policies={policies}
                employee={currentEmployee}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
