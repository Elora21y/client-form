import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';

export async function GET() {
  try {
    console.log('🔍 Fetching last quotation number...');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Get the last quotation
    const lastQuotation = await Quotation.findOne()
      .sort({ createdAt: -1 })
      .select('quotationNo')
      .lean();
    
    console.log('📄 Last quotation found:', lastQuotation);
    
    if (!lastQuotation) {
      console.log('ℹ️ No quotations found, starting from 115');
      return NextResponse.json({ 
        success: true,
        lastNumber: 115 // Starting number
      });
    }
    
    // Extract number from "KBN-OT-116"
    const match = lastQuotation.quotationNo.match(/\d+$/);
    const lastNumber = match ? parseInt(match[0]) : 115;
    
    console.log('🔢 Last number extracted:', lastNumber);
    
    return NextResponse.json({ 
      success: true,
      lastNumber 
    });
    
  } catch (error) {
    console.error('❌ Error getting last quotation number:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get last quotation number',
        lastNumber: 115 // Fallback
      },
      { status: 500 }
    );
  }
}