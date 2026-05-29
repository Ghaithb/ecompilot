import { Test, TestingModule } from '@nestjs/testing';
import { PersonalizationEngineService } from './personalization-engine.service';

describe('PersonalizationEngineService', () => {
  let service: PersonalizationEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonalizationEngineService],
    }).compile();

    service = module.get<PersonalizationEngineService>(PersonalizationEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('personalizeWebsiteContent', () => {
    const baseData = {
      businessType: 'parfum',
      companyName: 'Essence de Luxe',
      city: 'Paris',
    };

    it('should generate personalized content with minimal data', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result).toBeDefined();
      expect(result.personalInfo).toBeDefined();
      expect(result.uniqueSlogan).toBeDefined();
      expect(result.personalizedDescription).toBeDefined();
      expect(result.valueProposition).toBeDefined();
      expect(result.whyChooseUs).toBeDefined();
      expect(result.ourProcess).toBeDefined();
      expect(result.guarantees).toBeDefined();
      expect(result.openingHours).toBeDefined();
    });

    it('should include company history when foundingYear is provided', async () => {
      const dataWithYear = {
        ...baseData,
        foundingYear: 2010,
      };

      const result = await service.personalizeWebsiteContent(dataWithYear);

      expect(result.companyStory).toBeDefined();
      expect(result.companyStory.year).toBe(2010);
      expect(result.companyStory.yearsInBusiness).toBeGreaterThan(0);
      expect(result.companyStory.milestones).toBeDefined();
      expect(result.companyStory.milestones.length).toBeGreaterThan(0);
    });

    it('should include team section when teamSize is provided', async () => {
      const dataWithTeam = {
        ...baseData,
        teamSize: 8,
      };

      const result = await service.personalizeWebsiteContent(dataWithTeam);

      expect(result.team).toBeDefined();
      expect(result.team.members).toBeDefined();
      expect(result.team.members.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate unique slogan based on specialties', async () => {
      const dataWithSpecialties = {
        ...baseData,
        specialties: ['Parfums niche', 'Créations sur-mesure'],
      };

      const result = await service.personalizeWebsiteContent(dataWithSpecialties);

      expect(result.uniqueSlogan).toBeDefined();
      expect(result.uniqueSlogan.length).toBeGreaterThan(10);
    });

    it('should include experience in "why choose us" when foundingYear provided', async () => {
      const dataWithYear = {
        ...baseData,
        foundingYear: 2015,
      };

      const result = await service.personalizeWebsiteContent(dataWithYear);

      const experienceReason = result.whyChooseUs.find(reason => 
        reason.title.includes('ans d\'expérience')
      );
      expect(experienceReason).toBeDefined();
    });

    it('should format phone number correctly', async () => {
      const dataWithPhone = {
        ...baseData,
        phone: '0123456789',
      };

      const result = await service.personalizeWebsiteContent(dataWithPhone);

      expect(result.personalInfo.displayPhone).toMatch(/\d{2}\s\d{2}/);
    });

    it('should generate email if not provided', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.personalInfo.displayEmail).toBeDefined();
      expect(result.personalInfo.displayEmail).toContain('@');
    });

    it('should include map embed URL when address is provided', async () => {
      const dataWithAddress = {
        ...baseData,
        address: '123 Rue de Rivoli',
      };

      const result = await service.personalizeWebsiteContent(dataWithAddress);

      expect(result.personalInfo.mapEmbedUrl).toBeDefined();
      expect(result.personalInfo.mapEmbedUrl).toContain('google.com/maps');
    });

    it('should generate realistic opening hours for business type', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.openingHours).toBeDefined();
      expect(result.openingHours).toHaveLength(7);
      
      const monday = result.openingHours.find(h => h.day === 'Lundi');
      expect(monday).toBeDefined();
      expect(monday.open).toMatch(/\d{2}:\d{2}/);
    });

    it('should generate seasonal offers based on current date', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.seasonalOffers).toBeDefined();
      expect(result.seasonalOffers.title).toBeDefined();
      expect(result.seasonalOffers.discount).toBeDefined();
    });

    it('should generate welcome email', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.welcomeEmail).toBeDefined();
      expect(result.welcomeEmail.subject).toContain(baseData.companyName);
      expect(result.welcomeEmail.body).toBeDefined();
      expect(result.welcomeEmail.cta).toBeDefined();
    });

    it('should generate enriched metadata', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.enrichedMeta).toBeDefined();
      expect(result.enrichedMeta.structuredData).toBeDefined();
      expect(result.enrichedMeta.structuredData['@context']).toBe('https://schema.org');
      expect(result.enrichedMeta.openGraph).toBeDefined();
    });

    it('should generate proper process steps for business type', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.ourProcess).toBeDefined();
      expect(result.ourProcess.title).toBeDefined();
      expect(result.ourProcess.steps).toBeDefined();
      expect(result.ourProcess.steps.length).toBeGreaterThan(0);
      
      result.ourProcess.steps.forEach(step => {
        expect(step.step).toBeDefined();
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.duration).toBeDefined();
      });
    });

    it('should generate guarantees', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.guarantees).toBeDefined();
      expect(result.guarantees.length).toBeGreaterThanOrEqual(4);
      
      result.guarantees.forEach(guarantee => {
        expect(guarantee.icon).toBeDefined();
        expect(guarantee.title).toBeDefined();
        expect(guarantee.description).toBeDefined();
      });
    });

    it('should include personalized description with all provided data', async () => {
      const fullData = {
        ...baseData,
        foundingYear: 2010,
        teamSize: 8,
        specialties: ['Parfums niche', 'Créations sur-mesure'],
        description: 'Notre passion pour les parfums de luxe',
      };

      const result = await service.personalizeWebsiteContent(fullData);

      const yearsInBusiness = new Date().getFullYear() - fullData.foundingYear;
      expect(result.personalizedDescription).toContain(`${yearsInBusiness} ans`);
      expect(result.personalizedDescription).toContain('8 professionnels');
      expect(result.personalizedDescription).toContain('Parfums niche');
      expect(result.personalizedDescription).toContain('Notre passion');
    });

    it('should generate service areas', async () => {
      const result = await service.personalizeWebsiteContent(baseData);

      expect(result.serviceAreas).toBeDefined();
      expect(result.serviceAreas.mainArea).toBeDefined();
      expect(result.serviceAreas.mainArea.city).toBe(baseData.city);
      expect(result.serviceAreas.serviceRadius).toBeDefined();
    });

    it('should handle different business types correctly', async () => {
      const businessTypes = ['parfum', 'restaurant', 'cafe', 'coiffure', 'immobilier'];

      for (const type of businessTypes) {
        const data = { ...baseData, businessType: type };
        const result = await service.personalizeWebsiteContent(data);

        expect(result).toBeDefined();
        expect(result.uniqueSlogan).toBeDefined();
        expect(result.openingHours).toBeDefined();
      }
    });
  });

  describe('Value Proposition', () => {
    it('should include specialties in value proposition', async () => {
      const data = {
        businessType: 'parfum',
        companyName: 'Test',
        city: 'Paris',
        specialties: ['Parfums niche', 'Bio'],
      };

      const result = await service.personalizeWebsiteContent(data);

      expect(result.valueProposition.headline).toContain('Parfums niche');
      expect(result.valueProposition.benefits).toBeDefined();
      expect(result.valueProposition.differentiators).toBeDefined();
    });
  });
});
