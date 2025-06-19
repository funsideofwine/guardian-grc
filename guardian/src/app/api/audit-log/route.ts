import { NextRequest, NextResponse } from 'next/server';
import { connect } from '../../../lib/mongoose';
import AuditLog from '../../../models/AuditLog';

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return 'Unknown error';
}

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, action, details } = await req.json();
    await connect();
    await AuditLog.create({
      userId,
      userEmail,
      action,
      details,
      timestamp: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connect();
    const logs = await AuditLog.find().sort({ timestamp: -1 }).lean();
    return NextResponse.json({ logs });
  } catch (err: unknown) {
    return NextResponse.json({ logs: [], error: getErrorMessage(err) }, { status: 500 });
  }
} 