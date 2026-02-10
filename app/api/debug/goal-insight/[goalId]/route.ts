import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const { goalId } = await params

  try {
    const insight = await prisma.goalInsight.findUnique({
      where: { goalId },
    })

    return NextResponse.json({
      data: insight,
      debug: {
        exists: !!insight,
        status: insight?.status,
        hasAnalysis: !!insight?.analysis,
        hasSuggestions: !!insight?.suggestions,
        errorMessage: insight?.errorMessage,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch insight',
      },
      { status: 500 }
    )
  }
}
