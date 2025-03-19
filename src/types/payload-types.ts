export interface SiteSettings {
  id: string;
  logos: {
    header?: Media | string | null;
    footer?: Media | string | null;
  };
  defaultMeta: {
    title: string;
    description: string;
    image?: Media | string | null;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  updatedAt: string;
  createdAt: string;
}