// Script pour récupérer votre tenant ID depuis le token JWT
const jwt = require('jsonwebtoken');

// Copiez votre token depuis le localStorage du navigateur
// Ouvrez la console du navigateur (F12) et tapez: localStorage.getItem('token')
const token = 'VOTRE_TOKEN_ICI';

try {
  const decoded = jwt.decode(token);
  console.log('📋 Informations du token:');
  console.log('User ID:', decoded?.sub);
  console.log('Tenant ID:', decoded?.tenantId);
  console.log('Email:', decoded?.email);
  console.log('');
  console.log('🎯 Tenant ID à utiliser:', decoded?.tenantId);
} catch (error) {
  console.error('Erreur de décodage du token:', error);
}