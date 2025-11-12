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
    const transaction_datetime = formData.get('transaction_datetime') as string
    const amount = parseFloat(formData.get('amount') as string)
    const payment_proof = formData.get('payment_proof') as File | null
    const receipt = formData.get('receipt') as File | null // For Promptpay
    
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

    if (payment_method === 'promptpay') {
      if (!transaction_id || !transaction_datetime || !amount || !receipt) {
        return NextResponse.json({ error: 'Transaction ID, date/time, amount, and receipt are required for Promptpay' }, { status: 400 })
      }
    }

    let payment_proof_url: string | undefined = undefined
    const fileToUpload = payment_method === 'promptpay' ? receipt : payment_proof

    // Handle file upload if provided
    if (fileToUpload && fileToUpload.size > 0) {
      // Validate file type - PDF or images allowed for Promptpay, only PDF for others
      const fileType = fileToUpload.type
      const fileName = fileToUpload.name.toLowerCase()
      
      if (payment_method === 'promptpay') {
        // Allow images and PDF for Promptpay
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
        if (!allowedTypes.includes(fileType) && !allowedExtensions.some(ext => fileName.endsWith(ext))) {
          return NextResponse.json({ 
            error: 'Only JPG, PNG, GIF, or PDF files are accepted for payment receipts' 
          }, { status: 400 })
        }
      } else {
        // Only PDF for other payment methods
        if (fileType !== 'application/pdf' && !fileName.endsWith('.pdf')) {
          return NextResponse.json({ 
            error: 'Only PDF files are accepted for payment receipts' 
          }, { status: 400 })
        }
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (fileToUpload.size > maxSize) {
        return NextResponse.json({ 
          error: 'File size must be less than 10MB' 
        }, { status: 400 })
      }

      const bytes = await fileToUpload.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments')
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (e) {
        // Directory might already exist
      }

      const safeFileName = `payment_${orderId}_${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
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

    if (payment_method === 'promptpay') {
      paymentData.mtcn_no = transaction_id
      paymentData.transaction_date = transaction_datetime
    }
    
    if (payment_proof_url) {
      paymentData.payment_proof_url = payment_proof_url
    }

    const payment = await createPayment(paymentData)

    // Send Discord webhook for Promptpay payments
    if (payment_method === 'promptpay' && payment_proof_url) {
      try {
        await sendPromptpayDiscordWebhook(orderId, payment_proof_url, transaction_id, transaction_datetime, amount)
      } catch (webhookError) {
        console.error('Failed to send Discord webhook:', webhookError)
        // Don't fail the payment if webhook fails
      }
    }

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

async function sendPromptpayDiscordWebhook(
  orderId: number,
  receiptUrl: string,
  transactionId: string,
  transactionDateTime: string,
  amount: number
) {
  const webhookUrl = 'https://discord.com/api/webhooks/1438016676397449316/9lcxMzCitobwtRwRCihTYC0FAZzz-MN5QIhHAtVso5WJLsbn5FSNLFUOTikB5fIY3RI6'
  
  try {
    // Get order details
    const order = await getOrderById(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    // Build product information
    const productInfo = order.items.map((item: any) => {
      return {
        name: item.product_name || 'Unknown Product',
        code: item.product_code || 'N/A',
        price: `฿${(Number(item.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        quantity: item.quantity
      }
    })

    // Get the full URL for the receipt image
    let baseUrl = 'http://localhost:3000'
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    }
    const receiptImageUrl = `${baseUrl}${receiptUrl}`

    // Build Discord embed
    const embed = {
      title: `💳 New Promptpay Payment - Order #${orderId}`,
      color: 0x00ff00, // Green color
      fields: [
        {
          name: 'Customer Email',
          value: order.customer_email || 'N/A',
          inline: true
        },
        {
          name: 'Transaction ID',
          value: transactionId,
          inline: true
        },
        {
          name: 'Transaction Date & Time',
          value: transactionDateTime || 'N/A',
          inline: true
        },
        {
          name: 'Amount',
          value: `฿${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          inline: true
        },
        {
          name: 'Order Total',
          value: `฿${(Number(order.total) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          inline: true
        }
      ],
      image: {
        url: receiptImageUrl
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SugarBunny Stores Payment Notification'
      }
    }

    // Add product information
    productInfo.forEach((product: { name: string; code: string; price: string; quantity: number }, index: number) => {
      embed.fields.push({
        name: `Product ${index + 1}`,
        value: `**Name:** ${product.name}\n**Code:** ${product.code}\n**Price:** ${product.price} × ${product.quantity}`,
        inline: false
      })
    })

    // Send webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`)
    }

    console.log('Discord webhook sent successfully for Promptpay payment')
  } catch (error: any) {
    console.error('Error sending Discord webhook:', error)
    throw error
  }
}

