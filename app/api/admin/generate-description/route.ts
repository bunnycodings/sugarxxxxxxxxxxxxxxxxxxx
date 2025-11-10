import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { imageUrl } = await request.json()

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    // Call OpenAI Vision API to analyze the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // or 'gpt-4-vision-preview' if available
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this product image and write a compelling, detailed product description. Include key features, benefits, and what makes this product special. Write in a professional but engaging tone suitable for an e-commerce store. Keep it between 50-150 words.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to generate description' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const description = data.choices?.[0]?.message?.content || ''

    if (!description) {
      return NextResponse.json(
        { error: 'No description generated' },
        { status: 500 }
      )
    }

    return NextResponse.json({ description })
  } catch (error: any) {
    console.error('Error generating description:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating description' },
      { status: 500 }
    )
  }
}

