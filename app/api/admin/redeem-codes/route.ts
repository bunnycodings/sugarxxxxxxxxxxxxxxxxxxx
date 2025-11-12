import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAllRedeemCodes, createRedeemCode, deleteRedeemCode } from '@/lib/redeemCodes'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    let cookieStore
    try {
      cookieStore = await cookies()
    } catch (cookieError: any) {
      console.error('Cookies error:', cookieError)
      return NextResponse.json(
        { error: 'Failed to access cookies', details: process.env.NODE_ENV === 'development' ? cookieError.message : undefined },
        { status: 500 }
      )
    }
    
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const codes = await getAllRedeemCodes()
    return NextResponse.json({ codes }, { status: 200 })
  } catch (error: any) {
    console.error('Get redeem codes error:', error)
    
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      return NextResponse.json({ codes: [] }, { status: 200 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    let cookieStore
    try {
      cookieStore = await cookies()
    } catch (cookieError: any) {
      console.error('Cookies error:', cookieError)
      return NextResponse.json(
        { error: 'Failed to access cookies', details: process.env.NODE_ENV === 'development' ? cookieError.message : undefined },
        { status: 500 }
      )
    }
    
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { count = 1, ...codeData } = body

    const createdCodes = []
    for (let i = 0; i < count; i++) {
      const result = await createRedeemCode(codeData)
      createdCodes.push(result)
    }

    return NextResponse.json(
      { 
        message: `${count} redeem code(s) created successfully`,
        codes: createdCodes 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create redeem code error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let cookieStore
    try {
      cookieStore = await cookies()
    } catch (cookieError: any) {
      console.error('Cookies error:', cookieError)
      return NextResponse.json(
        { error: 'Failed to access cookies', details: process.env.NODE_ENV === 'development' ? cookieError.message : undefined },
        { status: 500 }
      )
    }
    
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Code ID is required' }, { status: 400 })
    }

    const success = await deleteRedeemCode(parseInt(id))

    if (!success) {
      return NextResponse.json({ error: 'Redeem code not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Redeem code deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Delete redeem code error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

