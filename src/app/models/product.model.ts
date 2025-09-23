export interface Product {
  id: number;
  name: string;
  productCode: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
 
}

export interface CreateProductRequest {
  name: string;
  productCode: string;
  price: number;
  category: string;
  image: File;
  stock: number;
}

export interface UpdateProductRequest {
  id: number;
  name?: string;
  productCode?: string;
  price?: number;
  category?: string;
  image?: File;
  stock?: number;
  isActive?: boolean;
}

