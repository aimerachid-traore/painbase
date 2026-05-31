// ================================================================
//  build.js  —  Génère supabase.config.js depuis les variables
//  d'environnement Netlify. Lancé automatiquement avant chaque déploiement.
//  Les credentials ne sont JAMAIS dans git.
// ================================================================
const fs = require('fs');

const url     = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('❌  SUPABASE_URL ou SUPABASE_ANON_KEY manquant dans les variables Netlify.');
  console.error('    Ajoute-les dans : Netlify → Site settings → Environment variables');
  process.exit(1);
}

const content = `// Généré automatiquement par build.js — ne pas modifier ni committer
const SUPABASE_CONFIG = {
  url:     '${url}',
  anonKey: '${anonKey}'
};
`;

fs.writeFileSync('supabase.config.js', content);
console.log('✓ supabase.config.js généré depuis les variables d\'environnement');
