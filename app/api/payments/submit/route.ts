import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createPayment } from '@/lib/payments'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const orderId = parseInt(formData.get('orderId') as string)
    const mtcn_no = formData.get('mtcn_no') as string
    const sender_name = formData.get('sender_name') as string
    const transaction_date = formData.get('transaction_date') as string
    const amount = parseFloat(formData.get('amount') as string)
    const payment_proof = formData.get('payment_proof') as File | null

    if (!orderId || !mtcn_no || !sender_name || !transaction_date || !amount) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    let payment_proof_url: string | undefined = undefined

    // Handle file upload if provided
    if (payment_proof && payment_proof.size > 0) {
      const bytes = await payment_proof.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (e) {
        // Directory might already exist
      }

      const fileName = `payment_${orderId}_${Date.now()}_${payment_proof.name}`
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)
      
      payment_proof_url = `/uploads/payments/${fileName}`
    }

    const payment = await createPayment({
      order_id: orderId,
      mtcn_no,
      sender_name,
      transaction_date,
      amount,
      payment_proof_url,
      status: 'pending'
    })

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

