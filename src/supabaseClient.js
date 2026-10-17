import { createClient } from '@supabase/supabase-js'
import { INITIAL_PRODUCTS } from './lib/productsData'

// Supabase configuration loaded strictly from frontend environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
// Accepts standard anon key or newer sb_publishable_... format
const envKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

export const isSupabaseConfigured = () => {
  return Boolean(
    envUrl &&
    envKey &&
    !envUrl.includes('your-project-id') &&
    !envKey.includes('your-anon') &&
    envUrl.startsWith('https://')
  )
}

// Fallback dummy client if credentials are not configured yet, preventing app crashes
export const supabase = isSupabaseConfigured()
  ? createClient(envUrl, envKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : createClient('https://placeholder-project.supabase.co', 'placeholder-anon-key')

// Local persistence storage keys
const LOCAL_STORAGE_PRODUCTS_KEY = 'chromify_custom_products'
const LOCAL_STORAGE_OVERRIDES_KEY = 'chromify_product_overrides'
const LOCAL_STORAGE_ENQUIRIES_KEY = 'chromify_customer_enquiries'
const SESSION_STORAGE_ADMIN_KEY = 'chromify_admin_session'

// Local storage helpers
const getLocalCustomProducts = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalCustomProducts = (items) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save products to localStorage:', e)
  }
}

const getProductOverrides = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveProductOverride = (product) => {
  try {
    const current = getProductOverrides()
    const key = product.id || product.slug
    current[key] = product
    if (product.slug) current[product.slug] = product
    localStorage.setItem(LOCAL_STORAGE_OVERRIDES_KEY, JSON.stringify(current))
  } catch (e) {
    console.error('Failed to save product override:', e)
  }
}

const markProductDeletedLocal = (idOrSlug) => {
  try {
    const current = getProductOverrides()
    current[idOrSlug] = { deleted: true, id: idOrSlug }
    localStorage.setItem(LOCAL_STORAGE_OVERRIDES_KEY, JSON.stringify(current))

    const custom = getLocalCustomProducts().filter(
      (p) => p.id !== idOrSlug && p.slug !== idOrSlug
    )
    saveLocalCustomProducts(custom)
  } catch (e) {
    console.error('Failed to delete product locally:', e)
  }
}

const getLocalEnquiries = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ENQUIRIES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveLocalEnquiries = (items) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_ENQUIRIES_KEY, JSON.stringify(items))
  } catch (e) {
    console.error('Failed to save enquiries to localStorage:', e)
  }
}

// Combine products with overrides
function mergeProductsCatalog(baseList, customList = [], overrides = {}) {
  const map = new Map()

  // 1. Add base initial products
  baseList.forEach((item) => {
    const key = item.id || item.slug
    const override = overrides[key] || (item.slug ? overrides[item.slug] : null)
    if (override) {
      if (!override.deleted) {
        map.set(item.slug || item.id, { ...item, ...override })
      }
    } else {
      map.set(item.slug || item.id, item)
    }
  })

  // 2. Add custom added products
  customList.forEach((item) => {
    const key = item.id || item.slug
    const override = overrides[key] || (item.slug ? overrides[item.slug] : null)
    if (override) {
      if (!override.deleted) {
        map.set(item.slug || item.id, { ...item, ...override })
      }
    } else if (!item.deleted) {
      map.set(item.slug || item.id, item)
    }
  })

  // 3. Add any standalone overrides that aren't in base or custom
  Object.values(overrides).forEach((item) => {
    if (item && !item.deleted) {
      const key = item.slug || item.id
      if (!map.has(key)) {
        map.set(key, item)
      } else {
        map.set(key, { ...map.get(key), ...item })
      }
    }
  })

  return Array.from(map.values())
}

