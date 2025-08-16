"use client";

import { useState, useEffect } from "react";
import EmployeePanel from "@/components/EmployeePanel";
import PolicyPanel from "@/components/PolicyPanel";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [userInfo, setUserInfo] = useState<string>("");

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/demo/employee");
        if (response.ok) {
          const data = await response.json();
          const employee = data.employee;
          const userInfoString = `Employee: ${employee.name} (${employee.position}) - Department: ${employee.department} - Leave Balance: ${employee.remainingLeaveDays}/${employee.totalLeaveDays} days - Hire Date: ${employee.hireDate}`;
          setUserInfo(userInfoString);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="h-screen bg-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="h-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Left Column - Employee Info & Company Policy */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0">
            {/* Employee Info Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 min-h-0 flex-1">
              <EmployeePanel />
            </div>

            {/* Company Policy Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 min-h-0 flex-1">
              <PolicyPanel />
            </div>
          </div>

          {/* Right Column - Chat (Wider) */}
          <div className="lg:col-span-3 h-full min-h-0">
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 h-full min-h-0">
              <ChatWindow
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                userInfo={userInfo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
