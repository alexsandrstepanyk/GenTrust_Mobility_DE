import React from 'react';
import { View, Text } from 'react-native';

const MapView = (props) => <View {...props} style={[{ backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' }, props.style]} ><Text>📍 [Map Mock]</Text></View>;
export const Marker = (props) => <View {...props} />;
export default MapView;
