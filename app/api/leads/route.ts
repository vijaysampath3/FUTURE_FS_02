import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getLeadModel } from '@/lib/lead-model'

export async function GET(req: Request) {
  try {
    const firebaseUID = req.headers.get('x-firebase-uid')
    if (!firebaseUID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const Lead = getLeadModel(firebaseUID)
    const leads = await Lead.find().sort({ createdAt: -1 })
    
    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error in GET /api/leads:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const firebaseUID = req.headers.get('x-firebase-uid')
    if (!firebaseUID) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    await connectDB()
    const Lead = getLeadModel(firebaseUID)
    const newLead = await Lead.create(body)
    
    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/leads:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
