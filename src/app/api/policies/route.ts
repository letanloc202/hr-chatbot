import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/data";
import { z } from "zod";

interface Policy {
  id: string;
  title: string;
  description: string;
  color: string;
}

const policySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  color: z.string().min(1),
});

// GET - Fetch all policies
export async function GET() {
  try {
    const policies = await readJsonFile<Policy[]>("policies.json");
    return NextResponse.json({ policies });
  } catch {
    // If file doesn't exist, return empty array
    return NextResponse.json({ policies: [] });
  }
}

// POST - Create new policy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const policyData = policySchema.parse(body);

    const policies = await readJsonFile<Policy[]>("policies.json").catch(
      () => []
    );

    const newPolicy: Policy = {
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: policyData.title,
      description: policyData.description,
      color: policyData.color,
    };

    policies.push(newPolicy);
    await writeJsonFile("policies.json", policies);

    return NextResponse.json({ policy: newPolicy });
  } catch (error) {
    console.error("Failed to create policy:", error);
    return NextResponse.json(
      { error: "Failed to create policy" },
      { status: 500 }
    );
  }
}

// PUT - Update existing policy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...policyData } = policySchema.parse(body);

    if (!id) {
      return NextResponse.json(
        { error: "Policy ID is required" },
        { status: 400 }
      );
    }

    const policies = await readJsonFile<Policy[]>("policies.json");
    const policyIndex = policies.findIndex((p) => p.id === id);

    if (policyIndex === -1) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    policies[policyIndex] = {
      ...policies[policyIndex],
      ...policyData,
    };

    await writeJsonFile("policies.json", policies);

    return NextResponse.json({ policy: policies[policyIndex] });
  } catch (error) {
    console.error("Failed to update policy:", error);
    return NextResponse.json(
      { error: "Failed to update policy" },
      { status: 500 }
    );
  }
}

// DELETE - Delete policy
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Policy ID is required" },
        { status: 400 }
      );
    }

    const policies = await readJsonFile<Policy[]>("policies.json");
    const filteredPolicies = policies.filter((p) => p.id !== id);

    if (filteredPolicies.length === policies.length) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    await writeJsonFile("policies.json", filteredPolicies);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete policy:", error);
    return NextResponse.json(
      { error: "Failed to delete policy" },
      { status: 500 }
    );
  }
}
