import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/core';
import * as ImagePicker from 'expo-image-picker';
import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DB_NAME } from '../../App';
import LoadingOverlay from '../../components/LoadingOverlay';
import MainButton from '../../components/MainButton';
import MainTextInput from '../../components/MainTextInput';
import SlideupModal from '../../components/SlideupModal/SlideupModal';
import {
  DataType,
  getDataByField,
  insertData,
  addData,
  updateData,
} from '../../database/propertyDto';
import { MainRoutes } from '../../routing';
import { formatDateAndTime } from '../../utils';

const AddOrEditScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { type, id } = useRoute().params;
  const [valid, setValid] = useState(false);
  const [data, setData] = useState({
    propertyType: '',
    bedrooms: '',
    dateTime: '',
    monthlyRentPrice: '',
    reporterName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mode, setMode] = useState('date');
  const [showPicker, setShowPicker] = useState(false);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: type === 'add' ? 'Add Property' : 'Edit Property',
    });

    if (type === 'edit') {
      getDataByField(DB_NAME, 'id', id).then(data => {
        setData({
          ...data[0],
          monthlyRentPrice: data[0].monthlyRentPrice.toString(),
          bedrooms: data[0].bedrooms.toString(),
        });
      });
    }
  }, [navigation]);

  useEffect(() => {
    if (
      data.propertyType &&
      data.bedrooms &&
      data.dateTime &&
      data.monthlyRentPrice &&
      data.reporterName
    ) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [data]);

  const showDatePickerHandler = useCallback(currentMode => {
    setShowDatePicker(true);
    setMode(currentMode);
  }, []);

  const onSubmit = async () => {
    if (type === 'edit') {
      setIsLoading(true);

      try {
        const result = await updateData(DB_NAME, parseInt(id), data);
        setIsLoading(false);
        if (result) {
          Alert.alert(
            'Success',
            'Property updated successfully',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.goBack();
                },
              },
            ],
            { cancelable: false },
          );
        }
      } catch (error) {
        setIsLoading(false);
        Alert.alert(
          'Error',
          'Something went wrong',
          [
            {
              text: 'OK',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
      }

      return;
    }

    if (type === 'add') {
      setIsLoading(true);
      const res = await getDataByField(
        DB_NAME,
        'property_type',
        data.propertyType,
      );

      if (res.length > 0) {
        setIsLoading(false);
        Alert.alert(
          `Property ${data.propertyType} is already exists`,
          '',
          [
            {
              text: 'OK',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
        return;
      }

      const adddata = await addData(DB_NAME, data);

      if (adddata) {
        setIsLoading(false);
        Alert.alert(
          'Success',
          'Inserted Successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert(
          'Error',
          'Inserted Failed',
          [
            {
              text: 'OK',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
      }
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior='padding'
        style={[styles.container, { marginBottom: insets.bottom }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <MainTextInput
            placeholder={'example flat, house'}
            label={'Property type'}
            validRegExp={/^(?!\s*$).+/}
            errorText={'This input field cannot be left blank'}
            onChangeText={propertyType => {
              setData({ ...data, propertyType });
            }}
            value={data.propertyType}
            isRequired
          />
          <MainTextInput
            placeholder={'example 1, 2'}
            label={'Bedrooms'}
            validRegExp={/^([0-9]){1,}$/}
            errorText={'Numeric only and cannot be left blank'}
            onChangeText={bedrooms => {
              setData({ ...data, bedrooms });
            }}
            value={data.bedrooms}
            keyboardType={'numeric'}
            isRequired
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                flex: 1,
              }}>
              <MainTextInput
                placeholder={'e.g. 2021/10/10 7:20'}
                label={'Date & Time'}
                isRequired
                validRegExp={/(\d{4})\-(\d{2})\-(\d{2}) (\d{2}):(\d{2})/}
                errorText={'Please follow [YYYY-MM-DD HH:MM] format'}
                onChangeText={dateTime => {
                  setData({ ...data, dateTime });
                }}
                value={data.dateTime}
              />
              {showDatePicker && (
                <View style={{ paddingRight: 16 }}>
                  <DateTimePicker
                    testID='dateTimePicker'
                    timeZoneOffsetInMinutes={7 * 60}
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display='default'
                    onChange={(event, selectedDate) => {
                      const currentDate = selectedDate || date;
                      setShowDatePicker(Platform.OS === 'ios');
                      setDate(currentDate);
                      setData({
                        ...data,
                        dateTime: formatDateAndTime(currentDate),
                      });
                    }}
                  />
                </View>
              )}
            </View>
            <View style={styles.twoButton}>
              <TouchableHighlight
                style={styles.outlineButton}
                onPress={() => {
                  showDatePickerHandler('date');
                  setData({ ...data, dateTime: formatDateAndTime(date) });
                }}>
                <Text style={styles.setText}>{'Set Date'}</Text>
              </TouchableHighlight>
              <View style={{ marginVertical: 8 }} />
              <TouchableHighlight
                style={styles.outlineButton}
                onPress={() => {
                  showDatePickerHandler('time');
                  setData({ ...data, dateTime: formatDateAndTime(date) });
                }}>
                <Text style={styles.setText}>{'Set Time'}</Text>
              </TouchableHighlight>
            </View>
          </View>
          <MainTextInput
            placeholder={'Example 20000, 500000'}
            label={'Monthly rent price ($/month)'}
            isRequired
            validRegExp={/^[0-9]{1,}$/}
            errorText={'Just enter numeric and\nDo not leave it empty'}
            keyboardType={'numeric'}
            onChangeText={monthlyRentPrice => {
              setData({ ...data, monthlyRentPrice });
            }}
            value={data.monthlyRentPrice}
          />
          <View>
            {/* <MainTextInput
              placeholder={"e.g. Furnished, Unfurnished, etc."}
              label={"Furniture types"}
              onChangeText={(furnitureTypes) => {
                setData({ ...data, furnitureTypes });
              }}
              value={data.furnitureTypes}
              onFocus={() => {
                Alert.alert(
                  "Do you want to choose or add manualy",
                  "",
                  [
                    {
                      text: "Choose",
                      onPress: () => {
                        setShowPicker(true);
                      },
                    },
                    {
                      text: "Add manualy",
                      onPress: () => {
                        setShowPicker(false);
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
            {showPicker && (
              <Picker
                style={styles.picker}
                selectedValue={data.furnitureTypes}
                onValueChange={(value) => {
                  setData({ ...data, furnitureTypes: value });
                  setShowPicker(false);
                }}
              >
                <Picker.Item label="Furnished" value="furnished" />
                <Picker.Item label="Unfurnished" value="unfurnished" />
                <Picker.Item label="Semi-furnished" value="semi-furnished" />
              </Picker>
            )} */}

            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Text style={[styles.label, { marginTop: 5 }]}>Furniture</Text>
              <Text
                disabled
                name='type'
                placeholder='Furniture type'
                style={styles.chooseFurniture}>
                {!data.furnitureTypes
                  ? 'Click to choose type'
                  : data.furnitureTypes}
              </Text>
            </TouchableOpacity>
          </View>
          <SlideupModal
            isShow={showPicker}
            setShow={setShowPicker}
            title={'Select furniture type'}>
            <Picker
              style={styles.picker}
              selectedValue={data.furnitureTypes}
              onValueChange={value => {
                setData({ ...data, furnitureTypes: value });
                setShowPicker(false);
              }}>
              <Picker.Item label='Furnished' value='Furnished' />
              <Picker.Item label='Unfurnished' value='Unfurnished' />
              <Picker.Item label='Semi-furnished' value='Semi-furnished' />
            </Picker>
          </SlideupModal>

          <MainTextInput
            placeholder={'Add some notes here'}
            label={'Notes'}
            onChangeText={notes => {
              setData({ ...data, notes });
            }}
            value={data.notes}
          />
          <MainTextInput
            placeholder={'Enter name of reporter'}
            label={'Reporter name'}
            isRequired
            validRegExp={/^[a-zA-Z]{3,}$/}
            errorText={
              'Just enter alphabets, at least 3 characters and\nDo not leave it empty'
            }
            onChangeText={reporterName => {
              setData({ ...data, reporterName });
            }}
            value={data.reporterName}
          />

          <Text style={styles.label}>{'Image'}</Text>
          <View style={styles.pickImageContainer}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomColor: 'grey',
                borderBottomWidth: 3,
                paddingBottom: 10,
              }}>
              <TouchableOpacity
                style={[styles.outlineButton, { height: 50, flex: 1 }]}
                onPress={async () => {
                  // setData({ ...data });
                  // pickImage();
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                  });

                  if (!result.cancelled) {
                    setData({
                      ...data,
                      image: result.uri,
                    });
                  }
                }}>
                <Text style={styles.setText}>{'Pick Image'}</Text>
              </TouchableOpacity>
              <View style={{ marginHorizontal: 8 }} />
              <TouchableOpacity
                style={[
                  styles.outlineButton,
                  { height: 50, backgroundColor: 'red' },
                ]}
                onPress={() => {
                  setData({ ...data, image: '' });
                }}>
                <Text style={styles.setText}>{'Clear Image'}</Text>
              </TouchableOpacity>
            </View>
            {data.image && data.image.length > 0 ? (
              <Image source={{ uri: data.image }} style={styles.image} />
            ) : (
              <Text>{'No image choosed'}</Text>
            )}
          </View>
        </ScrollView>
        <MainButton
          buttonText={'Save'}
          fontSize={16}
          style={valid ? styles.saveColor : styles.disabledButton}
          disabled={!valid}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
      <LoadingOverlay visible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveColor: {
    backgroundColor: '#00a680',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoButton: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  outlineButton: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#231340',
  },
  setText: {
    color: '#fff',
  },
  picker: {
    width: '100%',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickImageContainer: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#999',
    marginLeft: 16,
  },
  chooseFurniture: {
    height: 40,
    marginTop: 8,
    marginBottom: 5,
    marginLeft: 16,
    marginRight: 12,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    borderColor: '#d6d6d6',
  },
});

export default AddOrEditScreen;
