
import { NotFoundException } from '@nestjs/common';

// Utilitaires pour la gestion des images produits/variantes
export async function addImage(productModel, tenantId: string, productId: string, imageUrl: string) {
  const product = await productModel.findOne({ _id: productId, tenantId }).exec();
  if (!product) throw new NotFoundException('Produit non trouvé');
  if (!product.images) product.images = [];
  product.images.push(imageUrl);
  await product.save();
  return product;
}

export async function removeImage(productModel, tenantId: string, productId: string, imageUrl: string) {
  const product = await productModel.findOne({ _id: productId, tenantId }).exec();
  if (!product) throw new NotFoundException('Produit non trouvé');
  if (!product.images) return product;
  product.images = product.images.filter(img => img !== imageUrl);
  await product.save();
  return product;
}

export async function deleteProductImageFile(uploadsService, imageUrl: string) {
  await uploadsService.deleteFile(imageUrl);
}

export async function addVariantImage(productModel, tenantId: string, productId: string, variantId: string, imageUrl: string) {
  const product = await productModel.findOne({ _id: productId, tenantId }).exec();
  if (!product) throw new NotFoundException('Produit non trouvé');
  const variant = product.variants?.find(v => v._id.toString() === variantId);
  if (!variant) throw new NotFoundException('Variante non trouvée');
  if (!variant.images) variant.images = [];
  variant.images.push(imageUrl);
  await product.save();
  return product;
}

export async function removeVariantImage(productModel, tenantId: string, productId: string, variantId: string, imageUrl: string) {
  const product = await productModel.findOne({ _id: productId, tenantId }).exec();
  if (!product) throw new NotFoundException('Produit non trouvé');
  const variant = product.variants?.find(v => v._id.toString() === variantId);
  if (!variant) throw new NotFoundException('Variante non trouvée');
  if (!variant.images) return product;
  variant.images = variant.images.filter(img => img !== imageUrl);
  await product.save();
  return product;
}