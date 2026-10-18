-- ==========================================================
-- CHROMIFY — Premium Photo Frames & Decorative Frames
-- Supabase Database Schema & Row Level Security (RLS)
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================
-- 1. PRODUCTS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 200),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~* '^[a-z0-9-]+$'),
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Shadow Box Frames',
        'Wooden Photo Frames',
        'Decorative Frames',
        'Glass Frames',
        'Gallery Sets'
    )),
    price NUMERIC(10, 2) CHECK (price >= 0),
    price_on_request BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================
-- 2. ENQUIRIES TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 120),
    phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 7 AND char_length(phone) <= 25),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    message TEXT NOT NULL CHECK (char_length(trim(message)) >= 5 AND char_length(message) <= 2000),
    product_name TEXT,
    product_id UUID,
    read_status BOOLEAN NOT NULL DEFAULT false,
    status TEXT DEFAULT 'pending',
    status_text TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure backwards-compatible columns exist on existing databases
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS read_status BOOLEAN DEFAULT false;
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS status_text TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_enquiries_read_status ON public.enquiries(read_status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);

-- ==========================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS on both tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------
-- PRODUCTS POLICIES:
-- 1. Public can view only published products
-- 2. Authenticated users (admin) can select, insert, update, delete all products
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (published = true);

