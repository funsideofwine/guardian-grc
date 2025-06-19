import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Risk from '@/models/Risk';
import AuditLog from '@/models/AuditLog';

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return 'Unknown error';
}

// GET /api/risks - List risks with filtering and pagination
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
    const priority = searchParams.get('priority');
    const owner = searchParams.get('owner');
    const search = searchParams.get('search');

    // Build filter object
    const filter: Record<string, unknown> = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (owner) filter['owner.userId'] = owner;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, unknown> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const risks = await Risk.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Risk.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'VIEW_RISKS',
      details: `Viewed risks page ${page} with filters: ${JSON.stringify(filter)}`
    });

    return NextResponse.json({
      risks,
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
    console.error('Error fetching risks:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST /api/risks - Create new risk
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Create risk with owner information
    const riskData = {
      ...body,
      owner: {
        userId,
        userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown'
      }
    };

    const risk = await Risk.create(riskData);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'CREATE_RISK',
      details: `Created risk: ${risk.title} (ID: ${risk._id})`
    });

    return NextResponse.json(risk, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating risk:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// PUT /api/risks - Update risk (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { riskId, updates } = body;

    if (!riskId) {
      return NextResponse.json(
        { error: 'Risk ID is required' },
        { status: 400 }
      );
    }

    // Get the risk to track changes
    const existingRisk = await Risk.findById(riskId);
    if (!existingRisk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    // Update the risk
    const updatedRisk = await Risk.findByIdAndUpdate(
      riskId,
      { ...updates },
      { new: true, runValidators: true }
    );

    // Log audit trail with change details
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'UPDATE_RISK',
      details: `Updated risk: ${updatedRisk.title} (ID: ${riskId})`
    });

    return NextResponse.json(updatedRisk);

  } catch (error: unknown) {
    console.error('Error updating risk:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/risks - Delete risk
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const riskId = searchParams.get('id');

    if (!riskId) {
      return NextResponse.json(
        { error: 'Risk ID is required' },
        { status: 400 }
      );
    }

    // Get the risk before deletion for audit log
    const risk = await Risk.findById(riskId);
    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      );
    }

    // Delete the risk
    await Risk.findByIdAndDelete(riskId);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'DELETE_RISK',
      details: `Deleted risk: ${risk.title} (ID: ${riskId})`
    });

    return NextResponse.json({ message: 'Risk deleted successfully' });

  } catch (error) {
    console.error('Error deleting risk:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    );
  }
} 