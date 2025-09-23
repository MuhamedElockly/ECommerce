export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
}

export interface UpdateCategoryDTO {
  id: number;
  name: string;
  description: string;
}

export interface CategoryResponseDTO {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  name: string;
  PCode: string;
  price: number;
  categoryId: number;
  stock: number;
}

export interface UpdateProductDTO {
  id: number;
  name: string;
  PCode: string;
  price: number;
  categoryId: number;
  stock: number;
}

export interface ProductResponseDTO {
  id: number;
  name: string;
  pCode: string;
  price: number;
  categoryId: number;
  categoryName: string | null;
  imageUrl: string;
  quantity: number;
  discountRate: number;
  finalPrice: number;
 
}
