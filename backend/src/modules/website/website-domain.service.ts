import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { promises as dns } from 'dns';
import { Website, WebsiteDocument } from './schemas/website.schema';

@Injectable()
export class WebsiteDomainService {
  constructor(
    @InjectModel(Website.name) private websiteModel: Model<WebsiteDocument>,
    private config: ConfigService,
  ) {}

  getDnsTarget(): string {
    return this.config.get<string>('STORE_CNAME_TARGET') || 'shops.ecompilot.tn';
  }

  getPlatformHost(): string {
    return this.config.get<string>('STORE_PLATFORM_HOST') || 'app.ecompilot.tn';
  }

  normalizeDomain(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');
  }

  async updateCustomDomain(tenantId: string, customDomain?: string) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) throw new BadRequestException('Site web introuvable');

    if (!customDomain) {
      website.domain = {
        ...(website.domain || { sslEnabled: true }),
        customDomain: undefined,
        dnsVerified: false,
        dnsVerifiedAt: undefined,
      };
      await website.save();
      return this.buildDomainStatus(website);
    }

    const normalized = this.normalizeDomain(customDomain);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) {
      throw new BadRequestException('Nom de domaine invalide');
    }

    const taken = await this.websiteModel.findOne({
      tenantId: { $ne: tenantId },
      'domain.customDomain': normalized,
    });
    if (taken) {
      throw new BadRequestException('Ce domaine est déjà utilisé par une autre boutique');
    }

    website.domain = {
      ...(website.domain || { sslEnabled: true }),
      customDomain: normalized,
      dnsTarget: this.getDnsTarget(),
      dnsVerified: false,
      dnsVerifiedAt: undefined,
      sslEnabled: true,
    };
    await website.save();
    return this.buildDomainStatus(website);
  }

  async verifyDns(tenantId: string) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website?.domain?.customDomain) {
      throw new BadRequestException('Aucun domaine personnalisé configuré');
    }

    const domain = website.domain.customDomain;
    const target = website.domain.dnsTarget || this.getDnsTarget();
    const platformIp = this.config.get<string>('STORE_PLATFORM_IP');

    const result = await this.checkDomainPointsToTarget(domain, target, platformIp);
    if (result.verified) {
      website.domain.dnsVerified = true;
      website.domain.dnsVerifiedAt = new Date();
      await website.save();
    }

    return {
      ...this.buildDomainStatus(website),
      checks: result.checks,
      verified: result.verified,
    };
  }

  private async checkDomainPointsToTarget(domain: string, cnameTarget: string, platformIp?: string) {
    const checks: Array<{ type: string; host: string; ok: boolean; value?: string }> = [];

    const hosts = [domain, `www.${domain}`];
    let verified = false;

    for (const host of hosts) {
      try {
        const cnames = await dns.resolveCname(host);
        const match = cnames.find((c) => c.toLowerCase().includes(cnameTarget.toLowerCase()));
        checks.push({ type: 'CNAME', host, ok: Boolean(match), value: cnames.join(', ') });
        if (match) verified = true;
      } catch {
        checks.push({ type: 'CNAME', host, ok: false });
      }

      if (platformIp) {
        try {
          const ips = await dns.resolve4(host);
          const ok = ips.includes(platformIp);
          checks.push({ type: 'A', host, ok, value: ips.join(', ') });
          if (ok) verified = true;
        } catch {
          checks.push({ type: 'A', host, ok: false });
        }
      }
    }

    return { verified, checks };
  }

  buildDomainStatus(website: WebsiteDocument) {
    const slug = website.slug;
    const platformHost = this.getPlatformHost();
    return {
      slug,
      defaultUrl: `https://${platformHost}/store/${slug}`,
      subdomainHint: `${slug}.${platformHost.replace(/^app\./, '')}`,
      customDomain: website.domain?.customDomain,
      dnsTarget: website.domain?.dnsTarget || this.getDnsTarget(),
      dnsVerified: website.domain?.dnsVerified ?? false,
      dnsVerifiedAt: website.domain?.dnsVerifiedAt,
      sslEnabled: website.domain?.sslEnabled ?? true,
      instructions: {
        cname: `CNAME www → ${this.getDnsTarget()}`,
        root: `Rediriger ${website.domain?.customDomain || 'votredomaine.tn'} → www (ou A record vers IP plateforme)`,
      },
    };
  }

  async getDomainStatus(tenantId: string) {
    const website = await this.websiteModel.findOne({ tenantId });
    if (!website) throw new BadRequestException('Site web introuvable');
    return this.buildDomainStatus(website);
  }
}
