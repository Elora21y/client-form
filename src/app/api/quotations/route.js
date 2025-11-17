import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';

// POST - Create new quotation
export async function POST(request) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.clientName || !data.companyName || !data.address || !data.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new quotation
    const quotation = await Quotation.create(data);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Quotation created successfully',
        quotation 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating quotation:', error);
    
    // Handle duplicate quotation number
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Quotation number already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create quotation' },
      { status: 500 }
    );
  }
}

// GET - Retrieve all quotations
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = parseInt(searchParams.get('skip')) || 0;
    
    const quotations = await Quotation.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Quotation.countDocuments();
    
    return NextResponse.json({
      success: true,
      data: quotations,
      total,
      limit,
      skip
    });
    
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotations' },
      { status: 500 }
    );
  }
}