DROP POLICY IF EXISTS "Admin full access to products" ON public.products;
CREATE POLICY "Admin full access to products"
    ON public.products
    FOR ALL
    TO authenticated
    USING (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com')
    WITH CHECK (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com');

-- ----------------------------------------------------------
-- ENQUIRIES POLICIES:
-- 1. Anyone (anon/public) can insert an enquiry (anti-spam handled via constraints & frontend checks)
-- 2. Only authorized administrator (chromify30@gmail.com) can read enquiries
-- 3. Only authorized administrator (chromify30@gmail.com) can update enquiry status (mark as read)
-- 4. Only authorized administrator (chromify30@gmail.com) can delete enquiries
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
    ON public.enquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view enquiries" ON public.enquiries;
CREATE POLICY "Admin can view enquiries"
    ON public.enquiries
    FOR SELECT
    TO authenticated
    USING (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com');

DROP POLICY IF EXISTS "Admin can update enquiries" ON public.enquiries;
CREATE POLICY "Admin can update enquiries"
    ON public.enquiries
    FOR UPDATE
    TO authenticated
    USING (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com')
    WITH CHECK (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com');

DROP POLICY IF EXISTS "Admin can delete enquiries" ON public.enquiries;
CREATE POLICY "Admin can delete enquiries"
    ON public.enquiries
    FOR DELETE
    TO authenticated
    USING (lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com');

-- ==========================================================
-- 4. SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
-- ==========================================================
-- Insert 'product-images' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'product-images');

-- Storage RLS: Only authorized administrator can upload images
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' AND
        lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com'
    );

-- Storage RLS: Only authorized administrator can update/delete images
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
CREATE POLICY "Admin can update product images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'product-images' AND
        lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com'
    );

DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'product-images' AND
        lower(auth.jwt() ->> 'email') = 'chromify30@gmail.com'
    );

-- ==========================================================
-- 5. INITIAL SEED DATA (Chromify 17 Products)
-- ==========================================================
-- Insert initial products mapping to the 17 existing photographs
INSERT INTO public.products (name, slug, description, category, price, price_on_request, image_url, published)
VALUES
(
    'Illuminated Deep Shadow Box (Ambient Arc)',
    'illuminated-deep-shadow-box',
    'Modern depth-profile shadow box frame in matte black featuring integrated ambient inner arc lighting. Perfect for displaying 3D memorabilia, medals, and precious keepsakes.',
    'Shadow Box Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 1.jpeg',
    true
),
(
    'Minimalist White 3D Shadow Box',
    'minimalist-white-3d-shadow-box',
    'Clean, contemporary white finish shadow box with elevated depth profile and protective front glazing. Adds a modern, airy museum aesthetic to any wall or desk.',
    'Shadow Box Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.0.jpeg',
    true
),
(
    'Signature Matte Black Shadow Box Frame',
    'signature-matte-black-shadow-box',
    'Architectural deep-box profile with ultra-smooth matte black finish. Designed for floating display prints, layered crafts, and precious souvenirs.',
    'Shadow Box Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.02.0.jpeg',
    true
),
(
    'Architectural Precision Shadow Box (Groove Detail)',
    'architectural-precision-shadow-box',
    'Engineered with precision 5mm inner recessed grooves and a dedicated top insertion port for effortless glass positioning and airtight preservation.',
    'Shadow Box Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.02.06 A.jpeg',
    true
),
(
    'Easy Slide-In Glass Shadow Box',
    'easy-slide-in-glass-shadow-box',
    'Innovative top-loading slide-in glass mechanism allows quick photo or object swapping without disassembling the backboard. Premium matte black border.',
    'Shadow Box Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.02.06 AM.jpeg',
    true
),
(
    'Heavy-Duty Backing Shadow Box Frame',
    'heavy-duty-backing-shadow-box',
    'Engineered with eco-friendly smooth backing, multi-point rotary securing clips, and heavy-duty pre-installed brass wall hanging bracket.',
    'Shadow Box Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.02.07.jpeg',
    true
),
(
    'Heritage Solid Teak Wooden Frame Trio',
    'heritage-solid-teak-frame-trio',
    'Complete three-piece handcrafted natural wood photo frame set. Features organic wood grain variations, bevelled edges, and timeless warmth.',
    'Gallery Sets',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03..jpeg',
    true
),
(
    'Artisanal Handcrafted Wooden Wall Clock',
    'artisanal-handcrafted-wooden-wall-clock',
    'Statement decorative timepiece handcrafted from solid seasoned timber with sculpted solid wood clock hands and inset hour markers. Functional art for modern interiors.',
    'Decorative Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.24 AM0.jpeg',
    true
),
(
    'Geometric Wooden Triangle Shelf & Easel Stand',
    'geometric-wooden-triangle-shelf-easel',
    'Handmade architectural wooden triangular display shelf and frame support bracket. Ideal for standing table frames, books, and decorative accents.',
    'Decorative Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.24 AM00.jpeg',
    true
),
(
    'Artisan Solid Wood Frame Moulding',
    'artisan-solid-wood-frame-moulding',
    'Hand-inspected solid wood moulding showing exquisite natural grain, mitred corner joints, and silk-touch satin lacquer finish.',
    'Wooden Photo Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.24 AM000.jpeg',
    true
),
(
    'Standard Gallery Dimension Set (6x8, 8x12, 12x18)',
    'standard-gallery-dimension-set',
    'Our core sizing lineup showing the three most popular frame proportions: 6x8 inch compact, 8x12 inch portrait, and 12x18 inch statement wall piece.',
    'Gallery Sets',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.25 AM0000.jpeg',
    true
),
(
    'Classic Natural Wood Photo Frame 6x8"',
    'classic-natural-wood-frame-6x8',
    'Compact desktop and bedside table frame crafted from solid polished wood. Fits standard 6x8 photographs or artwork.',
    'Wooden Photo Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.25 AM000000.jpeg',
    true
),
(
    'Grand Gallery Teak Wood Frame 12x18"',
    'grand-gallery-teak-wood-frame-12x18',
    'Large format wooden frame designed for family portraits, fine art prints, and landscape photography. Hand-rubbed natural finish.',
    'Wooden Photo Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.28 AM00000.jpeg',
    true
),
(
    'Medium Portrait Natural Wood Frame 8x12"',
    'medium-portrait-natural-wood-frame-8x12',
    'Versatile 8x12 inch natural wooden frame featuring rich organic grain textures and protective clear glazing. Ideal for portrait displays.',
    'Wooden Photo Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.29 AM0000000.jpeg',
    true
),
(
    'Trilogy Memory Display Wood Frame Collection',
    'trilogy-memory-display-collection',
    'Curated multi-size wooden frame collection designed to create an instant gallery wall in your living room, corridor, or office space.',
    'Gallery Sets',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.29 AM000000000.jpeg',
    true
),
(
    'Rustic Botanical Natural Wood Frame',
    'rustic-botanical-natural-wood-frame',
    'Crafted from sustainable timber, photographed in pure daylight to accentuate its authentic, warm earth tones and rich surface grain.',
    'Wooden Photo Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at 10.03.30 AM00000000.jpeg',
    true
),
(
    'Fine Art Wooden Frame with Passe-Partout Mat Border',
    'fine-art-wooden-frame-with-mat',
    'Sophisticated natural wood frame with premium archival cream-white mat border that gives photos an elevated, professional gallery aesthetic.',
    'Wooden Photo Frames',
    NULL,
    true,
    '/images/WhatsApp Image 2026-10-16 at.jpeg',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================================
-- 6. EXPLICIT GRANTS FOR ROLES
-- ==========================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;

GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
