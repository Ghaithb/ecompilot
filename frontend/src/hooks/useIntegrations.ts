import { useState, useEffect } from 'react';
import { integrationsApi } from '@/lib/integrationsApi';
import { socialMediaApi, type SocialStatus } from '@/lib/socialMediaApi';
import { adsApi } from '@/lib/adsApi';

export interface IntegrationStatus {
  stripe: boolean;
  shopify: boolean;
  facebook: boolean;
  instagram: boolean;
  twitter: boolean;
  linkedin: boolean;
  googleAds: boolean;
  metaAds: boolean;
  tiktokAds: boolean;
}

export const useIntegrations = () => {
  const [status, setStatus] = useState<IntegrationStatus>({
    stripe: false,
    shopify: false,
    facebook: false,
    instagram: false,
    twitter: false,
    linkedin: false,
    googleAds: false,
    metaAds: false,
    tiktokAds: false,
  });
  const [loading, setLoading] = useState(true);

  const loadIntegrationsStatus = async () => {
    try {
      setLoading(true);

      // Load payment integrations
      const [stripeStatus, shopifyStatus, socialStatus] = await Promise.allSettled([
        integrationsApi.getStripeStatus(),
        integrationsApi.getShopifyStatus(),
        socialMediaApi.getSocialStatus(),
      ]);

      const newStatus: IntegrationStatus = {
        stripe: stripeStatus.status === 'fulfilled' && stripeStatus.value.connected,
        shopify: shopifyStatus.status === 'fulfilled' && shopifyStatus.value.isConnected,
        facebook: false,
        instagram: false,
        twitter: false,
        linkedin: false,
        googleAds: false,
        metaAds: false,
        tiktokAds: false,
      };

      // Social media status
      if (socialStatus.status === 'fulfilled') {
        const social: SocialStatus = socialStatus.value;
        newStatus.facebook = social.facebook?.connected || false;
        newStatus.instagram = social.instagram?.connected || false;
        newStatus.twitter = social.twitter?.connected || false;
        newStatus.linkedin = social.linkedin?.connected || false;
      }

      // Try to check ads platforms (may fail if not configured)
      try {
        const googleCampaigns = await adsApi.google.getCampaigns();
        newStatus.googleAds = Array.isArray(googleCampaigns) && googleCampaigns.length > 0;
      } catch {
        newStatus.googleAds = false;
      }

      try {
        const metaCampaigns = await adsApi.meta.getCampaigns();
        newStatus.metaAds = Array.isArray(metaCampaigns) && metaCampaigns.length > 0;
      } catch {
        newStatus.metaAds = false;
      }

      try {
        const tiktokCampaigns = await adsApi.tiktok.getCampaigns();
        newStatus.tiktokAds = Array.isArray(tiktokCampaigns) && tiktokCampaigns.length > 0;
      } catch {
        newStatus.tiktokAds = false;
      }

      setStatus(newStatus);
    } catch (error) {
      console.error('Error loading integrations status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  const refresh = () => {
    loadIntegrationsStatus();
  };

  const isAnyAdsConnected = status.googleAds || status.metaAds || status.tiktokAds;
  const isAnySocialConnected = status.facebook || status.instagram || status.twitter || status.linkedin;
  const isAnyPaymentConnected = status.stripe || status.shopify;

  return {
    status,
    loading,
    refresh,
    isAnyAdsConnected,
    isAnySocialConnected,
    isAnyPaymentConnected,
  };
};
