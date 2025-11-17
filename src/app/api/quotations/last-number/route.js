import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';

export async function GET() {
  try {
    await connectDB();
    
    // Get the last quotation
    const lastQuotation = await Quotation.findOne()
      .sort({ createdAt: -1 })
      .select('quotationNo');
    
    if (!lastQuotation) {
      return NextResponse.json({ lastNumber: 115 }); // Starting number
    }
    
    // Extract number from "KBN-OT-116"
    const match = lastQuotation.quotationNo.match(/\d+$/);
    const lastNumber = match ? parseInt(match[0]) : 115;
    
    return NextResponse.json({ lastNumber });
    
  } catch (error) {
    console.error('Error getting last quotation number:', error);
    return NextResponse.json(
      { error: 'Failed to get last quotation number' },
      { status: 500 }
    );
  }
}