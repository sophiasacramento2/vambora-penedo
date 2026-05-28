import { expect } from "@playwright/test";
import { test } from "../playwright-fixture";

test("deve carregar a tela inicial", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Vambora Penedo/i);
});
