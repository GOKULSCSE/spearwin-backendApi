export interface TestimonialResponseDto {
  id: number;
  name: string;
  title?: string | null;
  company?: string | null;
  content: string;
  rating?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestimonialListResponseDto {
  testimonials: TestimonialResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statistics: {
    totalTestimonials: number;
    activeTestimonials: number;
    inactiveTestimonials: number;
    averageRating: number;
  };
}
