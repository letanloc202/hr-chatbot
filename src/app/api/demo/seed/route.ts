import { NextResponse } from "next/server";
import { writeJsonFile, Employee } from "@/lib/data";

const names = [
  "Nguyễn Văn An",
  "Trần Thị Bích",
  "Lê Minh Tuấn",
  "Phạm Thùy Dương",
  "Hoàng Văn Nam",
  "Vũ Thị Hạnh",
  "Đặng Quốc Toàn",
  "Bùi Thị Lan",
  "Phan Văn Hùng",
  "Đỗ Thị Mai",
];

const positions = [
  "Kỹ sư phần mềm",
  "Quản lý sản phẩm",
  "Nhà thiết kế",
  "Chuyên viên marketing",
  "Nhân viên kinh doanh",
  "Điều phối nhân sự",
  "Chuyên viên tài chính",
  "Quản lý vận hành",
];

const departments = [
  "Kỹ thuật",
  "Sản phẩm",
  "Thiết kế",
  "Marketing",
  "Kinh doanh",
  "Nhân sự",
  "Tài chính",
  "Vận hành",
];

export async function POST() {
  try {
    // Generate random employee data
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPosition =
      positions[Math.floor(Math.random() * positions.length)];
    const randomDepartment =
      departments[Math.floor(Math.random() * departments.length)];
    const randomLeaveDays = Math.floor(Math.random() * 20) + 5; // 5-25 days
    const randomHireDate = new Date(
      2020 + Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    const employee: Employee = {
      name: randomName,
      position: randomPosition,
      department: randomDepartment,
      remainingLeaveDays: randomLeaveDays,
      totalLeaveDays: 20,
      hireDate: randomHireDate.toISOString().split("T")[0],
      employeeId: `EMP${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
    };

    await writeJsonFile("employee.json", employee);

    return NextResponse.json({
      message: "Employee data randomized successfully",
      employee,
    });
  } catch (error) {
    console.error("Demo seed API error:", error);
    return NextResponse.json(
      { error: "Failed to randomize employee data" },
      { status: 500 }
    );
  }
}
