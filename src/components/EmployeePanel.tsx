"use client";

import { useState, useEffect } from "react";

interface Employee {
  name: string;
  position: string;
  department: string;
  remainingLeaveDays: number;
  totalLeaveDays: number;
  hireDate: string;
  employeeId: string;
}

interface EmployeePanelProps {
  onEmployeeRefresh?: () => void;
  onEmployeeChange?: (employee: Employee) => void;
}

// Sample employee data for demonstration
const sampleEmployees: Employee[] = [
  {
    name: "Vũ Thị Hạnh",
    position: "Điều phối nhân sự",
    department: "Sản phẩm",
    remainingLeaveDays: 13,
    totalLeaveDays: 20,
    hireDate: "2020-01-21",
    employeeId: "EMP493",
  },
  {
    name: "Nguyễn Văn An",
    position: "Nhân viên phát triển",
    department: "Công nghệ",
    remainingLeaveDays: 8,
    totalLeaveDays: 20,
    hireDate: "2021-03-15",
    employeeId: "EMP124",
  },
  {
    name: "Trần Thị Bình",
    position: "Quản lý dự án",
    department: "Sản phẩm",
    remainingLeaveDays: 15,
    totalLeaveDays: 20,
    hireDate: "2019-08-10",
    employeeId: "EMP789",
  },
  {
    name: "Lê Văn Cường",
    position: "Nhân viên marketing",
    department: "Truyền thông",
    remainingLeaveDays: 12,
    totalLeaveDays: 20,
    hireDate: "2022-01-05",
    employeeId: "EMP456",
  },
  {
    name: "Phạm Thị Dung",
    position: "Kế toán trưởng",
    department: "Tài chính",
    remainingLeaveDays: 6,
    totalLeaveDays: 20,
    hireDate: "2018-11-20",
    employeeId: "EMP321",
  },
];

export default function EmployeePanel({
  onEmployeeRefresh,
  onEmployeeChange,
}: EmployeePanelProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set initial employee from sample data
    const initialEmployee = sampleEmployees[0];
    setEmployee(initialEmployee);

    // Notify parent component about the initial employee
    if (onEmployeeChange) {
      onEmployeeChange(initialEmployee);
    }
  }, [onEmployeeChange]);

  const randomizeEmployee = () => {
    setLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      // Pick a random employee from the sample data
      const randomIndex = Math.floor(Math.random() * sampleEmployees.length);
      const newEmployee = sampleEmployees[randomIndex];

      setEmployee(newEmployee);

      // Notify parent component about the new employee
      if (onEmployeeChange) {
        onEmployeeChange(newEmployee);
      }

      // Call the callback to refresh chat messages
      if (onEmployeeRefresh) {
        onEmployeeRefresh();
      }

      setLoading(false);
    }, 500);
  };

  if (!employee) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 min-h-0">
      <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2 flex-shrink-0">
        <h3 className="text-lg font-bold text-white">Employee Information</h3>
        <button
          onClick={randomizeEmployee}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Employee"
        >
          {loading ? (
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 space-y-3 min-h-0 overflow-y-auto">
        <div className="text-center pb-3 border-b border-slate-600 flex-shrink-0">
          {/* Avatar with initials */}
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">
                {employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
          </div>

          <h4 className="text-2xl font-bold text-blue-400 mb-1">
            {employee.name}
          </h4>
          <p className="text-base font-semibold text-slate-300">
            {employee.position}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-semibold text-slate-400">
              Department:
            </span>
            <span className="text-xs font-medium text-slate-200">
              {employee.department}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-semibold text-slate-400">
              Hire Date:
            </span>
            <span className="text-xs font-medium text-slate-200">
              {employee.hireDate}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-xs font-semibold text-slate-400">
              Employee ID:
            </span>
            <span className="text-xs font-medium text-slate-200 font-mono">
              {employee.employeeId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
