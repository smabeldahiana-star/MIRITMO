const { test, expect } = require('@playwright/test');

const VIEWS = [
  { view: 'home', name: 'Resumen' },
  { view: 'tasks', name: 'Agenda' },
  { view: 'habits', name: 'Hábitos' },
  { view: 'workouts', name: 'Entrenamiento' },
  { view: 'expenses', name: 'Mis gastos' },
  { view: 'savings', name: 'Mis ahorros' },
  { view: 'diary', name: 'Diario emocional' },
  { view: 'focus', name: 'Tiempo de enfoque' },
];

test.beforeEach(async ({ page }) => {
  // Cada test de Playwright ya corre en un contexto aislado; solo cargamos la app
  await page.goto('/');
  await page.locator('#page-content').waitFor();
});

test('la aplicación carga en el resumen', async ({ page }) => {
  await expect(page).toHaveTitle(/MiRitmo/);
  await expect(page.locator('.nav-link.active')).toHaveAttribute('data-view', 'home');
  await expect(page.locator('#breadcrumb-current')).toHaveText('Resumen');
  await expect(page.locator('#today-label')).toBeVisible();
});

test('navega entre todas las vistas principales', async ({ page }) => {
  for (const { view, name } of VIEWS) {
    await page.locator(`.nav-link[data-view="${view}"]`).click();
    await expect(page.locator('#breadcrumb-current')).toHaveText(name);
    await expect(page.locator('.nav-link.active')).toHaveAttribute('data-view', view);
  }
});

test('abre y cierra el modal de añadir entrada', async ({ page }) => {
  await page.locator('#top-add').click();
  await expect(page.locator('#modal-backdrop')).not.toHaveAttribute('hidden');
  await expect(page.locator('#entry-form')).toBeVisible();
  await page.locator('#modal-close').click();
  await expect(page.locator('#modal-backdrop')).toHaveAttribute('hidden');
});

test('abre el perfil local tras cargar los módulos de cuenta', async ({ page }) => {
  await page.locator('#account-open').click();
  await expect(page.locator('#account-backdrop')).not.toHaveAttribute('hidden');
  await expect(page.locator('#local-profile-form')).toBeVisible();
});
