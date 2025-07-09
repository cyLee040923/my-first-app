import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { StatusBar } from 'expo-status-bar';

const baseUrl = 'https://randomfood-fud5b8cmeqh6gpbr.eastasia-01.azurewebsites.net';

const districts = ['All', 'Central', 'Wan Chai', 'Tsim Sha Tsui', 'Mong Kok', 'Shatin', 'Tsuen Wan', 'Yuen Long', 'Tuen Mun'];
const foodStyles = ['Chinese', 'Western', 'Japanese', 'Korean', 'Thai', 'Indian'];

const priceRanges = [
  { label: 'All', value: 'All' },
  { label: '≤ $100', value: '100' },
  { label: '≤ $150', value: '150' },
  { label: '≤ $200', value: '200' },
  { label: '≤ $300', value: '300' },
];

const Random = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
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
  const [randomResult, setRandomResult] = useState(null);

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  // Fetch restaurants from backend with filters and pick a random one
  const handleRandom = async () => {
    try {
      // Build query params
      const params = [];
      if (selectedDistrict && selectedDistrict !== 'All') params.push(`district=${encodeURIComponent(selectedDistrict)}`);
      if (selectedPrice && selectedPrice !== 'All') params.push(`price=${encodeURIComponent(selectedPrice)}`);
      if (selectedStyles.length > 0) params.push(`foodStyles=${encodeURIComponent(selectedStyles.join(','))}`);
      const query = params.length > 0 ? `?${params.join('&')}` : '';

      const response = await fetch(`${baseUrl}/api/restaurants${query}`);
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setRandomResult('No restaurant matches your filter.');
      } else {
        const idx = Math.floor(Math.random() * data.length);
        setRandomResult(data[idx].restaurant || data[idx].name || '-');
      }
    } catch (error) {
      setRandomResult('Network error.');
    }
  };

  const handleClear = () => {
    setSelectedDistrict('All');
    setSelectedPrice('All');
    setSelectedStyles([]);
    setRandomResult(null);
  };

  // Ensure only one dropdown is open at a time
  const onDistrictOpen = () => setPriceOpen(false);
  const onPriceOpen = () => setDistrictOpen(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.label}>Filter by District:</Text>
      <DropDownPicker
        open={districtOpen}
        value={selectedDistrict}
        items={districtItems}
        setOpen={setDistrictOpen}
        setValue={setSelectedDistrict}
        setItems={setDistrictItems}
        containerStyle={{ marginBottom: 10 }}
        onOpen={onDistrictOpen}
        zIndex={3000}
        zIndexInverse={1000}
        listMode="SCROLLVIEW"
      />

      <Text style={styles.label}>Filter by Price:</Text>
      <DropDownPicker
        open={priceOpen}
        value={selectedPrice}
        items={priceItems}
        setOpen={setPriceOpen}
        setValue={setSelectedPrice}
        setItems={setPriceItems}
        containerStyle={{ marginBottom: 10 }}
        onOpen={onPriceOpen}
        zIndex={2000}
        zIndexInverse={2000}
        listMode="SCROLLVIEW"
      />

      <Text style={styles.label}>Filter by Food Style:</Text>
      {foodStyles.map(style => (
        <TouchableOpacity
          key={style}
          style={styles.checkboxContainer}
          onPress={() => toggleStyle(style)}
        >
          <View style={styles.customCheckbox}>
            {selectedStyles.includes(style) && <View style={styles.checked} />}
          </View>
          <Text style={styles.checkboxLabel}>{style}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={styles.button} onPress={handleRandom}>
          <Text style={styles.buttonText}>Pick Random Restaurant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
          <Text style={[styles.buttonText, { color: '#1fb28a' }]}>Clear Filter</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.resultLabel}>Result:</Text>
      <Text style={styles.resultText}>{randomResult ? randomResult : '-'}</Text>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 15,
  },
  customCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#1fb28a',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#1fb28a',
    borderRadius: 2,
  },
  button: {
    backgroundColor: '#1fb28a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',        
    justifyContent: 'center',    
    marginVertical: 20,
    flex: 1,
    marginRight: 5,
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1fb28a',
    marginLeft: 5,
    marginRight: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center', 
  },
  resultLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  resultText: {
    fontSize: 18,
    color: '#1a9274',
    minHeight: 30,
  },
});

export default Random;