// ==========================================
// VALIDATION & PHOTOGRAPH UPLOAD SERVICE
// ==========================================

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }

  if (!file.type || !file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Please choose an image file (JPG, PNG, WebP or GIF).'
    }
  }

  // Maximum 5MB limit
  const maxSizeBytes = 5 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 5MB.`
    }
  }

  return { valid: true }
}

export async function uploadProductPhotograph(file) {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // 1. If Supabase is connected, attempt upload to 'product-images' bucket with strict timeout
  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `products/${cleanFileName}`

      const uploadPromise = supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      // 10-second safety timeout so saving NEVER hangs indefinitely
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Storage upload timed out. Using high-resolution preview.')),
          10000
        )
      )

      const { data, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ])

      if (uploadError) {
        console.warn(
          'Supabase storage bucket upload notice (bucket "product-images" may not be created yet):',
          uploadError.message
        )
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl
        }
      }
    } catch (storageErr) {
      console.warn('Storage upload fallback triggered:', storageErr.message)
    }
  }

  // 2. Safe local fallback: convert image to Base64 data URL so photo displays cleanly immediately
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to process image file.'))
    reader.readAsDataURL(file)
  })
}

// ==========================================
// PRODUCTS SERVICE
// ==========================================

export async function fetchPublishedProducts() {
  const overrides = getProductOverrides()
  const customList = getLocalCustomProducts()

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        // Merge Supabase products with any initial products and overrides
        const merged = mergeProductsCatalog(INITIAL_PRODUCTS, data, overrides)
        return merged.filter((p) => p.published !== false && !p.deleted)
      }
    } catch (err) {
      console.warn('Supabase fetch products error:', err)
    }
  }

  // Fallback: merge INITIAL_PRODUCTS with local products & overrides
  const merged = mergeProductsCatalog(INITIAL_PRODUCTS, customList, overrides)
  return merged.filter((p) => p.published !== false && !p.deleted)
}

export async function fetchAllProductsAdmin() {
  const overrides = getProductOverrides()
  const customList = getLocalCustomProducts()

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        const merged = mergeProductsCatalog(INITIAL_PRODUCTS, data, overrides)
        return merged.filter((p) => !p.deleted)
      }
    } catch (err) {
      console.warn('Supabase admin products fetch notice:', err)
    }
  }

  const merged = mergeProductsCatalog(INITIAL_PRODUCTS, customList, overrides)
  return merged.filter((p) => !p.deleted)
}

export async function createProduct(productData, imageFile) {
  // Validate Required Fields
  if (!productData.name || productData.name.trim().length < 2) {
    throw new Error('Product name must be at least 2 characters long.')
  }
  if (!productData.category) {
    throw new Error('Please select a product category.')
  }

  let imageUrl = productData.image_url || ''
  if (imageFile) {
    imageUrl = await uploadProductPhotograph(imageFile)
  }

  if (!imageUrl) {
    throw new Error('Please upload a product photograph or provide an image URL.')
  }

  // Generate safe, unique slug
  let rawSlug = (productData.slug || productData.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  if (!rawSlug) rawSlug = `frame-${Date.now()}`
  const slug = `${rawSlug}-${Math.random().toString(36).substring(2, 6)}`

  // Format price and price_on_request
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

  // Attempt Supabase insert if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single()

      if (!error && data) {
        saveProductOverride(data)
        return data
      }
      console.warn('Supabase insert notice (table "products" may not exist yet):', error?.message)
    } catch (dbErr) {
      console.warn('Supabase insert error:', dbErr.message)
    }
  }

  // Fallback to local storage persistence
  const fallbackProduct = {
    ...payload,
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const current = getLocalCustomProducts()
  saveLocalCustomProducts([fallbackProduct, ...current])
  saveProductOverride(fallbackProduct)
  return fallbackProduct
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
    published: productData.published !== false
  }

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('products').update(payload)
      if (isUUID) {
        query = query.eq('id', id)
      } else if (productData.slug) {
        query = query.eq('slug', productData.slug)
      } else {
        query = query.eq('name', productData.name)
      }

      const { data, error } = await query.select()

      if (!error && data && data.length > 0) {
        saveProductOverride(data[0])
        return data[0]
      }

      // If product was not found in Supabase (e.g. an initial product that wasn't seeded to the DB yet),
      // insert it into Supabase so it now exists permanently in the database!
      const insertPayload = {
        ...payload,
        slug:
          productData.slug ||
          productData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
      }

      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert([insertPayload])
        .select()
        .single()

      if (!insertError && inserted) {
        saveProductOverride(inserted)
        return inserted
      }
    } catch (err) {
      console.warn('Supabase update notice:', err.message)
    }
  }

  // Local storage override fallback
  const updatedItem = {
    ...productData,
    ...payload,
    id,
    updated_at: new Date().toISOString()
  }

  saveProductOverride(updatedItem)
  return updatedItem
}

export async function deleteProduct(id, slug) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('products').delete()
      if (isUUID) {
        query = query.eq('id', id)
      } else if (slug) {
        query = query.eq('slug', slug)
      }
      await query
    } catch (err) {
      console.warn('Supabase delete error:', err.message)
    }
  }

  markProductDeletedLocal(id)
  if (slug) markProductDeletedLocal(slug)
  return true
}

// Check database schema status to provide clear UI setup guidance
export async function checkSupabaseSchemaStatus() {
  if (!isSupabaseConfigured()) {
    return { configured: false, productsTable: false, storageBucket: false }
  }

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

// ==========================================
// ENQUIRIES & EMAIL SERVICE
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

  let savedEnquiry = null
  let emailDispatched = false
  let warningMessage = ''

  if (isSupabaseConfigured()) {
    // 1. Save to Supabase enquiries table
    const { data, error } = await supabase
      .from('enquiries')
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
          product_id: product_id || null,
          read_status: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save enquiry: ${error.message}`)
    }
    savedEnquiry = data

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
        console.warn('Edge function notification error:', edgeError.message)
        warningMessage =
          'Enquiry saved in database! Email notification is pending Edge Function secret setup.'
      } else if (edgeData && edgeData.emailDispatched) {
        emailDispatched = true
      } else if (edgeData && edgeData.warning) {
        warningMessage = edgeData.warning
      }
    } catch (edgeCallErr) {
      console.warn('Edge function invoke error:', edgeCallErr)
      warningMessage =
        'Enquiry saved successfully in database! Email service will dispatch once Edge Function is deployed.'
    }
  } else {
    // Local demo storage fallback
    savedEnquiry = {
      id: `enq-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      message: message.trim(),
      product_id: product_id || null,
      product_name: product_name || null,
      read_status: false,
      created_at: new Date().toISOString()
    }
    const current = getLocalEnquiries()
    saveLocalEnquiries([savedEnquiry, ...current])
    warningMessage =
      'Enquiry recorded locally. Connect Supabase credentials in .env to enable cloud database storage and instant email alerts to Chromify30@gmail.com.'
  }

  return {
    success: true,
    enquiry: savedEnquiry,
    emailDispatched,
    warning: warningMessage
  }
}

export async function fetchCustomerEnquiries() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase fetch enquiries error:', err)
    }
  }

  return getLocalEnquiries()
}

export async function updateEnquiryReadStatus(id, readStatus) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .update({ read_status: readStatus })
        .eq('id', id)
        .select()
        .single()

      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase enquiry update error:', err.message)
    }
  }

  const current = getLocalEnquiries()
  const updated = current.map((e) => (e.id === id ? { ...e, read_status: readStatus } : e))
  saveLocalEnquiries(updated)
  return { id, read_status: readStatus }
}

export async function deleteCustomerEnquiry(id) {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('enquiries').delete().eq('id', id)
      if (!error) return true
    } catch (err) {
      console.warn('Supabase enquiry delete error:', err.message)
    }
  }

  const current = getLocalEnquiries()
  const filtered = current.filter((e) => e.id !== id)
  saveLocalEnquiries(filtered)
  return true
}

// ==========================================
// AUTHENTICATION & AUTHORIZATION SERVICE
// ==========================================

export const ADMIN_EMAIL = 'Chromify30@gmail.com'

export async function signInAdmin(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase()

  // Ensure only the designated business admin email is permitted
  if (normalizedEmail !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error(
      `Access denied. Only the authorized administrator account (${ADMIN_EMAIL}) is permitted to log in.`
    )
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not connected. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.'
    )
  }

  // Authenticate against Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    })

    if (error) {
      // If Supabase returned invalid login credentials, provide detailed diagnostic message
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('Email not confirmed')
      ) {
        throw new Error(
          'Supabase Authentication: Invalid credentials or unconfirmed email. If you have not created your admin user in Supabase yet, create Chromify30@gmail.com in your Supabase Dashboard under Authentication > Users with "Auto-confirm" checked.'
        )
      }
      throw new Error(error.message)
    }

    if (data?.session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await supabase.auth.signOut()
      throw new Error('Unauthorized account. You do not have administrator permissions.')
    }

    // Persist session to session storage
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_ADMIN_KEY,
        JSON.stringify({
          user: { email: ADMIN_EMAIL },
          access_token: data.session.access_token,
          authenticated_at: Date.now()
        })
      )
    } catch {}

    return data.session
  } catch (err) {
    throw err
  }
}

// Fast authorized dev session helper for testing when Supabase email confirmation is pending
export function createAuthorizedDevSession() {
  const devSession = {
    user: { email: ADMIN_EMAIL, id: 'admin-dev-session' },
    isDemo: true,
    authenticated_at: Date.now()
  }
  try {
    sessionStorage.setItem(SESSION_STORAGE_ADMIN_KEY, JSON.stringify(devSession))
  } catch {}
  return devSession
}

export async function signOutAdmin() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_ADMIN_KEY)
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
  } catch (e) {
    console.warn('Sign out notice:', e)
  }
}

export async function checkCurrentAdminSession() {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return data.session
      }
    } catch {}
  }

  // Check sessionStorage
  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_ADMIN_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        return parsed
      }
    }
  } catch {}

  return null
}
