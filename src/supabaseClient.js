import { createClient } from '@supabase/supabase-js'
import { INITIAL_PRODUCTS } from './lib/productsData'

// Dedicated Supabase configuration with production defaults for seamless Netlify deployment
const DEFAULT_SUPABASE_URL = 'https://gvsbviwfnggbamdegoeh.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_cbZy7b6fg5zbUyHk-JnjxQ_dYTyxxS7'

const envUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL
).trim()

const envKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY
).trim()

export const isSupabaseConfigured = () => {
  return Boolean(
    envUrl &&
    envKey &&
    !envUrl.includes('your-project-id') &&
    !envKey.includes('your-anon') &&
    envUrl.startsWith('https://')
  )
}

// Global Supabase client configured with auto session persistence
export const supabase = createClient(envUrl, envKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export const ADMIN_EMAIL = 'Chromify30@gmail.com'

// Helper to determine if a string is a valid PostgreSQL UUID
export function isUUID(str) {
  if (!str || typeof str !== 'string') return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

// ==========================================
// IMAGE UPLOAD & VALIDATION SERVICE
// ==========================================

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }

  if (!file.type || !file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please select an image file (JPG, PNG, WebP or GIF).'
    }
  }

  // Maximum 5MB size limit
  const maxSizeBytes = 5 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Photograph size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 5MB.`
    }
  }

  return { valid: true }
}

export async function uploadProductPhotograph(file) {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const fileExt = file.name.split('.').pop() || 'jpg'
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
  const filePath = `products/${cleanFileName}`

  // Upload to Supabase Storage bucket 'product-images'
  const uploadPromise = supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  // 12-second safety timeout so saving never hangs
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'Upload timed out. Please check your network connection or verify that bucket "product-images" exists in Supabase Storage.'
          )
        ),
      12000
    )
  )

  const { data, error: uploadError } = await Promise.race([
    uploadPromise,
    timeoutPromise
  ])

  if (uploadError) {
    throw new Error(
      `Photograph upload failed: ${uploadError.message}. Make sure the 'product-images' storage bucket is created in Supabase.`
    )
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  if (!publicUrlData?.publicUrl) {
    throw new Error('Could not retrieve public CDN URL for the uploaded photograph.')
  }

  return publicUrlData.publicUrl
}

// ==========================================
// DATABASE AUTO-SEED HELPER
// Ensures the 17 initial products exist permanently in the Supabase DB
// ==========================================

let isSeedingInProgress = false

async function ensureDatabaseSeeded() {
  if (isSeedingInProgress) return
  isSeedingInProgress = true

  try {
    const seedRows = INITIAL_PRODUCTS.map((p) => ({
      name: p.name,
      slug: p.slug,
      category: p.category,
      description: p.description || '',
      price: p.price ?? null,
      price_on_request: p.price_on_request ?? true,
      image_url: p.image_url,
      published: p.published !== false
    }))

    const { data, error } = await supabase.from('products').insert(seedRows).select()
    if (!error && data) {
      console.log('Successfully seeded initial 17 products into Supabase database.')
      return data
    }
  } catch (err) {
    console.warn('Auto-seed notice:', err.message)
  } finally {
    isSeedingInProgress = false
  }
  return null
}

// ==========================================
// PRODUCTS SERVICE (REAL SUPABASE DATABASE)
// ==========================================

export async function fetchPublishedProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase products fetch notice:', error.message)
      // If table has not been created yet in Supabase, show initial catalog so visitors see frames
      return INITIAL_PRODUCTS.filter((p) => p.published !== false)
    }

    if (data && data.length > 0) {
      return data
    }

    // If table exists but is empty, seed the initial catalog into Supabase
    const seeded = await ensureDatabaseSeeded()
    if (seeded && seeded.length > 0) {
      return seeded.filter((p) => p.published !== false)
    }
  } catch (err) {
    console.warn('fetchPublishedProducts error:', err)
  }

  return INITIAL_PRODUCTS.filter((p) => p.published !== false)
}

export async function fetchAllProductsAdmin() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('fetchAllProductsAdmin notice:', error.message)
      return INITIAL_PRODUCTS
    }

    if (data && data.length > 0) {
      return data
    }

    // Auto-seed if table is empty
    const seeded = await ensureDatabaseSeeded()
    if (seeded && seeded.length > 0) {
      return seeded
    }
  } catch (err) {
    console.warn('fetchAllProductsAdmin error:', err)
  }

  return INITIAL_PRODUCTS
}

export async function createProduct(productData, imageFile) {
  if (!productData.name || productData.name.trim().length < 2) {
    throw new Error('Product name must be at least 2 characters long.')
  }
  if (!productData.category) {
    throw new Error('Please select a product category.')
  }

  let imageUrl = (productData.image_url || '').trim()
  if (imageFile) {
    imageUrl = await uploadProductPhotograph(imageFile)
  }

  if (!imageUrl) {
    throw new Error('Please upload a product photograph or enter an image URL.')
  }

  // Generate clean, unique slug
  let rawSlug = (productData.slug || productData.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (!rawSlug) rawSlug = `frame-${Date.now()}`
  const slug = `${rawSlug}-${Math.random().toString(36).substring(2, 6)}`

  const priceOnRequest = Boolean(productData.price_on_request)
  const numericPrice =
    priceOnRequest || productData.price === '' || productData.price === null || productData.price === undefined
      ? null
      : Number(productData.price)

  const payload = {
    name: productData.name.trim(),
    slug,
    category: productData.category,
    description: (productData.description || '').trim(),
    price: numericPrice,
    price_on_request: priceOnRequest,
    image_url: imageUrl,
    published: productData.published !== false
  }

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single()

  if (error) {
    throw new Error(`Database error adding product: ${error.message}`)
  }

  return data
}

export async function updateProduct(id, productData, imageFile) {
  if (!productData.name || productData.name.trim().length < 2) {
    throw new Error('Product name must be at least 2 characters long.')
  }
  if (!productData.category) {
    throw new Error('Please select a product category.')
  }

  let imageUrl = productData.image_url
  if (imageFile) {
    imageUrl = await uploadProductPhotograph(imageFile)
  }

  const priceOnRequest = Boolean(productData.price_on_request)
  const numericPrice =
    priceOnRequest || productData.price === '' || productData.price === null || productData.price === undefined
      ? null
      : Number(productData.price)

  const payload = {
    name: productData.name.trim(),
    category: productData.category,
    description: (productData.description || '').trim(),
    price: numericPrice,
    price_on_request: priceOnRequest,
    image_url: imageUrl,
    published: productData.published !== false,
    updated_at: new Date().toISOString()
  }

  // 1. If ID is a UUID, update by ID
  if (isUUID(id)) {
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Database error updating product: ${error.message}`)
    }
    return data
  }

  // 2. If ID is not a UUID (e.g. initial product 'prod-01'), find by slug
  const targetSlug =
    productData.slug ||
    productData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const { data: existingRows } = await supabase
    .from('products')
    .select('*')
    .eq('slug', targetSlug)

  if (existingRows && existingRows.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', existingRows[0].id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // 3. If product row did not exist in Supabase yet, insert it as a new permanent row
  const insertPayload = {
    ...payload,
    slug: targetSlug
  }

  const { data: inserted, error: insertError } = await supabase
    .from('products')
    .insert([insertPayload])
    .select()
    .single()

  if (insertError) {
    throw new Error(`Database error saving product: ${insertError.message}`)
  }

  return inserted
}

