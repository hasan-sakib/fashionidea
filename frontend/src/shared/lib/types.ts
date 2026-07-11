// Shared API types (mirror the backend Pydantic schemas).

export type UserRole = "designer" | "consumer" | "admin"
export type InquiryStatus = "new" | "read" | "archived"

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  tenant_id: string | null
  is_active: boolean
  measurements: Record<string, unknown> | null
}

export interface Collection {
  id: string
  title: string
  description: string | null
  season: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Look {
  id: string
  title: string
  description: string | null
  image_url: string
  category: string | null
  occasions: string[]
  tags: string[]
  collection_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  sender_name: string
  sender_email: string
  message: string
  status: InquiryStatus
  look_id: string | null
  created_at: string
}

export interface Page<T> {
  data: T[]
  count: number
}

export interface DesignerRef {
  slug: string
  name: string
}

/** A published design in the public feed (no price — this is a showcase). */
export interface DiscoverLook {
  id: string
  title: string
  description: string | null
  image_url: string
  category: string | null
  occasions: string[]
  tags: string[]
  created_at: string
  designer: DesignerRef
}

export interface DesignerCard {
  slug: string
  name: string
  look_count: number
  cover_image: string | null
}

export interface Lookbook {
  id: string
  title: string
  season: string | null
  designer: DesignerRef
  preview_images: string[]
}

export interface SearchResults {
  designers: DesignerCard[]
  looks: DiscoverLook[]
  occasions: string[]
  categories: string[]
}

export interface Moodboard {
  id: string
  name: string
  item_count: number
  created_at: string
  updated_at: string
}

export interface MoodboardDetail {
  id: string
  name: string
  created_at: string
  updated_at: string
  looks: DiscoverLook[]
}
