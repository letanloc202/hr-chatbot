import { NextResponse } from 'next/server';
import { readTextFile, writeJsonFile } from '@/lib/data';

export async function POST() {
  try {
    // Read the policy text
    const policyText = await readTextFile('policy.txt');
    
    // Simple chunking by paragraphs (since we're not doing embeddings)
    const paragraphs = policyText.split('\n\n').filter(p => p.trim().length > 0);
    
    // Create a simple index structure (without embeddings)
    const policyIndex = {
      model: 'simple-text-chunks',
      dim: 0,
      chunks: paragraphs.map((text, index) => ({
        id: `p${index + 1}`,
        text: text.trim(),
        embedding: [] // Empty since we're not using embeddings
      })),
      updatedAt: new Date().toISOString()
    };

    await writeJsonFile('policy.index.json', policyIndex);

    return NextResponse.json({ 
      message: 'Policy index updated successfully',
      chunksCount: policyIndex.chunks.length
    });
  } catch (error) {
    console.error('Policy re-embedding API error:', error);
    return NextResponse.json(
      { error: 'Failed to update policy index' },
      { status: 500 }
    );
  }
}
