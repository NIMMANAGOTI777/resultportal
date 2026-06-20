import fs from 'fs';

const envPath = 'c:/Users/ADMIN/OneDrive/goal/Desktop/zphs/.env';
const envContent = fs.readFileSync(envPath, 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL\s*=\s*([^\r\n]+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*([^\r\n]+)/);

const url = urlMatch[1].trim().replace(/['"]/g, '');
const key = keyMatch[1].trim().replace(/['"]/g, '');

async function test() {
  const headersList = [
    { 'apikey': key },
    { 'apikey': key, 'Authorization': `Bearer ${key}` },
    { 'Authorization': `Bearer ${key}` }
  ];

  for (let i = 0; i < headersList.length; i++) {
    const headers = headersList[i];
    console.log(`Test ${i + 1} with headers:`, Object.keys(headers));
    try {
      const response = await fetch(`${url}/rest/v1/`, { headers });
      console.log(`Status: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Success! Tables count listed in OpenAPI definition:", Object.keys(data.definitions || {}).length);
        break;
      } else {
        const body = await response.text();
        console.log("Error response body:", body);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
  }
}

test();
