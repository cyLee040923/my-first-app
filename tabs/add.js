import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import DropDownPicker from 'react-native-dropdown-picker';

const baseUrl = 'http://192.168.11.37:4000'; 

const foodStyles = ['Chinese', 'Western', 'Japanese', 'Korean', 'Thai', 'Indian'];
const districts = [
  'Central', 'Wan Chai', 'Tsim Sha Tsui', 'Mong Kok', 'Shatin', 'Tsuen Wan', 'Yuen Long', 'Tuen Mun'
];

const Add = () => {
  const [restaurant, setRestaurant] = useState('');
  const [price, setPrice] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [rating, setRating] = useState(0);

  // DropDownPicker state for district
  const [districtOpen, setDistrictOpen] = useState(false);
  const [district, setDistrict] = useState(null);
  const [districtItems, setDistrictItems] = useState(
    districts.map(d => ({ label: d, value: d }))
  );

  const [restaurantError, setRestaurantError] = useState('');
  const [districtError, setDistrictError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [stylesError, setStylesError] = useState('');

  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  // Helper to render stars
  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Text style={i <= rating ? styles.starSelected : styles.starUnselected}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const handleRestaurantChange = (text) => {
    setRestaurant(text);
    if (text.trim() === '') {
      setRestaurantError('Restaurant name is required');
    } else {
      setRestaurantError('');
    }
  };

  const handleDistrictChange = (value) => {
    setDistrict(value);
    if (!value) {
      setDistrictError('District is required');
    } else {
      setDistrictError('');
    }
  };

  const handlePriceChange = (value) => {
    setPrice(value);
    if (value <= 0) {
      setPriceError('Price is required');
    } else {
      setPriceError('');
    }
  };

  const handleRatingChange = (value) => {
    setRating(value);
    if (value <= 0) {
      setRatingError('Rating is required');
    } else {
      setRatingError('');
    }
  };

  const save = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant,
          district,
          price,
          rating,
          selectedStyles,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Restaurant added!');
        // Reset form after successful submission
        setRestaurant('');
        setDistrict(null);
        setPrice(0);
        setRating(0);
        setSelectedStyles([]);
      } else {
        alert(data.error || 'Failed to add restaurant.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleSubmit = () => {
    let valid = true;
    if (restaurant.trim() === '') {
      setRestaurantError('Restaurant name is required');
      valid = false;
    }
    if (!district) {
      setDistrictError('District is required');
      valid = false;
    }
    if (price <= 0) {
      setPriceError('Price is required');
      valid = false;
    }
    if (rating <= 0) {
      setRatingError('Rating is required');
      valid = false;
    }
    if (selectedStyles.length === 0) {
      setStylesError('At least one food style is required');
      valid = false;
    } else {
      setStylesError('');
    }
    if (!valid) return;
    save();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Card at the top */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Selection</Text>
        <Text style={styles.cardText}>Restaurant: {restaurant || '-'}</Text>
        <Text style={styles.cardText}>District: {district || '-'}</Text>
        <Text style={styles.cardText}>Price: ${price}</Text>
        <Text style={styles.cardText}>Rating: </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          {[1,2,3,4,5].map(i => (
            <Text
              key={i}
              style={i <= rating ? styles.starSelected : styles.starUnselected}
            >
              ★
            </Text>
          ))}
          {rating === 0 && <Text style={styles.cardText}>-</Text>}
        </View>
        <Text style={styles.cardText}>Food Styles: {selectedStyles.length > 0 ? selectedStyles.join(', ') : '-'}</Text>
      </View>

      {/* Scrollable form */}
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        <Text style={styles.label}>Restaurant Name:</Text>
        <TextInput
          style={[styles.input, restaurantError ? styles.inputError : null]}
          placeholder="Enter restaurant name"
          value={restaurant}
          onChangeText={handleRestaurantChange}
          onBlur={() => {
            if (restaurant.trim() === '') setRestaurantError('Restaurant name is required');
          }}
        />
        {restaurantError ? <Text style={styles.errorText}>{restaurantError}</Text> : null}

        <Text style={styles.label}>District:</Text>
        <DropDownPicker
          open={districtOpen}
          value={district}
          items={districtItems}
          setOpen={setDistrictOpen}
          setValue={handleDistrictChange}
          setItems={setDistrictItems}
          placeholder="Select a district"
          style={[styles.picker, districtError ? styles.inputError : null]}
          dropDownContainerStyle={{ zIndex: 1000 }}
          zIndex={1000}
          listMode="SCROLLVIEW"
        />
        {districtError ? <Text style={styles.errorText}>{districtError}</Text> : null}

        <Text style={styles.label}>Select Price: ${price}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={500}
          step={50}
          value={price}
          onValueChange={handlePriceChange}
          minimumTrackTintColor="#1fb28a"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1a9274"
        />
        {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

        <Text style={styles.label}>Rate (1-5 stars):</Text>
        <View style={styles.starsRow}>
          {[1,2,3,4,5].map(i => (
            <TouchableOpacity key={i} onPress={() => handleRatingChange(i)}>
              <Text style={i <= rating ? styles.starSelected : styles.starUnselected}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {ratingError ? <Text style={styles.errorText}>{ratingError}</Text> : null}

        <Text style={styles.label}>Food Styles:</Text>
        {foodStyles.map((style) => (
          <TouchableOpacity
            key={style}
            style={styles.checkboxContainer}
            onPress={() => {
              toggleStyle(style);
              if (selectedStyles.length === 0) setStylesError('');
            }}
          >
            <View style={styles.customCheckbox}>
              {selectedStyles.includes(style) && <View style={styles.checked} />}
            </View>
            <Text style={styles.checkboxLabel}>{style}</Text>
          </TouchableOpacity>
        ))}
        {stylesError ? <Text style={styles.errorText}>{stylesError}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save!</Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginBottom: 0,
    elevation: 3,
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
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
    marginTop: -5,
  },
  picker: {
    width: '100%',
    minHeight: 44,
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
  starsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 5,
  },
  starSelected: {
    fontSize: 32,
    color: '#FFD700',
    marginHorizontal: 2,
  },
  starUnselected: {
    fontSize: 32,
    color: '#ccc',
    marginHorizontal: 2,
  },
  button: {
    backgroundColor: '#1fb28a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Add;



