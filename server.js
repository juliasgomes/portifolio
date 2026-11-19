import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const INDEX_PATH = path.join(__dirname, 'index.html');
const ADMIN_PASS = '290423';

app.use(express.json({ limit: '50mb' }));

let writeQueue = Promise.resolve();

function mutateEmbeddedProjects(mutator) {
  const run = async () => {
    const html = await fs.readFile(INDEX_PATH, 'utf8');
    const pattern = /(<script[^>]*id=["']embeddedProjectsData["'][^>]*>)([\s\S]*?)(<\/script>)/i;
    const match = html.match(pattern);
    if (!match) {
      throw new Error('Bloco embeddedProjectsData não encontrado em index.html');
    }
    const current = JSON.parse(match[2].trim() || '[]');
    const next = mutator(current);
    const version = String(Date.now());
    const serialized = JSON.stringify(next).replace(/<\/script/gi, '<\\/script');

    let updatedHtml = html.replace(pattern, (_m, openTag, _c, closeTag) => {
      const taggedOpen = /data-version=/i.test(openTag)
        ? openTag.replace(/data-version=["'][^"']*["']/i, `data-version="${version}"`)
        : openTag.replace(/>$/, ` data-version="${version}">`);
      return `${taggedOpen}${serialized}${closeTag}`;
    });

    updatedHtml = updatedHtml.replace(
      /(<div[^>]*id=["']projectsGrid["'][^>]*>)[\s\S]*?(<\/div>\s*<\/section>)/i,
      '$1$2'
    );

    await fs.writeFile(INDEX_PATH, updatedHtml, 'utf8');
    return { count: next.length, version };
  };

  const task = writeQueue.then(run, run);
  writeQueue = task.catch(() => {});
  return task;
}

app.post('/api/projects/upsert', async (req, res) => {
  try {
    const { password, project, keepExistingHtml, order } = req.body || {};
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Senha inválida' });
    if (!project || !project.id) return res.status(400).json({ error: 'Projeto inválido' });

    const result = await mutateEmbeddedProjects((list) => {
      const idx = list.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        const merged = { ...list[idx], ...project };
        if (keepExistingHtml || typeof project.html !== 'string') {
          merged.html = list[idx].html;
        }
        list[idx] = merged;
      } else {
        list.push(project);
      }

      if (Array.isArray(order) && order.length) {
        const map = new Map(list.map((p) => [p.id, p]));
        const ordered = [];
        for (const id of order) {
          if (map.has(id)) {
            ordered.push(map.get(id));
            map.delete(id);
          }
        }
        for (const p of map.values()) ordered.push(p);
        return ordered;
      }
      return list;
    });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Erro ao salvar projeto no index.html:', err);
    return res.status(500).json({ error: 'Falha ao gravar no index.html' });
  }
});

app.post('/api/projects/delete', async (req, res) => {
  try {
    const { password, id } = req.body || {};
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Senha inválida' });
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const result = await mutateEmbeddedProjects((list) => list.filter((p) => p.id !== id));
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Erro ao excluir projeto no index.html:', err);
    return res.status(500).json({ error: 'Falha ao gravar no index.html' });
  }
});

app.post('/api/projects/reorder', async (req, res) => {
  try {
    const { password, order } = req.body || {};
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Senha inválida' });
    if (!Array.isArray(order)) return res.status(400).json({ error: 'Ordem inválida' });

    const result = await mutateEmbeddedProjects((list) => {
      const map = new Map(list.map((p) => [p.id, p]));
      const ordered = [];
      for (const id of order) {
        if (map.has(id)) {
          ordered.push(map.get(id));
          map.delete(id);
        }
      }
      for (const p of map.values()) ordered.push(p);
      return ordered;
    });
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Erro ao reordenar projetos no index.html:', err);
    return res.status(500).json({ error: 'Falha ao gravar no index.html' });
  }
});

app.post('/api/save-projects', async (req, res) => {
  try {
    const { password, projects } = req.body || {};
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Senha inválida' });
    if (!Array.isArray(projects)) return res.status(400).json({ error: 'Lista de projetos inválida' });

    const result = await mutateEmbeddedProjects(() => projects);
    return res.json({ ok: true, ...result });
  } catch (err) {
    console.error('Erro ao salvar projetos no index.html:', err);
    return res.status(500).json({ error: 'Falha ao gravar no index.html' });
  }
});

app.use(express.static(__dirname, {
  setHeaders(res, filePath) {
    if (path.basename(filePath) === 'index.html') {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(INDEX_PATH);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

