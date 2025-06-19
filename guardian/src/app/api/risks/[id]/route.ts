import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Risk from '@/models/Risk';
import AuditLog from '@/models/AuditLog';

// GET /api/risks/[id] - Get specific risk
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const risk = await Risk.findById(params.id).lean();

    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'VIEW_RISK',
      details: `Viewed risk: ${typeof risk === 'object' && risk && 'title' in risk ? (risk as unknown as { title: string }).title : ''} (ID: ${params.id})`
    });

    return NextResponse.json(risk);

  } catch (error) {
    console.error('Error fetching risk:', error);
    let message = 'Unknown error';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// PUT /api/risks/[id] - Update specific risk
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Get the existing risk to track changes
    const existingRisk = await Risk.findById(params.id);
    if (!existingRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    // Update the risk
    const updatedRisk = await Risk.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'UPDATE_RISK',
      details: `Updated risk: ${updatedRisk.title} (ID: ${params.id})`
    });

    return NextResponse.json(updatedRisk);

  } catch (error) {
    console.error('Error updating risk:', error);
    let message = 'Unknown error';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/risks/[id] - Delete specific risk
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the risk before deletion for audit log
    const risk = await Risk.findById(params.id);
    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    // Delete the risk
    await Risk.findByIdAndDelete(params.id);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'DELETE_RISK',
      details: `Deleted risk: ${risk.title} (ID: ${params.id})`
    });

    return NextResponse.json({ message: 'Risk deleted successfully' });

  } catch (error) {
    console.error('Error deleting risk:', error);
    let message = 'Unknown error';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 