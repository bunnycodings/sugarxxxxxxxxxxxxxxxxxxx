import { NextRequest, NextResponse } from 'next/server'

// This is a placeholder for email sending
// In production, you would integrate with an email service like SendGrid, Nodemailer, etc.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, customerEmail, paymentData } = body

    // Email content with Western Union instructions
    const emailContent = `
Dear Customer,

Thank you for your order (#${orderId})!

WESTERN UNION PAYMENT INSTRUCTIONS:

Please send your payment via Western Union using the following details:

RECIPIENT INFORMATION:
- Name: Zhong Jie Yong
- Account Number: 1101402249826
- Phone: 098-887-0075

PAYMENT AMOUNT: ฿${paymentData.amount}

YOUR PAYMENT DETAILS:
- MTCN No: ${paymentData.mtcn_no}
- Sender Name: ${paymentData.sender_name}
- Transaction Date: ${paymentData.transaction_date}
- Amount: ฿${paymentData.amount}

INSTRUCTIONS:
1. Visit your nearest Western Union location
2. Fill out the send money form with the recipient information above
3. Send the exact amount: ฿${paymentData.amount}
4. Keep your receipt and MTCN number
5. Your order will be processed once payment is verified

If you have already submitted your payment details through our website, no further action is needed. We will verify your payment and update your order status.

Thank you for your purchase!

Best regards,
SugarBunny Stores
`

    // In a real implementation, you would send this email here
    // For now, we'll just log it
    console.log('=== EMAIL TO SEND ===')
    console.log(`To: ${customerEmail}`)
    console.log(`Subject: Payment Instructions for Order #${orderId}`)
    console.log(`Content:`, emailContent)
    console.log('====================')

    // TODO: Integrate with actual email service
    // Example with Nodemailer:
    // await transporter.sendMail({
    //   from: 'noreply@sugarbunny.com',
    //   to: customerEmail,
    //   subject: `Payment Instructions for Order #${orderId}`,
    //   text: emailContent,
    //   html: emailContent.replace(/\n/g, '<br>')
    // })

    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully'
    }, { status: 200 })
  } catch (error: any) {
    console.error('Send email error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to send email' 
    }, { status: 500 })
  }
}

