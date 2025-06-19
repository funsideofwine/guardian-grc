import { NextRequest, NextResponse } from 'next/server';
import { connect } from '../../../lib/mongoose';
import Policy from '../../../models/Policy';

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return 'Unknown error';
}

export async function GET() {
  try {
    await connect();
    const policies = await Policy.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ policies });
  } catch (err: unknown) {
    return NextResponse.json({ policies: [], error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    const policy = await Policy.create({
      ...body,
      state: 'Draft',
    });
    return NextResponse.json({ success: true, policy });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    const { id, ...update } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing policy id' }, { status: 400 });
    // Handle comments
    if (update.comment) {
      await Policy.findByIdAndUpdate(id, {
        $push: { comments: { text: update.comment, userId: update.userId, userEmail: update.userEmail } },
      });
    } else if (update.commentId && update.deleteComment) {
      await Policy.findByIdAndUpdate(id, {
        $pull: { comments: { _id: update.commentId } },
      });
    } else if (update.commentId && update.comment) {
      await Policy.updateOne({ _id: id, 'comments._id': update.commentId }, {
        $set: { 'comments.$.text': update.comment },
      });
    } else {
      // General update (state, fields, attachments)
      await Policy.findByIdAndUpdate(id, update);
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ success: false, error: 'Missing policy id' }, { status: 400 });
    await Policy.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(err) }, { status: 500 });
  }
} 