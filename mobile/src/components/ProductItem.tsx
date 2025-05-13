import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Product } from '../models/Product';

interface ProductItemProps {
  product: Product;
  onPress: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(product)}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toFixed(2)} zł</Text>
        <Text style={styles.quantity}>Ilość: {product.quantity}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#2E8B57',
    marginBottom: 5,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  }
});

export default ProductItem;