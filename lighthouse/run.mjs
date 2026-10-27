// Runs Lighthouse three times per page and profile against the production build and keeps the median run
// LIGHTHOUSE_URL measures a deployed URL instead, with reports in reports/deploy
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DEPLOY_URL = process.env.LIGHTHOUSE_URL?.replace(/\/$/, '');
const REPORTS_DIR = path.join(ROOT, 'reports', DEPLOY_URL ? 'deploy' : '');
const PORT = 4318;
const BASE_URL = DEPLOY_URL ?? `http://localhost:${PORT}`;
const RUNS = 3;

const pages = [
  { name: 'inicio', path: '/' },
  { name: 'detalhe', path: '/nft/emerald-ape-042' },
];

const profiles = [
  { name: 'mobile', config: undefined },
  { name: 'desktop', config: desktopConfig },
];

const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const metrics = {
  LCP: 'largest-contentful-paint',
  CLS: 'cumulative-layout-shift',
  TBT: 'total-blocking-time',
};

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);

  return sorted[Math.floor(sorted.length / 2)];
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // server still starting
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Preview server did not start at ${url}`);
}

// a headless Chrome target occasionally closes mid-run, so a failed run is retried once
async function audit(url, port, config) {
  try {
    return await lighthouse(url, { port, output: ['html', 'json'], logLevel: 'error' }, config);
  } catch {
    return lighthouse(url, { port, output: ['html', 'json'], logLevel: 'error' }, config);
  }
}

function summarize(lhr) {
  return {
    scores: Object.fromEntries(
      categories.map((id) => [id, Math.round(lhr.categories[id].score * 100)]),
    ),
    metrics: Object.fromEntries(
      Object.entries(metrics).map(([label, id]) => [label, lhr.audits[id].numericValue]),
    ),
  };
}

function formatMetric(label, value) {
  return label === 'CLS' ? value.toFixed(3) : `${Math.round(value)} ms`;
}

const preview = DEPLOY_URL
  ? null
  : spawn('yarn', ['preview', '--port', String(PORT), '--strictPort'], {
      cwd: path.join(ROOT, '..'),
      stdio: 'ignore',
    });

try {
  await waitForServer(BASE_URL);
  await mkdir(REPORTS_DIR, { recursive: true });

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] });
  const results = [];

  try {
    for (const page of pages) {
      for (const profile of profiles) {
        const runs = [];

        for (let index = 0; index < RUNS; index += 1) {
          const result = await audit(`${BASE_URL}${page.path}`, chrome.port, profile.config);
          runs.push({ lhr: result.lhr, report: result.report, ...summarize(result.lhr) });
          console.log(
            `${page.name} ${profile.name} #${index + 1}:`,
            JSON.stringify(summarize(result.lhr).scores),
          );
        }

        // the median run is the one whose performance score is the median of the three
        const medianScore = median(runs.map((run) => run.scores.performance));
        const medianRun = runs.find((run) => run.scores.performance === medianScore);
        const baseName = `${page.name}-${profile.name}`;

        await writeFile(path.join(REPORTS_DIR, `${baseName}.html`), medianRun.report[0]);
        await writeFile(path.join(REPORTS_DIR, `${baseName}.json`), medianRun.report[1]);

        results.push({
          page: page.name,
          url: page.path,
          profile: profile.name,
          scores: Object.fromEntries(
            categories.map((id) => [id, median(runs.map((run) => run.scores[id]))]),
          ),
          metrics: Object.fromEntries(
            Object.keys(metrics).map((label) => [
              label,
              median(runs.map((run) => run.metrics[label])),
            ]),
          ),
          runs: runs.map((run) => ({ scores: run.scores, metrics: run.metrics })),
        });
      }
    }

    const sample = results.length
      ? JSON.parse(await readFile(path.join(REPORTS_DIR, 'inicio-mobile.json'), 'utf8'))
      : null;
    const environment = {
      date: new Date().toISOString(),
      lighthouse: sample?.lighthouseVersion,
      chrome: sample?.environment?.hostUserAgent,
      node: process.version,
      os: `${os.type()} ${os.release()} (${os.arch()})`,
      cpu: os.cpus()[0]?.model,
      runsPerPage: RUNS,
      server: DEPLOY_URL
        ? `${DEPLOY_URL} (deploy), mocks ativos no cenário padrão`
        : 'vite preview do build de produção, mocks ativos no cenário padrão',
    };

    await writeFile(
      path.join(REPORTS_DIR, 'summary.json'),
      JSON.stringify({ environment, results }, null, 2),
    );

    const table = [
      '| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |',
      '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...results.map(
        (result) =>
          `| ${result.page} | ${result.profile} | ${categories.map((id) => result.scores[id]).join(' | ')} | ${Object.entries(
            result.metrics,
          )
            .map(([label, value]) => formatMetric(label, value))
            .join(' | ')} |`,
      ),
    ].join('\n');

    await writeFile(
      path.join(REPORTS_DIR, 'summary.md'),
      `# Lighthouse (mediana de ${RUNS} medições)\n\n${table}\n\n## Ambiente\n\n${Object.entries(
        environment,
      )
        .map(([key, value]) => `- **${key}:** ${value}`)
        .join('\n')}\n`,
    );

    console.log(`\n${table}`);
  } finally {
    await chrome.kill();
  }
} finally {
  preview?.kill();
}
