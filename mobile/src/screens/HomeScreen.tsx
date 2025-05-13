import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ProductItem from '../components/ProductItem';
import { getProducts } from '../services/productService';
import { Product } from '../models/Product';
import { useAuth } from '../context/AuthContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { logout } = useAuth();

  useEffect(() => {
    loadProducts();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadProducts();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się załadować produktów');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleLogout = () => {
    Alert.alert(
      'Wylogowanie',
      'Czy na pewno chcesz się wylogować?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Wyloguj', onPress: logout },
      ]
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Wyloguj</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2E8B57" style={styles.loader} />
      ) : (
        <>
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Brak produktów na liście zakupów</Text>
              <Text style={styles.emptySubtext}>Dodaj swój pierwszy produkt</Text>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={({ item }) => (
                <ProductItem 
                  product={item} 
                  onPress={handleProductPress} 
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
            />
          )}
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddProduct}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loader: {
    flex: 1,
  },
  list: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2E8B57',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    fontSize: 32,
    color: 'white',
  },
  logoutButton: {
    marginRight: 15,
  },
  logoutText: {
    color: '#d9534f',
    fontSize: 16,
  },
});

export default HomeScreen;