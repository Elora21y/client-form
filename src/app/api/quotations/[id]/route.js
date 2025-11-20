import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';
import { ObjectId } from 'mongodb';

// GET single quotation by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    console.log('id :' , params)
    const quotation = await Quotation.findById(id);
    
    if (!quotation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Quotation not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: quotation
    });
    
  } catch (error) {
    console.error('❌ Error fetching quotation:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch quotation' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update quotation by ID
export async function PUT(request, { params }) {
  try {
    console.log('📝 Received PUT request for update');
    
    await connectDB();
    console.log('✅ Database connected');
    
    const { id } = await params;
    const data = await request.json();
    
    console.log('📝 Updating quotation:', id);
    console.log('📝 New data:', data);
    
    // Validate required fields
    if (!data.clientName || !data.companyName || !data.address || !data.phone) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    // Validate services
    if (!data.services || data.services.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'At least one service is required' 
        },
        { status: 400 }
      );
    }
    
    // Update quotation
    const quotation = await Quotation.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!quotation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Quotation not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Quotation updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Quotation updated successfully! ✅',
      data: quotation
    });
    
  } catch (error) {
    console.error('❌ Error updating quotation:', error);
    
    // Handle duplicate quotation number
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'This quotation number already exists' 
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false,
          error: messages.join(', ') 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update quotation' 
      },
      { status: 500 }
    );
  }
}
