// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Quotation from '@/lib/models/Quotation';

// // POST - Create new quotation
// export async function POST(request) {
//   try {
//     await connectDB();
    
//     const data = await request.json();
    
//     // Validate required fields
//     if (!data.clientName || !data.companyName || !data.address || !data.phone) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Create new quotation
//     const quotation = await Quotation.create(data);
    
//     return NextResponse.json(
//       { 
//         success: true, 
//         message: 'Quotation created successfully',
//         quotation 
//       },
//       { status: 201 }
//     );
    
//   } catch (error) {
//     console.error('Error creating quotation:', error);
    
//     // Handle duplicate quotation number
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { error: 'Quotation number already exists' },
//         { status: 409 }
//       );
//     }
    
//     return NextResponse.json(
//       { error: 'Failed to create quotation' },
//       { status: 500 }
//     );
//   }
// }

// // GET - Retrieve all quotations
// export async function GET(request) {
//   try {
//     await connectDB();
    
//     const { searchParams } = new URL(request.url);
//     const limit = parseInt(searchParams.get('limit')) || 50;
//     const skip = parseInt(searchParams.get('skip')) || 0;
    
//     const quotations = await Quotation.find()
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .skip(skip);
    
//     const total = await Quotation.countDocuments();
    
//     return NextResponse.json({
//       success: true,
//       data: quotations,
//       total,
//       limit,
//       skip
//     });
    
//   } catch (error) {
//     console.error('Error fetching quotations:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch quotations' },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';

// POST - Create new quotation
export async function POST(request) {
  try {
    console.log('📥 Received POST request');
    
    await connectDB();
    console.log('✅ Database connected');
    
    const data = await request.json();
    console.log('📝 Data received:', data);
    
    // Validate required fields
    if (!data.clientName || !data.companyName || !data.address || !data.phone) {
      console.log('❌ Validation failed - missing fields');
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields. Please fill all client information.' 
        },
        { status: 400 }
      );
    }

    // Validate services
    if (!data.services || data.services.length === 0) {
      console.log('❌ Validation failed - no services');
      return NextResponse.json(
        { 
          success: false,
          error: 'At least one service is required' 
        },
        { status: 400 }
      );
    }

    console.log('💾 Attempting to save to database...');
    
    // Create new quotation
    const quotation = await Quotation.create(data);
    
    console.log('✅ Quotation saved successfully:', quotation._id);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Quotation created successfully! ✅',
        data: quotation 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('❌ Error creating quotation:', error);
    console.error('Error details:', error.message);
    
    // Handle duplicate quotation number
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'This quotation number already exists. Please refresh the page.' 
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
        error: `Failed to create quotation: ${error.message}` 
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve all quotations with SEARCH
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const skip = parseInt(searchParams.get('skip')) || 0;
    const search = searchParams.get('search') || '';
    
    // Build search query
    let query = {};
    
    if (search && search.trim()) {
      query = {
        $or: [
          { clientName: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { quotationNo: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    console.log('🔍 Search query:', query);
    
    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    
    const total = await Quotation.countDocuments(query);
    
    console.log(`✅ Found ${quotations.length} quotations`);
    
    return NextResponse.json({
      success: true,
      data: quotations,
      total,
      limit,
      skip,
      hasMore: (skip + limit) < total
    });
    
  } catch (error) {
    console.error('❌ Error fetching quotations:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch quotations' 
      },
      { status: 500 }
    );
  }
}