import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { updateProduct } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('productId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size must be less than 100MB' 
      }, { status: 400 })
    }

    // Validate file type - only ZIP and RAR allowed
    const allowedExtensions = ['.zip', '.rar']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only ZIP and RAR files are accepted.' 
      }, { status: 400 })
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (e) {
      // Directory might already exist
    }

    // Sanitize filename
    const safeFileName = `product_${productId}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(uploadsDir, safeFileName)
    await writeFile(filePath, buffer)
    
    const fileUrl = `/uploads/products/${safeFileName}`

    // Update product with file URL
    await updateProduct(parseInt(productId), { file_url: fileUrl })

    return NextResponse.json({ 
      success: true, 
      file_url: fileUrl,
      message: 'File uploaded successfully' 
    }, { status: 200 })
  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}

