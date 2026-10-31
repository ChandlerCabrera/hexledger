import { Injectable, signal } from '@angular/core';

export interface Battlefield {
  id: string;
  name: string;
  imageUrl: string;
  custom?: boolean;
}

const CUSTOM_KEY = 'riftbound.customBattlefields';
const FAVORITES_KEY = 'riftbound.favoriteBattlefields';

@Injectable({ providedIn: 'root' })
export class BattlefieldService {
  readonly catalog = signal<Battlefield[]>([]);
  readonly custom = signal<Battlefield[]>(this.loadCustom());
  readonly favorites = signal<Record<string, string[]>>(this.loadFavorites());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadCatalog();
  }

  // Favorites are kept per player, keyed by the picker's side
  toggleFavorite(owner: string, id: string): void {
    this.favorites.update((all) => {
      const cur = all[owner] ?? [];
      return { ...all, [owner]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });
    try {
      sessionStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites()));
    } catch {
      // Favorites still work for this page load if storage is unavailable
    }
  }

  private loadFavorites(): Record<string, string[]> {
    try {
      const v = JSON.parse(sessionStorage.getItem(FAVORITES_KEY) ?? '{}');
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch {
      return {};
    }
  }

  async loadCatalog(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await fetch('battlefields/manifest.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items: { id: string; name: string; image: string }[] = await res.json();
      this.catalog.set(items.map((i) => ({ id: i.id, name: i.name, imageUrl: i.image })));
    } catch (e) {
      this.error.set(`Could not load battlefields (${(e as Error).message}).`);
    } finally {
      this.loading.set(false);
    }
  }

  async addCustom(file: File, name: string): Promise<Battlefield> {
    const imageUrl = await this.downscale(file);
    const bf: Battlefield = {
      id: `custom-${Date.now()}`,
      name: name.trim() || file.name.replace(/\.[^.]+$/, ''),
      imageUrl,
      custom: true,
    };
    this.custom.update((list) => [...list, bf]);
    this.saveCustom();
    return bf;
  }

  removeCustom(id: string): void {
    this.custom.update((list) => list.filter((b) => b.id !== id));
    this.saveCustom();
  }

  private downscale(file: File, maxSize = 800): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Not a valid image'));
      };
      img.src = url;
    });
  }

  private loadCustom(): Battlefield[] {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private saveCustom(): void {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(this.custom()));
    } catch {
      this.error.set('Could not save uploaded image (storage full).');
    }
  }
}
