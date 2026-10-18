import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Collections from './components/Collections'
import Gallery from './components/Gallery'
import WhyChooseUs from './components/WhyChooseUs'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Lightbox from './components/Lightbox'
import EnquiryModal from './components/EnquiryModal'
import AdminLoginModal from './components/AdminLoginModal'
import AdminDashboard from './components/AdminDashboard'
import { MessageCircle } from 'lucide-react'
import { BUSINESS_INFO, INITIAL_PRODUCTS } from './lib/productsData'
import { fetchPublishedProducts, checkCurrentAdminSession, supabase, ADMIN_EMAIL } from './lib/supabaseClient'

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [enquiryProduct, setEnquiryProduct] = useState(null)
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false)
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false)
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false)
  const [adminSession, setAdminSession] = useState(null)

  // Load published products and maintain live Supabase auth session
  useEffect(() => {
    loadProducts()
    checkSession()

    // Real Supabase Auth listener across tabs and reloads
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setAdminSession(session)
      } else {
        checkSession()
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadProducts = async () => {
    try {
      const liveProducts = await fetchPublishedProducts()
      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts)
      }
    } catch (e) {
      console.warn('Failed to load live products:', e)
    }
  }

  const checkSession = async () => {
    try {
      const session = await checkCurrentAdminSession()
      if (session) {
        setAdminSession(session)
      }
    } catch (e) {
      console.warn('Session check error:', e)
    }
  }

  // Handle Admin Button Click
  const handleOpenAdmin = () => {
    if (adminSession) {
      setIsAdminDashboardOpen(true)
    } else {
      setIsAdminLoginOpen(true)
    }
  }

  // Handle Login Success
  const handleLoginSuccess = (session) => {
    setAdminSession(session)
    setIsAdminDashboardOpen(true)
  }

  const handleAdminLogout = () => {
    setAdminSession(null)
    setIsAdminDashboardOpen(false)
  }

  // Lightbox Handlers
  const handleOpenLightbox = (imageUrl, name, description, index) => {
    const list = products && products.length > 0 ? products : INITIAL_PRODUCTS
    let finalIdx = index
    if (finalIdx === undefined || finalIdx === null || finalIdx < 0) {
      const found = list.findIndex((p) => p.image_url === imageUrl || p.name === name)
      finalIdx = found >= 0 ? found : 0
    }
    const currentItem = list[finalIdx] || { image_url: imageUrl, name, description }
    setLightboxPhoto({
      image_url: imageUrl || currentItem.image_url,
      name: name || currentItem.name,
      description: description || currentItem.description,
      category: currentItem.category
    })
    setLightboxIndex(finalIdx)
  }

  const handleNextPhoto = () => {
    const list = products && products.length > 0 ? products : INITIAL_PRODUCTS
    if (!list.length) return
    const nextIdx = (lightboxIndex + 1) % list.length
    const nextItem = list[nextIdx]
    setLightboxIndex(nextIdx)
    setLightboxPhoto({
      image_url: nextItem.image_url,
      name: nextItem.name,
      description: nextItem.description,
      category: nextItem.category
    })
  }

  const handlePrevPhoto = () => {
    const list = products && products.length > 0 ? products : INITIAL_PRODUCTS
    if (!list.length) return
    const prevIdx = (lightboxIndex - 1 + list.length) % list.length
    const prevItem = list[prevIdx]
    setLightboxIndex(prevIdx)
    setLightboxPhoto({
      image_url: prevItem.image_url,
      name: prevItem.name,
      description: prevItem.description,
      category: prevItem.category
    })
  }

  // Open Enquiry Modal
  const handleOpenEnquiry = (product) => {
    setEnquiryProduct(product)
    setIsEnquiryModalOpen(true)
  }

  // Smooth scroll helper
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="chromify-app">
      {/* 1. Navbar */}
      <Navbar
        onOpenAdmin={handleOpenAdmin}
        onOpenEnquiry={() => handleOpenEnquiry(null)}
      />

      {/* 2. Hero Section */}
      <Hero
        onExploreClick={() => scrollTo('collections')}
        onDiscoverClick={() => scrollTo('about')}
        onContactClick={() => scrollTo('contact')}
        onSelectPhoto={(idx) => {
          const item = INITIAL_PRODUCTS[idx]
          if (item) {
            handleOpenLightbox(item.image_url, item.name, item.description, idx)
          }
        }}
      />

      {/* 3. About Section */}
      <About onExploreClick={() => scrollTo('collections')} />

      {/* 4. Product Collections Section */}
      <Collections
        products={products}
        onSelectProduct={handleOpenEnquiry}
        onOpenEnquiry={handleOpenEnquiry}
        onOpenLightbox={handleOpenLightbox}
      />

      {/* 5. 17 Photographs Gallery Section */}
      <Gallery onOpenLightbox={handleOpenLightbox} />

      {/* 6. Why Choose Us Section */}
      <WhyChooseUs
        onExploreClick={() => scrollTo('collections')}
        onContactClick={() => scrollTo('contact')}
      />

      {/* 7. Contact Section */}
      <Contact prefilledProduct={enquiryProduct} />

      {/* 8. Footer */}
      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* Floating Fast WhatsApp Button */}
      <a
        href={BUSINESS_INFO.whatsappBase}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '26px',
          right: '26px',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          zIndex: 900,
          cursor: 'pointer',
          transition: 'all 240ms ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
        aria-label="Direct WhatsApp Enquiry"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={30} />
      </a>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={Boolean(lightboxPhoto)}
        photo={lightboxPhoto}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
        onClose={() => setLightboxPhoto(null)}
      />

      {/* Product Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        product={enquiryProduct}
        onClose={() => {
          setIsEnquiryModalOpen(false)
          setEnquiryProduct(null)
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        session={adminSession}
        onClose={() => setIsAdminDashboardOpen(false)}
        onLogout={handleAdminLogout}
        onRefreshPublicProducts={loadProducts}
      />
    </div>
  )
}
