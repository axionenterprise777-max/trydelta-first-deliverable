import { expect, test } from "@playwright/test";

test("login -> dashboard -> logout", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByTestId("login-form")).toBeVisible();
  await page.getByTestId("login-email").fill("adriana@trydelta.local");
  await page.getByTestId("login-password").fill("TryDelta123!");
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/session/login") &&
      response.request().method() === "POST",
  );
  await page.getByTestId("login-submit").click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.ok()).toBeTruthy();
  const cookies = await page.context().cookies();
  expect(cookies.some((cookie) => cookie.name === "trydelta_session")).toBeTruthy();

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByTestId("dashboard-root")).toBeVisible();
  await expect(page.getByTestId("logout-button")).toBeVisible();

  const logoutResponse = await page.request.post("/api/session/logout");
  expect(logoutResponse.ok()).toBeTruthy();
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByTestId("login-form")).toBeVisible();
});
