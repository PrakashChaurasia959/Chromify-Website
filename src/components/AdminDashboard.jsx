import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  Upload,
  MessageSquare,
  Package,
  LogOut,
  Mail,
  Phone,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react'
import { CATEGORIES, BUSINESS_INFO } from '../lib/productsData'
import {
  fetchAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCustomerEnquiries,
  updateEnquiryReadStatus,
  deleteCustomerEnquiry,
  signOutAdmin,
  isSupabaseConfigured,
  validateImageFile,
  checkSupabaseSchemaStatus
} from '../lib/supabaseClient'

export default function AdminDashboard({ isOpen, session, onClose, onLogout, onRefreshPublicProducts }) {
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'enquiries' | 'settings'
  const [products, setProducts] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [schemaStatus, setSchemaStatus] = useState(null)
  const [copiedSql, setCopiedSql] = useState(false)

  // Product Form State (for Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'Shadow Box Frames',
    description: '',
    price: '',
    price_on_request: true,
    image_url: '',
    published: true
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (isOpen) {
      loadData()
      checkSupabaseSchemaStatus().then(setSchemaStatus)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const loadData = async () => {
    setLoading(true)
    try {
      const prodsPromise = fetchAllProductsAdmin().catch((err) => {
        console.warn('Product load warning:', err)
        return []
      })
      const enqsPromise = fetchCustomerEnquiries().catch((err) => {
        console.warn('Enquiries load warning:', err)
        return []
      })
      const [prods, enqs] = await Promise.all([prodsPromise, enqsPromise])
      setProducts(prods || [])
      setEnquiries(enqs || [])
    } catch (err) {
      showNotify('error', err.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const showNotify = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Open Add Product Form
  const handleAddNew = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      category: 'Shadow Box Frames',
      description: '',
      price: '',
      price_on_request: true,
      image_url: '',
      published: true
    })
    setImageFile(null)
    setImagePreview('')
    setImageError('')
    setIsFormOpen(true)
  }

  // Open Edit Product Form
  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug || '',
      category: product.category || 'Shadow Box Frames',
      description: product.description || '',
      price: product.price !== null && product.price !== undefined ? product.price : '',
      price_on_request: Boolean(product.price_on_request),
      image_url: product.image_url || '',
      published: product.published !== false
    })
    setImageFile(null)
    setImagePreview(product.image_url || '')
    setImageError('')
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    if (formSubmitting) return
    setIsFormOpen(false)
    setEditingProduct(null)
    setImageFile(null)
    setImagePreview('')
    setImageError('')
  }

  // Handle Photo Picker with size and format validation
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setImageError(validation.error)
        setImageFile(null)
        e.target.value = ''
        return
      }
      setImageError('')
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (formSubmitting) return // Prevent duplicate submission

    // 1. Validate Product Name
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      showNotify('error', 'Product name must be at least 2 characters.')
      return
    }

    // 2. Validate Price (unless "Price on Request" is checked)
    if (!formData.price_on_request) {
      const p = Number(formData.price)
      if (formData.price === '' || isNaN(p) || p < 0) {
        showNotify('error', 'Please enter a valid positive price in ₹ INR or enable "Price on Request".')
        return
      }
    }

    // 3. Validate Photograph
    if (!imageFile && !formData.image_url) {
      showNotify('error', 'Please select a product photograph or provide an image URL.')
      return
    }

    setFormSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: formData.price_on_request || !formData.price ? null : Number(formData.price),
        price_on_request: Boolean(formData.price_on_request),
        published: Boolean(formData.published),
        image_url: formData.image_url
      }

      let savedResult = null
      if (editingProduct) {
        savedResult = await updateProduct(editingProduct.id, payload, imageFile)
        showNotify('success', `Product "${savedResult.name}" updated successfully!`)

        // Immediate local state update for zero latency
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingProduct.id || (item.slug && item.slug === editingProduct.slug)
              ? { ...item, ...savedResult }
              : item
          )
        )
      } else {
        savedResult = await createProduct(payload, imageFile)
        showNotify('success', `New product "${savedResult.name}" added successfully!`)

        // Immediate local state prepend
        setProducts((prev) => [savedResult, ...prev])
      }

      setIsFormOpen(false)
      setEditingProduct(null)
      setImageFile(null)
      setImagePreview('')
      setImageError('')

      // Refresh public website state immediately
      await loadData()
      if (onRefreshPublicProducts) onRefreshPublicProducts()
    } catch (err) {
      showNotify('error', err.message || 'Error saving product.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Toggle Published Status
  const handleTogglePublish = async (product) => {
    try {
      const nextStatus = !product.published
      // Optimistic state update
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id || (item.slug && item.slug === product.slug)
            ? { ...item, published: nextStatus }
            : item
        )
      )

      await updateProduct(product.id, { ...product, published: nextStatus })
      showNotify('success', `"${product.name}" is now ${nextStatus ? 'Published (Live)' : 'Hidden (Draft)'}`)
      await loadData()
      if (onRefreshPublicProducts) onRefreshPublicProducts()
    } catch (err) {
      showNotify('error', err.message || 'Error updating product status')
    }
  }

  // Delete Product
  const handleDeleteProduct = async (id, slug, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      try {
        // Optimistic delete
        setProducts((prev) => prev.filter((p) => p.id !== id && (!slug || p.slug !== slug)))
        await deleteProduct(id, slug)
        showNotify('success', `"${name}" removed successfully`)
        await loadData()
        if (onRefreshPublicProducts) onRefreshPublicProducts()
      } catch (err) {
        showNotify('error', err.message || 'Error deleting product')
      }
    }
  }

  // Toggle Enquiry Read Status
  const handleToggleEnquiryRead = async (enquiry) => {
    try {
      await updateEnquiryReadStatus(enquiry.id, !enquiry.read_status)
      await loadData()
    } catch (err) {
      showNotify('error', err.message)
    }
  }

  // Delete Enquiry
  const handleDeleteEnquiry = async (id) => {
    if (window.confirm('Delete this customer enquiry record?')) {
      try {
        await deleteCustomerEnquiry(id)
        showNotify('success', 'Enquiry deleted')
        await loadData()
      } catch (err) {
        showNotify('error', err.message)
      }
    }
  }

  // Logout
  const handleLogout = async () => {
    await signOutAdmin()
    if (onLogout) onLogout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#FAF9F6',
          borderRadius: 'var(--radius-xl)',
          maxWidth: '1100px',
          width: '100%',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            padding: '18px 24px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-dark)', margin: 0 }}>
                Chromify Admin Dashboard
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--slate-muted)' }}>
                Administrator: <strong>{session?.user?.email || 'Chromify30@gmail.com'}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#F1F5F9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--slate-muted)'
              }}
              aria-label="Close dashboard"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Selector & Action Row */}
        <div
          style={{
            padding: '12px 24px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'products' ? 'var(--purple-soft)' : 'transparent',
                color: activeTab === 'products' ? 'var(--purple-primary)' : 'var(--slate-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Package size={16} />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'enquiries' ? 'var(--purple-soft)' : 'transparent',
                color: activeTab === 'enquiries' ? 'var(--purple-primary)' : 'var(--slate-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative'
              }}
            >
              <MessageSquare size={16} />
              <span>Customer Enquiries ({enquiries.length})</span>
              {enquiries.filter((e) => !e.read_status).length > 0 && (
                <span
                  style={{
                    background: '#EC4899',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {enquiries.filter((e) => !e.read_status).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === 'settings' ? 'var(--purple-soft)' : 'transparent',
                color: activeTab === 'settings' ? 'var(--purple-primary)' : 'var(--slate-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Info size={16} />
              <span>Database & Setup</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={handleAddNew}
              id="admin-add-product-btn"
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {/* Database Notice Banner if Supabase table is not yet migrated */}
        {schemaStatus && schemaStatus.configured && !schemaStatus.productsTable && (
          <div
            style={{
              padding: '12px 24px',
              background: '#FEF3C7',
              borderBottom: '1px solid #FCD34D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.84rem',
              color: '#92400E'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#D97706" style={{ flexShrink: 0 }} />
              <span>
                <strong>Supabase Live Cloud Setup:</strong> Your Supabase credentials are connected. Products and price updates are actively preserved. To enable direct cloud database table sync, execute <code>supabase/schema.sql</code> in your Supabase SQL Editor.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #F59E0B',
                color: '#B45309',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                marginLeft: '12px'
              }}
            >
              View SQL Schema
            </button>
          </div>
        )}

        {/* Floating Notification */}
        {notification && (
          <div
            style={{
              padding: '12px 24px',
              background: notification.type === 'error' ? '#FEF2F2' : '#F0FDF4',
              color: notification.type === 'error' ? '#991B1B' : '#15803D',
              borderBottom: notification.type === 'error' ? '1px solid #FECACA' : '1px solid #86EFAC',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Dashboard Main Content Body */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: PRODUCTS MANAGER */}
          {activeTab === 'products' && (
            <div>
              {loading && products.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px' }}>Loading products...</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {products.map((item) => (
                    <div
                      key={item.id || item.slug}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', paddingTop: '70%', background: '#F1F5F9' }}>
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: item.published ? '#16A34A' : '#64748B',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)'
                          }}
                        >
                          {item.published ? 'Live (Published)' : 'Hidden (Draft)'}
                        </span>
                      </div>

                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--purple-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.category}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-dark)', margin: '4px 0 6px' }}>
                          {item.name}
                        </h4>
                        <p style={{ fontSize: '0.84rem', color: 'var(--slate-muted)', margin: '0 0 14px', flexGrow: 1 }}>
                          {item.price_on_request || !item.price ? (
                            <strong style={{ color: '#D97706' }}>Price on Request</strong>
                          ) : (
                            <strong style={{ color: 'var(--navy-dark)', fontSize: '0.98rem' }}>₹{item.price}</strong>
                          )}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                          <button
                            onClick={() => handleTogglePublish(item)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: item.published ? '#16A34A' : '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                            title="Toggle public visibility"
                          >
                            {item.published ? <Eye size={15} /> : <EyeOff size={15} />}
                            <span>{item.published ? 'Published' : 'Hidden'}</span>
                          </button>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleEdit(item)}
                              className="admin-edit-btn"
                              style={{
                                background: '#F1F5F9',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                color: 'var(--navy-dark)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600
                              }}
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(item.id, item.slug, item.name)}
                              style={{
                                background: '#FEF2F2',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                color: '#DC2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600
                              }}
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div>
              {enquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
                  <MessageSquare size={36} color="var(--slate-light)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)', margin: 0 }}>
                    No Enquiries Yet
                  </p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--slate-muted)', marginTop: '4px' }}>
                    Customer enquiries submitted through the contact form will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {enquiries.map((enq) => {
                    const cleanPhone = (enq.phone || '').replace(/\D/g, '')
                    return (
                      <div
                        key={enq.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: 'var(--radius-md)',
                          padding: '20px',
                          border: enq.read_status ? '1px solid #E2E8F0' : '2px solid var(--purple-vibrant)',
                          boxShadow: 'var(--shadow-sm)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)', margin: 0 }}>
                                {enq.name}
                              </h4>
                              {!enq.read_status && (
                                <span style={{ background: '#EC4899', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                                  New
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--slate-light)' }}>
                              Received: {new Date(enq.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a
                              href={`https://wa.me/91${cleanPhone.replace(/^91/, '')}?text=Hi%20${encodeURIComponent(enq.name)},%20this%20is%20Chromify%20responding%20to%20your%20enquiry.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-sm"
                              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                            >
                              WhatsApp Reply
                            </a>

                            <a
                              href={`mailto:${enq.email}?subject=Regarding%20your%20Chromify%20enquiry`}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                            >
                              Email Reply
                            </a>

                            <button
                              onClick={() => handleToggleEnquiryRead(enq)}
                              style={{
                                background: '#F1F5F9',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '5px 10px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {enq.read_status ? 'Mark Unread' : 'Mark Read'}
                            </button>

                            <button
                              onClick={() => handleDeleteEnquiry(enq.id)}
                              style={{
                                background: '#FEF2F2',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '5px 10px',
                                color: '#DC2626',
                                cursor: 'pointer'
                              }}
                              title="Delete enquiry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Customer Contact Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.86rem', color: 'var(--slate-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={14} color="#7C3AED" />
                            <strong>{enq.phone}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={14} color="#3B82F6" />
                            <strong>{enq.email}</strong>
                          </span>
                        </div>

                        {/* Message content */}
                        <div style={{ background: '#FAF9F6', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid var(--purple-vibrant)' }}>
                          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--navy-slate)', whiteSpace: 'pre-wrap' }}>
                            {enq.message}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTEGRATION STATUS & SETUP GUIDE */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '8px' }}>
                  Supabase & Database Architecture
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--slate-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Chromify connects to Supabase for cloud products, customer enquiries, photograph storage, and authentication.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div>
                      <strong>Supabase API Keys (.env)</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--slate-muted)' }}>
                        URL & Publishable Key configured
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, background: isConfigured ? '#DCFCE7' : '#FEF3C7', color: isConfigured ? '#15803D' : '#92400E' }}>
                      {isConfigured ? '✓ Connected' : '⚠ Missing .env'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div>
                      <strong>Customer Enquiries Table</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--slate-muted)' }}>
                        Connected to Supabase 'public.enquiries'
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, background: '#DCFCE7', color: '#15803D' }}>
                      ✓ Live in Supabase
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div>
                      <strong>Products Table</strong>
                      <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--slate-muted)' }}>
                        {schemaStatus?.productsTable ? "Table 'public.products' active in Supabase" : "Table 'public.products' pending SQL creation"}
                      </p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, background: schemaStatus?.productsTable ? '#DCFCE7' : '#FEF3C7', color: schemaStatus?.productsTable ? '#15803D' : '#92400E' }}>
                      {schemaStatus?.productsTable ? '✓ Live Cloud DB' : '⚠ Local Persistence Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Safe SQL migration guide */}
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)', marginBottom: '8px' }}>
                  Run Schema Migration in Supabase SQL Editor
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate-muted)', lineHeight: 1.6 }}>
                  To ensure your products table and image storage bucket are created in your cloud Supabase project, open your project at <strong>supabase.com</strong>, click <strong>SQL Editor</strong>, and run the SQL below:
                </p>

                <pre
                  style={{
                    background: '#0F172A',
                    color: '#38BDF8',
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    marginTop: '12px'
                  }}
                >{`-- Run in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC(10, 2),
    price_on_request BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published products"
    ON public.products FOR SELECT TO anon, authenticated
    USING (published = true);

CREATE POLICY "Admin full access to products"
    ON public.products FOR ALL TO authenticated
    USING (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com')
    WITH CHECK (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com');

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Product Add / Edit Modal Drawer */}
        {isFormOpen && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '30px',
                position: 'relative'
              }}
            >
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={formSubmitting}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: formSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close product form"
              >
                <X size={18} />
              </button>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '18px' }}>
                {editingProduct ? `Edit Frame: ${editingProduct.name}` : 'Add New Frame to Catalog'}
              </h3>

              <form onSubmit={handleSaveProduct}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-name">Product Name *</label>
                  <input
                    id="prod-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Minimalist Solid Teak Frame 10x12"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-category">Category *</label>
                  <select
                    id="prod-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-desc">Product Description</label>
                  <textarea
                    id="prod-desc"
                    rows={3}
                    className="form-textarea"
                    placeholder="Describe frame materials, dimensions, wall hanging options and distinctive features..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Price and Price On Request */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="prod-price">Price (₹ INR)</label>
                    <input
                      id="prod-price"
                      type="number"
                      className="form-input"
                      placeholder={formData.price_on_request ? 'Price on Request active' : 'e.g. 1499'}
                      disabled={formData.price_on_request}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div style={{ paddingTop: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={formData.price_on_request}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setFormData({
                            ...formData,
                            price_on_request: checked,
                            price: checked ? '' : formData.price
                          })
                        }}
                      />
                      <span>Set "Price on Request"</span>
                    </label>
                  </div>
                </div>

                {/* Photograph Upload & Preview */}
                <div className="form-group">
                  <label className="form-label">Product Photograph *</label>
                  <div
                    style={{
                      border: imageError ? '2px dashed #EF4444' : '2px dashed #CBD5E1',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px',
                      textAlign: 'center',
                      background: '#F8FAFC'
                    }}
                  >
                    {imagePreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'contain', boxShadow: 'var(--shadow-sm)' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <label
                            htmlFor="photo-upload-input"
                            className="btn btn-secondary btn-sm"
                            style={{ cursor: 'pointer' }}
                          >
                            Change Photograph
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null)
                              setImagePreview('')
                              setFormData({ ...formData, image_url: '' })
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#DC2626' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={28} color="var(--slate-light)" style={{ margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '0.88rem', color: 'var(--slate-muted)', margin: '0 0 10px' }}>
                          Drag & drop or select frame photograph (JPG, PNG, WebP — max 5MB)
                        </p>
                        <label
                          htmlFor="photo-upload-input"
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: 'pointer' }}
                        >
                          Choose Photo File
                        </label>
                      </div>
                    )}
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                  </div>

                  {imageError && (
                    <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '6px' }}>
                      {imageError}
                    </p>
                  )}

                  <div style={{ marginTop: '10px' }}>
                    <label className="form-label" htmlFor="prod-image-url" style={{ fontSize: '0.8rem', color: 'var(--slate-muted)' }}>
                      Or enter image URL / asset path:
                    </label>
                    <input
                      id="prod-image-url"
                      type="text"
                      className="form-input"
                      placeholder="e.g. /images/WhatsApp Image 2026-10-16 at 1.jpeg or https://..."
                      value={formData.image_url}
                      onChange={(e) => {
                        const url = e.target.value
                        setFormData({ ...formData, image_url: url })
                        if (!imageFile && url) {
                          setImagePreview(url)
                        }
                      }}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Published Checkbox */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    />
                    <span>Publish product to live visitors immediately</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    id="admin-submit-product-btn"
                    disabled={formSubmitting}
                    className="btn btn-primary"
                    style={{ flexGrow: 1, justifyContent: 'center' }}
                  >
                    {formSubmitting ? (
                      <span>{editingProduct ? 'Updating...' : 'Saving...'}</span>
                    ) : (
                      <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={formSubmitting}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