export async function deleteProduct(id, slug) {
  if (isUUID(id)) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(`Database error deleting product: ${error.message}`)
    return true
  }

  if (slug) {
    const { error } = await supabase.from('products').delete().eq('slug', slug)
    if (error) throw new Error(`Database error deleting product: ${error.message}`)
    return true
  }

  return true
}

// ==========================================
// ENQUIRIES & CONTACT SERVICE (REAL SUPABASE DATABASE)
// ==========================================

export async function submitCustomerEnquiry(payload) {
  const { name, phone, email, message, product_id, product_name } = payload

  // Client validation
  if (!name || name.trim().length < 2) {
    throw new Error('Please enter your full name (minimum 2 characters).')
  }
  if (!phone || phone.trim().length < 7) {
    throw new Error('Please enter a valid phone number.')
  }
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address.')
  }
  if (!message || message.trim().length < 5) {
    throw new Error('Please write your message or enquiry details.')
  }

  // 1. Save permanently to Supabase enquiries table
  const insertData = {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    product_id: isUUID(product_id) ? product_id : null,
    read_status: false,
    created_at: new Date().toISOString()
  }

  // 1. Save permanently to Supabase enquiries table without .select() so anonymous visitors never trigger SELECT RLS violations
  const { error: dbError } = await supabase
    .from('enquiries')
    .insert([insertData])

  if (dbError) {
    throw new Error(`Failed to save enquiry in database: ${dbError.message}`)
  }

  let emailDispatched = false
  let warningMessage = ''

  // 2. Trigger Supabase Edge Function for email notification to Chromify30@gmail.com
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
      'send-enquiry-email',
      {
        body: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
          product_name: product_name || 'General Product Enquiry',
          product_id: product_id || null
        }
      }
    )

    if (edgeError) {
      console.warn('Edge function invoke notice:', edgeError.message)
      warningMessage =
        'Enquiry saved in database! (Email notification will dispatch once Edge Function has RESEND_API_KEY set).'
    } else if (edgeData?.emailDispatched) {
      emailDispatched = true
    } else if (edgeData?.warning) {
      warningMessage = edgeData.warning
    }
  } catch (edgeCallErr) {
    console.warn('Edge function invoke error:', edgeCallErr)
  }

  return {
    success: true,
    enquiry: insertData,
    emailDispatched,
    warning: warningMessage
  }
}

