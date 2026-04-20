import type { PublicService } from '../types/public';

const STORAGE_KEY = 'structura_project_basket';

export function getProjectBasket(): PublicService[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PublicService[]) : [];
  } catch {
    return [];
  }
}

export function saveProjectBasket(services: PublicService[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

export function addServiceToProjectBasket(service: PublicService) {
  const current = getProjectBasket();

  if (current.some((item) => item.id === service.id)) {
    return current;
  }

  const next = [...current, service];
  saveProjectBasket(next);
  return next;
}

export function removeServiceFromProjectBasket(serviceId: string) {
  const next = getProjectBasket().filter((service) => service.id !== serviceId);
  saveProjectBasket(next);
  return next;
}

export function clearProjectBasket() {
  localStorage.removeItem(STORAGE_KEY);
}
