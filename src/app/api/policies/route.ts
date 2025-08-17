import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read the policies.json file from the data directory
    const dataPath = path.join(process.cwd(), "data", "policies.json");
    const policiesData = fs.readFileSync(dataPath, "utf8");
    const policies = JSON.parse(policiesData);

    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error reading policies:", error);
    return NextResponse.json(
      { error: "Failed to load policies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const newPolicy = await request.json();

    // Read current policies
    const dataPath = path.join(process.cwd(), "data", "policies.json");
    const policiesData = fs.readFileSync(dataPath, "utf8");
    const policies = JSON.parse(policiesData);

    // Add new policy
    policies.push(newPolicy);

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(policies, null, 2), "utf8");

    return NextResponse.json(newPolicy);
  } catch (error) {
    console.error("Error adding policy:", error);
    return NextResponse.json(
      { error: "Failed to add policy" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const updatedPolicy = await request.json();

    // Read current policies
    const dataPath = path.join(process.cwd(), "data", "policies.json");
    const policiesData = fs.readFileSync(dataPath, "utf8");
    const policies = JSON.parse(policiesData);

    // Find and update policy
    const index = policies.findIndex((p: any) => p.id === updatedPolicy.id);
    if (index !== -1) {
      policies[index] = updatedPolicy;

      // Write back to file
      fs.writeFileSync(dataPath, JSON.stringify(policies, null, 2), "utf8");

      return NextResponse.json(updatedPolicy);
    } else {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating policy:", error);
    return NextResponse.json(
      { error: "Failed to update policy" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Policy ID is required" },
        { status: 400 }
      );
    }

    // Read current policies
    const dataPath = path.join(process.cwd(), "data", "policies.json");
    const policiesData = fs.readFileSync(dataPath, "utf8");
    const policies = JSON.parse(policiesData);

    // Filter out the policy to delete
    const filteredPolicies = policies.filter((p: any) => p.id !== id);

    // Write back to file
    fs.writeFileSync(
      dataPath,
      JSON.stringify(filteredPolicies, null, 2),
      "utf8"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting policy:", error);
    return NextResponse.json(
      { error: "Failed to delete policy" },
      { status: 500 }
    );
  }
}
