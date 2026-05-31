import { isValidInternationalPhone } from './phone.util';

export type StorefrontCheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  phoneCountry: string;
  governorate: string;
  delegation: string;
  address: string;
};

export type CheckoutFieldError = 'required' | 'invalid';

export function isValidEmail(email: string): boolean {
  const value = email.trim();
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

export function getCheckoutFormErrors(
  form: StorefrontCheckoutForm,
  delegations: string[],
): Partial<Record<keyof StorefrontCheckoutForm, CheckoutFieldError>> {
  const errors: Partial<Record<keyof StorefrontCheckoutForm, CheckoutFieldError>> = {};

  if (form.fullName.trim().length < 2) errors.fullName = 'required';
  if (!isValidEmail(form.email)) errors.email = form.email.trim() ? 'invalid' : 'required';
  if (!isValidInternationalPhone(form.phone, form.phoneCountry)) {
    errors.phone = form.phone.trim() ? 'invalid' : 'required';
  }
  if (!form.governorate) errors.governorate = 'required';
  if (delegations.length > 0 && !form.delegation) errors.delegation = 'required';
  if (form.address.trim().length < 5) errors.address = form.address.trim() ? 'invalid' : 'required';

  return errors;
}

export function isCheckoutFormValid(form: StorefrontCheckoutForm, delegations: string[]): boolean {
  return Object.keys(getCheckoutFormErrors(form, delegations)).length === 0;
}
