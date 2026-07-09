import { expect, test } from "@playwright/test";

test("home shows the pokédex grid with cards", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Pokédex" })
  ).toBeVisible();
  await expect(page.getByTestId("pokemon-card").first()).toBeVisible({
    timeout: 15_000,
  });
});

test("search filters the list", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("pokemon-card").first().waitFor({ timeout: 15_000 });
  await page.getByRole("searchbox").fill("pikachu");
  await expect(page.getByText("Pikachu", { exact: false }).first()).toBeVisible(
    { timeout: 15_000 }
  );
});

test("navigates to a detail page", async ({ page }) => {
  await page.goto("/pokemon/charizard/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Charizard" })
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Base stats")).toBeVisible();
});

test("berries page lists berries", async ({ page }) => {
  await page.goto("/berries/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Berries" })
  ).toBeVisible();
  await expect(page.getByText("Cheri", { exact: false }).first()).toBeVisible({
    timeout: 15_000,
  });
});

test("theme toggle switches to dark mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /toggle.*mode/iu }).click();
  await expect(page.locator("html")).toHaveClass(/dark/u);
});
