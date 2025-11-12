import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createPayment } from '@/lib/payments'
import { getOrderById } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const orderId = parseInt(formData.get('orderId') as string)
    const payment_method = (formData.get('payment_method') as string) || 'wise'
    const transaction_id = formData.get('transaction_id') as string
    const sender_name = formData.get('sender_name') as string
    const transaction_date = formData.get('transaction_date') as string
    const amount = parseFloat(formData.get('amount') as string)
    const payment_proof = formData.get('payment_proof') as File | null
    
    // Western Union specific fields
    const payer_first_name = formData.get('payer_first_name') as string
    const payer_last_name = formData.get('payer_last_name') as string
    const payer_phone = formData.get('payer_phone') as string
    const payer_address = formData.get('payer_address') as string
    const payer_city = formData.get('payer_city') as string
    const payer_country = formData.get('payer_country') as string

    if (!orderId || amount === null || amount === undefined || isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: 'Valid order ID and amount are required' }, { status: 400 })
    }
    
    // Validate based on payment method
    if (payment_method === 'wise' || payment_method === 'western_union') {
      if (!transaction_id || !sender_name || !transaction_date) {
        return NextResponse.json({ error: 'Transaction ID, sender name, and transaction date are required' }, { status: 400 })
      }
    }
    
    if (payment_method === 'western_union') {
      if (!payer_first_name || !payer_last_name || !payer_phone || !payer_address || !payer_city || !payer_country) {
        return NextResponse.json({ error: 'All payer details are required for Western Union' }, { status: 400 })
      }
    }

    let payment_proof_url: string | undefined = undefined

    // Handle file upload if provided
    if (payment_proof && payment_proof.size > 0) {
      // Validate file type - only PDF allowed
      const fileType = payment_proof.type
      const fileName = payment_proof.name.toLowerCase()
      
      if (fileType !== 'application/pdf' && !fileName.endsWith('.pdf')) {
        return NextResponse.json({ 
          error: 'Only PDF files are accepted for payment receipts' 
        }, { status: 400 })
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (payment_proof.size > maxSize) {
        return NextResponse.json({ 
          error: 'File size must be less than 10MB' 
        }, { status: 400 })
      }

      const bytes = await payment_proof.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (e) {
        // Directory might already exist
      }

      const safeFileName = `payment_${orderId}_${Date.now()}_${payment_proof.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = join(uploadsDir, safeFileName)
      await writeFile(filePath, buffer)
      
      payment_proof_url = `/uploads/payments/${safeFileName}`
    }

    const paymentData: any = {
      order_id: orderId,
      payment_method: payment_method,
      amount,
      status: 'pending'
    }
    
    // Add fields based on payment method
    if (payment_method === 'wise' || payment_method === 'western_union') {
      paymentData.mtcn_no = transaction_id
      paymentData.sender_name = sender_name
      paymentData.transaction_date = transaction_date
    }
    
    if (payment_method === 'western_union') {
      paymentData.payer_first_name = payer_first_name
      paymentData.payer_last_name = payer_last_name
      paymentData.payer_phone = payer_phone
      paymentData.payer_address = payer_address
      paymentData.payer_city = payer_city
      paymentData.payer_country = payer_country
    }
    
    if (payment_proof_url) {
      paymentData.payment_proof_url = payment_proof_url
    }

    const payment = await createPayment(paymentData)

    return NextResponse.json({ 
      success: true,
      paymentId: payment.id 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Submit payment error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to submit payment' 
    }, { status: 500 })
  }
}

