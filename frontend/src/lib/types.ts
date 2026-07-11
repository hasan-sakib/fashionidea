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
  price: string | null
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

export interface MarketplaceLook {
  id: string
  title: string
  description: string | null
  image_url: string
  price: string | null
  created_at: string
  designer: DesignerRef
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
  looks: MarketplaceLook[]
}
