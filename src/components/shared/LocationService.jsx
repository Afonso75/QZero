import { useState, useEffect } from 'react';
import { safeFetch } from '@/utils/apiConfig';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Calcular distância entre duas coordenadas (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Detectar se estamos no Capacitor (app nativa)
const isNative = Capacitor.isNativePlatform();

// Hook para geolocalização - suporta Web e Capacitor (Android/iOS)
export function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      let latitude, longitude;

      if (isNative) {
        // ✅ CAPACITOR: Usar plugin nativo para melhor performance e permissões
        console.log('📱 Usando Capacitor Geolocation (nativo)');
        
        // Verificar/pedir permissões
        const permStatus = await Geolocation.checkPermissions();
        console.log('📍 Status permissões:', permStatus);
        
        if (permStatus.location !== 'granted') {
          const requestResult = await Geolocation.requestPermissions();
          console.log('📍 Resultado pedido permissões:', requestResult);
          
          if (requestResult.location !== 'granted') {
            setError('Permissão de localização negada');
            setLoading(false);
            return;
          }
        }
        
        // Obter posição
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
        
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('✅ Localização obtida (Capacitor):', { latitude, longitude });
        
      } else {
        // ✅ WEB: Usar navigator.geolocation padrão
        console.log('🌐 Usando navigator.geolocation (web)');
        
        if (!navigator.geolocation) {
          setError('Geolocalização não suportada pelo navegador');
          setLoading(false);
          return;
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('✅ Localização obtida (Web):', { latitude, longitude });
      }

      setLocation({ lat: latitude, lng: longitude });

      // Reverse geocoding para obter país (funciona em ambos os ambientes)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'QZero-App/1.0'
            }
          }
        );
        const data = await response.json();
        const countryCode = data.address?.country_code?.toUpperCase();
        const countryName = data.address?.country;
        
        setCountry({ code: countryCode, name: countryName });
        console.log('✅ País detectado:', { code: countryCode, name: countryName });
      } catch (err) {
        console.error('❌ Erro ao obter país:', err);
        // Não definir erro aqui - a localização foi obtida, só faltou o país
      }
      
    } catch (err) {
      console.error('❌ Erro de localização:', err);
      if (err.code === 1 || err.message?.includes('denied') || err.message?.includes('permission')) {
        setError('Acesso à localização negado');
      } else if (err.code === 2 || err.message?.includes('unavailable')) {
        setError('Localização indisponível');
      } else if (err.code === 3 || err.message?.includes('timeout')) {
        setError('Tempo esgotado ao obter localização');
      } else {
        setError('Erro ao obter localização');
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return { location, country, loading, error, refetch: fetchLocation };
}

// Geocoding de morada para coordenadas usando Google Maps API
export async function geocodeAddress(addressStr, city = null, postalCode = null, country = null) {
  try {
    console.log('🗺️ Geocoding endereço com Google Maps:', { addressStr, city, postalCode, country });
    
    const { response, data } = await safeFetch('/api/geocode-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: addressStr,
        city,
        postalCode,
        country
      })
    });

    if (!response.ok) {
      console.error('❌ Geocoding falhou:', data);
      return null;
    }
    
    console.log('✅ Geocoding bem-sucedido:', {
      lat: data?.lat,
      lng: data?.lng,
      precision: data?.precision,
      locationType: data?.locationType
    });
    
    return {
      lat: data?.lat,
      lng: data?.lng,
      precision: data?.precision,
      locationType: data?.locationType,
      formattedAddress: data?.formattedAddress
    };
  } catch (error) {
    console.error('❌ Erro no geocoding:', error);
    return null;
  }
}