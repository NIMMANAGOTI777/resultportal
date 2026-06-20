import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = 'c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/);

const url = urlMatch[1].trim().replace(/['"]/g, '');
const key = keyMatch[1].trim().replace(/['"]/g, '');

async function fetchOpenApi() {
  console.log("Fetching OpenAPI spec from:", url);
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    fs.writeFileSync('scratch/openapi.json', JSON.stringify(data, null, 2));
    console.log("OpenAPI spec saved to scratch/openapi.json successfully.");
  } catch (error) {
    console.error("Error fetching OpenAPI spec:", error);
  }
}

fetchOpenApi();