export async function fetchCustomerEnquiries() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch enquiries: ${error.message}`)
  }

  return data || []
}

export async function updateEnquiryReadStatus(id, readStatus) {
  const { data, error } = await supabase
    .from('enquiries')
    .update({ read_status: readStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update enquiry status: ${error.message}`)
  }

  return data
}

export async function deleteCustomerEnquiry(id) {
  const { error } = await supabase.from('enquiries').delete().eq('id', id)
  if (error) {
    throw new Error(`Failed to delete enquiry: ${error.message}`)
  }
  return true
}

// ==========================================
// AUTHENTICATION & AUTHORIZATION SERVICE
// ==========================================

export async function signInAdmin(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase()

  if (normalizedEmail !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error(
      `Access denied. Only the authorized administrator account (${ADMIN_EMAIL}) is permitted to log in.`
    )
  }

  if (!password || password.trim().length === 0) {
    throw new Error('Password is required.')
  }

  // Authenticate strictly with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password
  })

  if (error) {
    if (
      error.message.includes('Invalid login credentials') ||
      error.message.includes('Email not confirmed')
    ) {
      throw new Error(
        'Supabase Authentication: Invalid credentials or unconfirmed email. In your Supabase Dashboard, go to Authentication > Users, and ensure Chromify30@gmail.com is created with "Auto-confirm" checked.'
      )
    }
    throw new Error(error.message)
  }

  if (data?.session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await supabase.auth.signOut()
    throw new Error('Unauthorized account. You do not have administrator permissions.')
  }

  return data.session
}

export async function signOutAdmin() {
  await supabase.auth.signOut()
}

export async function checkCurrentAdminSession() {
  try {
    const { data } = await supabase.auth.getSession()
    if (data?.session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return data.session
    }
  } catch (err) {
    console.warn('checkCurrentAdminSession error:', err)
  }
  return null
}

export async function checkSupabaseSchemaStatus() {
  let productsTable = false
  let storageBucket = false

  try {
    const { error: prodErr } = await supabase.from('products').select('id').limit(1)
    if (!prodErr || !prodErr.message.includes('Could not find')) {
      productsTable = true
    }
  } catch {
    productsTable = false
  }

  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    if (buckets && buckets.some((b) => b.id === 'product-images' || b.name === 'product-images')) {
      storageBucket = true
    }
  } catch {
    storageBucket = false
  }

  return {
    configured: true,
    productsTable,
    storageBucket
  }
}
