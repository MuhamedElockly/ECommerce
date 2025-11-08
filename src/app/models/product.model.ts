export interface Product {
  id: number;
  name: string;
  productCode: string;
  price: number;
  category: string;
  imageUrl: string;
  quantity: number;
 
}

export interface CreateProductRequest {
  name: string;
  productCode: string;
  price: number;
  category: string;
  image: File;
  quantity: number;
}

export interface UpdateProductRequest {
  id: number;
  name?: string;
  productCode?: string;
  price?: number;
  category?: string;
  image?: File;
  quantity?: number;
}

