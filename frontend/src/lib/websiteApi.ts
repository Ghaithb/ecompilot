import { api } from './api';

export interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

class WebsiteApi {
  async getPages(): Promise<Page[]> {
    const response = await api.get('/website/pages');
    return response.data;
  }

  async getPage(id: string): Promise<Page> {
    const response = await api.get(`/website/pages/${id}`);
    return response.data;
  }

  async createPage(data: Partial<Page>): Promise<Page> {
    const response = await api.post('/website/pages', data);
    return response.data;
  }

  async updatePage(id: string, data: Partial<Page>): Promise<Page> {
    const response = await api.patch(`/website/pages/${id}`, data);
    return response.data;
  }

  async deletePage(id: string): Promise<void> {
    await api.delete(`/website/pages/${id}`);
  }
}

export const websiteApi = new WebsiteApi();
