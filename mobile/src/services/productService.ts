import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../models/Product';

const PRODUCTS_STORAGE_KEY = '@products';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsJson = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (productsJson) {
      return JSON.parse(productsJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const products = await getProducts();
    return products.find(product => product.id === id) || null;
  } catch (error) {
    console.error('Error getting product by id:', error);
    return null;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const products = await getProducts();
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    
    await AsyncStorage.setItem(
      PRODUCTS_STORAGE_KEY,
      JSON.stringify([...products, newProduct])
    );
    
    return newProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product');
  }
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
  try {
    const products = await getProducts();
    const updatedProducts = products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    );
    
    await AsyncStorage.setItem(
      PRODUCTS_STORAGE_KEY,
      JSON.stringify(updatedProducts)
    );
    
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const products = await getProducts();
    const filteredProducts = products.filter(product => product.id !== id);
    
    await AsyncStorage.setItem(
      PRODUCTS_STORAGE_KEY,
      JSON.stringify(filteredProducts)
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};