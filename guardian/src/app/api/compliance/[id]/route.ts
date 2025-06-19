import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Compliance from '@/models/Compliance';
import AuditLog from '@/models/AuditLog';

// GET /api/compliance/[id] - Get specific compliance framework
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

    const compliance = await Compliance.findById(params.id).lean();

    if (!compliance) {
      return NextResponse.json(
        { error: 'Compliance framework not found' },
        { status: 404 }
      );
    }

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'VIEW_COMPLIANCE_DETAIL',
      details: `Viewed compliance framework: ${typeof compliance === 'object' && compliance && 'name' in compliance ? (compliance as { name: string }).name : ''} (ID: ${params.id})`
    });

    return NextResponse.json(compliance);

  } catch (error) {
    console.error('Error fetching compliance:', error);
    let message = 'Failed to fetch compliance';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// PUT /api/compliance/[id] - Update specific compliance framework
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

    // Get the existing compliance to track changes
    const existingCompliance = await Compliance.findById(params.id);
    if (!existingCompliance) {
      return NextResponse.json(
        { error: 'Compliance framework not found' },
        { status: 404 }
      );
    }

    // Update the compliance
    const updatedCompliance = await Compliance.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    );

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'UPDATE_COMPLIANCE',
      details: `Updated compliance framework: ${updatedCompliance.name} (ID: ${params.id})`
    });

    return NextResponse.json(updatedCompliance);

  } catch (error) {
    console.error('Error updating compliance:', error);
    let message = 'Failed to update compliance';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE /api/compliance/[id] - Delete specific compliance framework
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

    // Get the compliance before deletion for audit log
    const compliance = await Compliance.findById(params.id);
    if (!compliance) {
      return NextResponse.json(
        { error: 'Compliance framework not found' },
        { status: 404 }
      );
    }

    // Delete the compliance
    await Compliance.findByIdAndDelete(params.id);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'DELETE_COMPLIANCE',
      details: `Deleted compliance framework: ${compliance.name} (ID: ${params.id})`
    });

    return NextResponse.json({ message: 'Compliance framework deleted successfully' });

  } catch (error) {
    console.error('Error deleting compliance:', error);
    let message = 'Failed to delete compliance';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
} 