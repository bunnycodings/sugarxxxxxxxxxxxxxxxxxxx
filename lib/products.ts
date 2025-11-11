import pool, { executeWithRetry } from './db'

export interface Product {
  id?: number
  product_code?: string
  name: string
  description?: string
  price: number
  category?: string
  image_url?: string
  file_url?: string
  stock?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export async function getAllProducts() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, product_code, name, description, price, category, image_url, file_url, stock, is_active, created_at FROM products ORDER BY created_at DESC'
    ) as any[]
    return rows
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function getProductById(id: number) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    ) as any[]
    return rows[0] || null
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function createProduct(product: Product) {
  try {
    // Insert product first to get the auto-generated ID
    const result = await executeWithRetry(async () =>
      pool.execute(
        'INSERT INTO products (product_code, name, description, price, category, image_url, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          product.product_code || null,
          product.name,
          product.description || null,
          product.price,
          product.category || null,
          product.image_url || null,
          product.stock || 0,
          product.is_active !== undefined ? product.is_active : true
        ]
      )
    ) as any[]
    
    const [insertResult] = result
    const productId = insertResult.insertId
    
    // Auto-generate product code if not provided
    if (!product.product_code) {
      const productCode = `PD${String(productId).padStart(6, '0')}`
      
      // Update the product with the generated code
      await executeWithRetry(async () =>
        pool.execute(
          'UPDATE products SET product_code = ? WHERE id = ?',
          [productCode, productId]
        )
      )
    }
    
    return productId
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function updateProduct(id: number, product: Partial<Product>) {
  try {
    const updates: string[] = []
    const values: any[] = []

    if (product.product_code !== undefined) {
      updates.push('product_code = ?')
      values.push(product.product_code || null)
    }
    if (product.name !== undefined) {
      updates.push('name = ?')
      values.push(product.name)
    }
    if (product.description !== undefined) {
      updates.push('description = ?')
      values.push(product.description)
    }
    if (product.price !== undefined) {
      updates.push('price = ?')
      values.push(product.price)
    }
    if (product.category !== undefined) {
      updates.push('category = ?')
      values.push(product.category)
    }
    if (product.image_url !== undefined) {
      updates.push('image_url = ?')
      values.push(product.image_url)
    }
    if (product.file_url !== undefined) {
      updates.push('file_url = ?')
      values.push(product.file_url)
    }
    if (product.stock !== undefined) {
      updates.push('stock = ?')
      values.push(product.stock)
    }
    if (product.is_active !== undefined) {
      updates.push('is_active = ?')
      values.push(product.is_active)
    }

    if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    values.push(id)
    const [result] = await pool.execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    ) as any[]
    return result.affectedRows > 0
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

export async function deleteProduct(id: number) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    ) as any[]
    return result.affectedRows > 0
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
      throw new Error('Database tables not initialized. Please run: npm run setup-db')
    }
    throw error
  }
}

