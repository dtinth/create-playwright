/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { test, expect, PackageManager } from './baseFixtures';
import path from 'path';
import fs from 'fs';

test('should generate a project in the current directory', async ({ run, packageManager }) => {
  test.slow();
  const { exitCode, dir, stdout } = await run([], { installGitHubActions: true, testDir: 'tests', language: 'TypeScript', installPlaywrightDependencies: false, installPlaywrightBrowsers: true });
  expect(exitCode).toBe(0);
  expect(fs.existsSync(path.join(dir, 'tests/example.spec.ts'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'package.json'))).toBeTruthy();
  if (packageManager === 'npm')
    expect(fs.existsSync(path.join(dir, 'package-lock.json'))).toBeTruthy();
  else if (packageManager === 'yarn')
    expect(fs.existsSync(path.join(dir, 'yarn.lock'))).toBeTruthy();
  else if (packageManager === 'pnpm')
    expect(fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'playwright.config.ts'))).toBeTruthy();
  const playwrightConfigContent = fs.readFileSync(path.join(dir, 'playwright.config.ts'), 'utf8');
  expect(playwrightConfigContent).toContain('tests');
  expect(fs.existsSync(path.join(dir, '.github/workflows/playwright.yml'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, '.gitignore'))).toBeTruthy();
  if (packageManager === 'npm') {
    expect(stdout).toContain('Initializing NPM project (npm init -y)…');
    expect(stdout).toContain('Installing Playwright Test (npm install --save-dev @playwright/test)…');
  } else if (packageManager === 'yarn') {
    expect(stdout).toContain('Initializing Yarn project (yarn init -y)…');
    expect(stdout).toContain('Installing Playwright Test (yarn add --dev @playwright/test)…');
  } else if (packageManager === 'pnpm') {
    expect(stdout).toContain('pnpm init'); // pnpm command outputs name in different case, hence we are not testing the whole string
    expect(stdout).toContain('Installing Playwright Test (pnpm add --save-dev @playwright/test)…');
  }
  expect(stdout).toContain('npx playwright install' + process.platform === 'linux' ? ' --with-deps' : '');
});

test('should generate a project in a given directory', async ({ run, packageManager }) => {
  const { exitCode, dir } = await run(['foobar'], { installGitHubActions: true, testDir: 'tests', language: 'TypeScript', installPlaywrightDependencies: false, installPlaywrightBrowsers: true });
  expect(exitCode).toBe(0);
  expect(fs.existsSync(path.join(dir, 'foobar/tests/example.spec.ts'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'foobar/package.json'))).toBeTruthy();
  if (packageManager === 'npm')
    expect(fs.existsSync(path.join(dir, 'foobar/package-lock.json'))).toBeTruthy();
  else if (packageManager === 'yarn')
    expect(fs.existsSync(path.join(dir, 'foobar/yarn.lock'))).toBeTruthy();
  else if (packageManager === 'pnpm')
    expect(fs.existsSync(path.join(dir, 'foobar/pnpm-lock.yaml'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'foobar/playwright.config.ts'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'foobar/.github/workflows/playwright.yml'))).toBeTruthy();
});

test('should generate a project with JavaScript and without GHA', async ({ run, packageManager }) => {
  const { exitCode, dir } = await run([], { installGitHubActions: false, testDir: 'tests', language: 'JavaScript', installPlaywrightDependencies: false, installPlaywrightBrowsers: true });
  expect(exitCode).toBe(0);
  expect(fs.existsSync(path.join(dir, 'tests/example.spec.js'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'package.json'))).toBeTruthy();
  if (packageManager === 'npm')
    expect(fs.existsSync(path.join(dir, 'package-lock.json'))).toBeTruthy();
  else if (packageManager === 'yarn')
    expect(fs.existsSync(path.join(dir, 'yarn.lock'))).toBeTruthy();
  else if (packageManager === 'pnpm')
    expect(fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'playwright.config.js'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, '.github/workflows/playwright.yml'))).toBeFalsy();
});

test('should generate be able to run TS examples successfully', async ({ run, packageManager }) => {
  test.slow();
  const { exitCode, dir, exec } = await run([], { installGitHubActions: false, testDir: 'tests', language: 'TypeScript', installPlaywrightDependencies: false, installPlaywrightBrowsers: true });
  expect(exitCode).toBe(0);
  expect(fs.existsSync(path.join(dir, 'tests/example.spec.ts'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'package.json'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'playwright.config.ts'))).toBeTruthy();

  {
    const { code } = await exec(packageManagerToNpxCommand(packageManager), ['playwright', 'install-deps']);
    expect(code).toBe(0);
  }

  const { code } = await exec(packageManagerToNpxCommand(packageManager), ['playwright', 'test']);
  expect(code).toBe(0);
});

test('should generate be able to run JS examples successfully', async ({ run, packageManager }) => {
  test.slow();
  const { exitCode, dir, exec } = await run([], { installGitHubActions: false, testDir: 'tests', language: 'JavaScript', installPlaywrightDependencies: false, installPlaywrightBrowsers: true });
  expect(exitCode).toBe(0);
  expect(fs.existsSync(path.join(dir, 'tests/example.spec.js'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'package.json'))).toBeTruthy();
  expect(fs.existsSync(path.join(dir, 'playwright.config.js'))).toBeTruthy();

  {
    const { code } = await exec(packageManagerToNpxCommand(packageManager), ['playwright', 'install-deps']);
    expect(code).toBe(0);
  }

  const { code } = await exec(packageManagerToNpxCommand(packageManager), ['playwright', 'test']);
  expect(code).toBe(0);
});

function packageManagerToNpxCommand(packageManager: PackageManager): string {
  switch (packageManager) {
    case 'npm':
      return 'npx';
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm dlx';
  }
}
