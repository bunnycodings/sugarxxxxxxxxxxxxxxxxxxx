import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')

    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId: number
    try {
      const sessionData = JSON.parse(userSession.value)
      userId = sessionData.userId
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const productId = parseInt(params.productId)
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Get user email
    const [userRows] = await pool.execute(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    ) as any[]

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userEmail = userRows[0].email

    // Verify user has purchased this product
    // Check if there's an order with this product that's paid/completed
    const [orderRows] = await pool.execute(
      `SELECT o.id, o.status 
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_email = ? 
       AND oi.product_id = ? 
       AND o.status IN ('paid', 'completed')
       LIMIT 1`,
      [userEmail, productId]
    ) as any[]

    if (orderRows.length === 0) {
      return NextResponse.json({ 
        error: 'You have not purchased this product or payment is not completed' 
      }, { status: 403 })
    }

    // Get product file URL
    const [productRows] = await pool.execute(
      'SELECT file_url, name FROM products WHERE id = ?',
      [productId]
    ) as any[]

    if (productRows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = productRows[0]

    if (!product.file_url) {
      return NextResponse.json({ 
        error: 'No file available for this product' 
      }, { status: 404 })
    }

    // Read and serve the file
    // Handle both relative paths (starting with /) and absolute paths
    let filePath: string
    if (product.file_url.startsWith('/')) {
      // Remove leading slash and join with public directory
      filePath = join(process.cwd(), 'public', product.file_url.substring(1))
    } else {
      filePath = join(process.cwd(), 'public', product.file_url)
    }
    
    try {
      // Check if file exists before trying to read it
      try {
        await access(filePath, constants.F_OK)
      } catch (accessError) {
        console.error('File access error:', accessError)
        console.error('Attempted file path:', filePath)
        return NextResponse.json({ 
          error: 'File not found. The file may have been removed or is not available on the server. Please contact support if you believe this is an error.' 
        }, { status: 404 })
      }

      const fileBuffer = await readFile(filePath)
      const fileName = product.file_url.split('/').pop() || `product_${productId}.zip`
      
      // Determine content type based on file extension
      const ext = fileName.split('.').pop()?.toLowerCase()
      const contentTypeMap: { [key: string]: string } = {
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain'
      }

      const contentType = contentTypeMap[ext || ''] || 'application/octet-stream'

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${product.name.replace(/[^a-zA-Z0-9.-]/g, '_')}_${fileName}"`,
          'Content-Length': fileBuffer.length.toString()
        }
      })
    } catch (fileError: any) {
      console.error('File read error:', fileError)
      console.error('File path attempted:', filePath)
      return NextResponse.json({ 
        error: 'File not found on server. Please contact support if you believe this is an error.' 
      }, { status: 404 })
    }
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download file' },
      { status: 500 }
    )
  }
}

