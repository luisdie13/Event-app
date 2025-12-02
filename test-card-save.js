// Script de prueba para verificar el guardado de tarjetas
// Ejecutar con: node test-card-save.js

const testCardSave = async () => {
    const API_URL = 'http://localhost:3001';
    
    // Primero, hacer login para obtener un token
    console.log('1. Intentando hacer login...');
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'luis@admin.com',
            password: 'admin123'
        })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
        console.error('Login falló');
        return;
    }
    
    const token = loginData.token;
    console.log('Token obtenido:', token.substring(0, 20) + '...');
    
    // Intentar guardar una tarjeta
    console.log('\n2. Intentando guardar tarjeta...');
    const cardData = {
        cardHolderName: 'JUAN PEREZ',
        cardNumberLast4: '1234',
        cardBrand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
    };
    
    console.log('Datos de tarjeta:', cardData);
    
    const cardResponse = await fetch(`${API_URL}/api/users/cards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cardData)
    });
    
    const cardResult = await cardResponse.json();
    console.log('\n3. Respuesta del servidor:');
    console.log('Status:', cardResponse.status);
    console.log('Data:', cardResult);
    
    if (cardResponse.ok) {
        console.log('\n✅ Tarjeta guardada exitosamente!');
        
        // Verificar que se guardó
        console.log('\n4. Verificando tarjetas guardadas...');
        const getCardsResponse = await fetch(`${API_URL}/api/users/cards`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const cards = await getCardsResponse.json();
        console.log('Tarjetas guardadas:', cards);
    } else {
        console.log('\n❌ Error al guardar tarjeta');
    }
};

testCardSave().catch(console.error);
