import React, { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CategoriesTagsPage: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    productsApi.getCategories().then(setCategories);
    productsApi.getTags().then(setTags);
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await productsApi.addCategory(newCategory);
    setCategories([...categories, newCategory]);
    setNewCategory('');
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    await productsApi.addTag(newTag);
    setTags([...tags, newTag]);
    setNewTag('');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des Catégories & Tags</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Catégories</h2>
        <div className="flex gap-2 mb-4">
          <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nouvelle catégorie" />
          <Button onClick={addCategory}>Ajouter</Button>
        </div>
        <ul className="list-disc pl-5">
          {categories.map((cat, idx) => <li key={idx}>{cat}</li>)}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        <div className="flex gap-2 mb-4">
          <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Nouveau tag" />
          <Button onClick={addTag}>Ajouter</Button>
        </div>
        <ul className="list-disc pl-5">
          {tags.map((tag, idx) => <li key={idx}>{tag}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default CategoriesTagsPage;
