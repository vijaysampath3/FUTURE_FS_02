import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getLeadModel } from '@/lib/lead-model'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const firebaseUID = req.headers.get('x-firebase-uid')
    if (!firebaseUID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id } = await params
    
    await connectDB()
    const Lead = getLeadModel(firebaseUID)
    
    // We can update status or push a new note onto the notes array
    let updateQuery: any;

    if (body.pushNote) {
      // Use $push to append the new note — existing notes are never touched
      updateQuery = { $push: { notes: { $each: [body.pushNote], $position: 0 } } };
    } else {
      updateQuery = { ...body };
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, updateQuery, { returnDocument: 'after' })
    
    if (!updatedLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Error in PATCH /api/leads/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const firebaseUID = req.headers.get('x-firebase-uid')
    if (!firebaseUID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    await connectDB()
    const Lead = getLeadModel(firebaseUID)
    const deletedLead = await Lead.findByIdAndDelete(id)
    
    if (!deletedLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/leads/[id]:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
