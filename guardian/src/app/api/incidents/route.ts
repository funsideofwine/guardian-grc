import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Incident from '@/models/Incident';
import AuditLog from '@/models/AuditLog';

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return 'Unknown error';
}

// GET /api/incidents - List incidents with filtering and pagination
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
    const sortBy = searchParams.get('sortBy') || 'detectedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const priority = searchParams.get('priority');
    const owner = searchParams.get('owner');
    const search = searchParams.get('search');

    // Build filter object
    const filter: Record<string, unknown> = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;
    if (owner) filter['owner.userId'] = owner;
    
    if (search) {
      filter.$or = [
        { incidentNumber: { $regex: search, $options: 'i' } },
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
    const incidents = await Incident.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Incident.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'VIEW_INCIDENTS',
      details: `Viewed incidents page ${page} with filters: ${JSON.stringify(filter)}`
    });

    return NextResponse.json({
      incidents,
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
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create new incident
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.category || !body.severity) {
      return NextResponse.json(
        { error: 'Title, description, category, and severity are required' },
        { status: 400 }
      );
    }

    // Set default values
    const incidentData = {
      ...body,
      detectedAt: body.detectedAt || new Date(),
      reportedAt: body.reportedAt || new Date(),
      reporter: {
        userId,
        userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown'
      },
      owner: {
        userId: body.owner?.userId || userId,
        userEmail: body.owner?.userEmail || user?.emailAddresses[0]?.emailAddress || 'unknown'
      }
    };

    const incident = await Incident.create(incidentData);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'CREATE_INCIDENT',
      details: `Created incident: ${incident.incidentNumber} - ${incident.title}`
    });

    return NextResponse.json(incident, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating incident:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// PUT /api/incidents - Update incident (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { incidentId, updates } = body;

    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    // Get the incident to track changes
    const existingIncident = await Incident.findById(incidentId);
    if (!existingIncident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Update the incident
    const updatedIncident = await Incident.findByIdAndUpdate(
      incidentId,
      { ...updates },
      { new: true, runValidators: true }
    );

    // Log audit trail with change details
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'UPDATE_INCIDENT',
      details: `Updated incident: ${updatedIncident.incidentNumber} - ${updatedIncident.title}`
    });

    return NextResponse.json(updatedIncident);

  } catch (error: unknown) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/incidents - Delete incident
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get('id');

    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      );
    }

    // Get the incident before deletion for audit log
    const incident = await Incident.findById(incidentId);
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    // Delete the incident
    await Incident.findByIdAndDelete(incidentId);

    // Log audit trail
    await AuditLog.create({
      userId,
      userEmail: user?.emailAddresses[0]?.emailAddress || 'unknown',
      action: 'DELETE_INCIDENT',
      details: `Deleted incident: ${incident.incidentNumber} - ${incident.title}`
    });

    return NextResponse.json({ message: 'Incident deleted successfully' });

  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 }
    );
  }
} 