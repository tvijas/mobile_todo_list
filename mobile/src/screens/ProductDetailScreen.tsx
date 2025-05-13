import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getProductById, deleteProduct } from '../services/productService';
import { Product } from '../models/Product';

type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
type ProductDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetails'>;

const ProductDetailsScreen = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const route = useRoute<ProductDetailsRouteProp>();
  const navigation = useNavigation<ProductDetailsNavigationProp>();
  const { productId } = route.params;

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      const productData = await getProductById(productId);
      setProduct(productData);
      
      if (productData) {
        navigation.setOptions({
          title: productData.name,
        });
      }
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się załadować szczegółów produktu');
      console.error('Error loading product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Usuń produkt',
      'Czy na pewno chcesz usunąć ten produkt z listy zakupów?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Usuń', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteProduct(productId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Błąd', 'Nie udało się usunąć produktu');
              console.error('Error deleting product:', error);
              setLoading(false);
            }
          } 
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Nie znaleziono produktu</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Wróć do listy</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price.toFixed(2)} zł</Text>
        </View>
        
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Ilość:</Text>
          <Text style={styles.quantityValue}>{product.quantity}</Text>
        </View>
        
        {product.description ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Opis:</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        ) : null}
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Usuń produkt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  backButton: {
    backgroundColor: '#2E8B57',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 18,
    color: '#666',
    marginRight: 5,
  },
  quantityValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  descriptionLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
},
deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
},
});
export default ProductDetailsScreen;