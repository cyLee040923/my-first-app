import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Dimensions, Linking } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const baseUrl = 'http://192.168.11.37:4000';

const districts = ['Central', 'Wan Chai', 'Tsim Sha Tsui', 'Mong Kok', 'Shatin', 'Tsuen Wan', 'Yuen Long', 'Tuen Mun'];
const foodStyles = ['Chinese', 'Western', 'Japanese', 'Korean', 'Thai', 'Indian'];
const priceRanges = [
  { label: 'All', value: 'All' },
  { label: '≤ $100', value: '100' },
  { label: '≤ $150', value: '150' },
  { label: '≤ $200', value: '200' },
  { label: '≤ $300', value: '300' },
];

const PAGE_SIZE = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;

const Restaurants = () => {
  // Filters
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districtItems, setDistrictItems] = useState(
    districts.map(d => ({ label: d, value: d }))
  );

  const [selectedPrice, setSelectedPrice] = useState('All');
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceItems, setPriceItems] = useState(
    priceRanges.map(p => ({ label: p.label, value: p.value }))
  );

  const [selectedStyles, setSelectedStyles] = useState([]);
  const [search, setSearch] = useState('');

  // Data & Pagination
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch restaurants from backend with filters
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = [];
      if (selectedDistricts.length > 0) params.push(`district=${encodeURIComponent(selectedDistricts.join(','))}`);
      if (selectedPrice && selectedPrice !== 'All') params.push(`price=${encodeURIComponent(selectedPrice)}`);
      if (selectedStyles.length > 0) params.push(`foodStyles=${encodeURIComponent(selectedStyles.join(','))}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';
      const response = await fetch(`${baseUrl}/api/restaurants${query}`);
      const data = await response.json();
      setRestaurants(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) {
      setRestaurants([]);
    }
    setLoading(false);
  };

  // Filtering by search
  useEffect(() => {
    let filteredData = restaurants;
    if (search.trim() !== '') {
      filteredData = filteredData.filter(r =>
        r.restaurant && r.restaurant.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    setFiltered(filteredData);
    setPage(1);
  }, [search, restaurants]);

  // Fetch on filter change
  useEffect(() => {
    fetchRestaurants();
  }, [selectedDistricts, selectedPrice, selectedStyles]);

  // Pagination
  const pagedData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Only one dropdown open at a time
  const onDistrictOpen = () => setPriceOpen(false);
  const onPriceOpen = () => setDistrictOpen(false);

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const openGoogleMaps = (restaurantName) => {
    const encodedName = encodeURIComponent(restaurantName);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
    Linking.openURL(mapsUrl);
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.restaurant}</Text>
      <Text style={styles.cardText}>District: {item.district}</Text>
      <Text style={styles.cardText}>Price: ${item.price}</Text>
      <Text style={styles.cardText}>
        Rating: {[1,2,3,4,5].map(i => (
          <Text key={i} style={i <= item.rating ? styles.starSelected : styles.starUnselected}>★</Text>
        ))}
        {item.rating === 0 && <Text style={styles.cardText}>-</Text>}
      </Text>
      <Text style={styles.cardText}>Food Styles: {item.foodStyles && item.foodStyles.length > 0 ? item.foodStyles.join(', ') : '-'}</Text>
      <TouchableOpacity
        style={styles.mapsButton}
        onPress={() => openGoogleMaps(item.restaurant)}
      >
        <Text style={styles.mapsButtonText}>View on Google Maps</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name"
        value={search}
        onChangeText={setSearch}
      />

      {/* Filtering section */}
      <View style={styles.filterRow}>
        <View style={styles.filterPair}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <DropDownPicker
              multiple={true}
              mode="BADGE"
              min={0}
              max={districts.length}
              open={districtOpen}
              value={selectedDistricts}
              items={districtItems}
              setOpen={setDistrictOpen}
              setValue={setSelectedDistricts}
              setItems={setDistrictItems}
              placeholder="Select district(s)"
              onOpen={onDistrictOpen}
              style={styles.picker}
              containerStyle={{ minHeight: 60 }} // Add this line
              listMode="SCROLLVIEW"
              dropDownContainerStyle={{ zIndex: 3000 }}
              zIndex={3000}
              autoScroll
              showBadgeDot={false}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <DropDownPicker
              open={priceOpen}
              value={selectedPrice}
              items={priceItems}
              setOpen={setPriceOpen}
              setValue={setSelectedPrice}
              setItems={setPriceItems}
              placeholder="Select price"
              onOpen={onPriceOpen}
              style={styles.picker}
              listMode="SCROLLVIEW"
              dropDownContainerStyle={{ zIndex: 2000 }}
              zIndex={2000}
            />
          </View>
        </View>
        {/* Food styles row below the pair */}
        <View style={styles.stylesRow}>
          {foodStyles.map(style => (
            <TouchableOpacity
              key={style}
              style={[
                styles.styleButton,
                selectedStyles.includes(style) && styles.styleButtonSelected,
              ]}
              onPress={() => toggleStyle(style)}
            >
              <Text
                style={[
                  styles.styleButtonText,
                  selectedStyles.includes(style) && styles.styleButtonTextSelected,
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1fb28a" style={{ marginTop: 20 }} />
      ) : (
        <>
          <FlatList
            data={pagedData}
            renderItem={renderCard}
            keyExtractor={item => item._id || Math.random().toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 30 }}>No restaurants found.</Text>}
          />
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Text style={styles.pageButtonText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>{page} / {totalPages || 1}</Text>
            <TouchableOpacity
              style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
              onPress={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <Text style={styles.pageButtonText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1fb28a',
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filterRow: {
    flexDirection: 'column', 
    width: '100%',
    marginBottom: 10,
    minHeight: 120,
  },
  filterPair: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
  },
  filterColumn: {
    width: SCREEN_WIDTH / 3,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  stylesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  styleButton: {
    borderWidth: 1,
    borderColor: '#1fb28a',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 4,
    backgroundColor: '#fff',
  },
  styleButtonSelected: {
    backgroundColor: '#1fb28a',
  },
  styleButtonText: {
    color: '#1fb28a',
    fontWeight: 'bold',
  },
  styleButtonTextSelected: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 18,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#1fb28a',
  },
  cardText: {
    fontSize: 15,
    marginBottom: 2,
    color: '#333',
  },
  starSelected: {
    fontSize: 18,
    color: '#FFD700',
    marginHorizontal: 1,
  },
  starUnselected: {
    fontSize: 18,
    color: '#ccc',
    marginHorizontal: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  pageButton: {
    padding: 8,
    marginHorizontal: 10,
    backgroundColor: '#1fb28a',
    borderRadius: 6,
  },
  pageButtonDisabled: {
    backgroundColor: '#b2dfd5',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1fb28a',
  },
  mapsButton: {
    marginTop: 8,
    backgroundColor: '#4285F4',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  mapsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Restaurants;