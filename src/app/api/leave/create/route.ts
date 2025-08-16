import { NextRequest, NextResponse } from "next/server";
import { appendToJsonFile, readJsonFile, LeaveCase, Employee } from "@/lib/data";
import { z } from "zod";

const createLeaveRequestSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().positive(),
  type: z.literal("annual"),
  note: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, days, type, note } =
      createLeaveRequestSchema.parse(body);

    // Read employee data to get employee ID
    const employee = await readJsonFile<Employee>("employee.json");

    const leaveCase: LeaveCase = {
      id: `leave_${Date.now()}`,
      startDate,
      endDate,
      days,
      type,
      note,
      status: "created",
      createdAt: new Date().toISOString(),
      employeeId: employee.employeeId,
    };

    // Append to leave cases
    await appendToJsonFile("leave_cases.json", leaveCase);

    return NextResponse.json({
      id: leaveCase.id,
      message: "Leave case created successfully",
    });
  } catch (error) {
    console.error("Leave create API error:", error);
    return NextResponse.json(
      { error: "Failed to create leave case" },
      { status: 500 }
    );
  }
}
