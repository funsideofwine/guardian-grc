import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Compliance from '@/models/Compliance';
import AuditLog from '@/models/AuditLog';

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return 'Unknown error';
}

// GET /api/compliance - List compliance frameworks with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const complianceLevel = searchParams.get('complianceLevel');
    const owner = searchParams.get('owner');
    const search = searchParams.get('search');

    // Build filter object
    const filter: Record<string, unknown> = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (complianceLevel) filter.complianceLevel = complianceLevel;
    if (owner) filter['owner.userId'] = owner;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { authority: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, unknown> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const compliance = await Compliance.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Compliance.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'VIEW_COMPLIANCE',
      details: `Viewed compliance page ${page} with filters: ${JSON.stringify(filter)}`
    });

    return NextResponse.json({
      compliance,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching compliance:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST /api/compliance - Create new compliance framework
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type || !body.category) {
      return NextResponse.json(
        { error: 'Name, type, and category are required' },
        { status: 400 }
      );
    }

    // Create compliance with owner information
    const complianceData = {
      ...body,
      owner: {
        userId,
        userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown'
      }
    };

    const compliance = await Compliance.create(complianceData);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'CREATE_COMPLIANCE',
      details: `Created compliance framework: ${compliance.name} (ID: ${compliance._id})`
    });

    return NextResponse.json(compliance, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating compliance:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// PUT /api/compliance - Update compliance framework (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { complianceId, updates } = body;

    if (!complianceId) {
      return NextResponse.json(
        { error: 'Compliance ID is required' },
        { status: 400 }
      );
    }

    // Get the compliance to track changes
    const existingCompliance = await Compliance.findById(complianceId);
    if (!existingCompliance) {
      return NextResponse.json(
        { error: 'Compliance framework not found' },
        { status: 404 }
      );
    }

    // Update the compliance
    const updatedCompliance = await Compliance.findByIdAndUpdate(
      complianceId,
      { ...updates },
      { new: true, runValidators: true }
    );

    // Log audit trail with change details
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'UPDATE_COMPLIANCE',
      details: `Updated compliance framework: ${updatedCompliance.name} (ID: ${complianceId})`
    });

    return NextResponse.json(updatedCompliance);

  } catch (error: unknown) {
    console.error('Error updating compliance:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/compliance - Delete compliance framework
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const complianceId = searchParams.get('id');

    if (!complianceId) {
      return NextResponse.json(
        { error: 'Compliance ID is required' },
        { status: 400 }
      );
    }

    // Get the compliance before deletion for audit log
    const compliance = await Compliance.findById(complianceId);
    if (!compliance) {
      return NextResponse.json(
        { error: 'Compliance framework not found' },
        { status: 404 }
      );
    }

    // Delete the compliance
    await Compliance.findByIdAndDelete(complianceId);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'DELETE_COMPLIANCE',
      details: `Deleted compliance framework: ${compliance.name} (ID: ${complianceId})`
    });

    return NextResponse.json({ message: 'Compliance framework deleted successfully' });

  } catch (error) {
    console.error('Error deleting compliance:', error);
    return NextResponse.json(
      { error: 'Failed to delete compliance' },
      { status: 500 }
    );
  }
} 