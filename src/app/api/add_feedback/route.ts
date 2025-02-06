import { google } from 'googleapis';
import { put } from '@vercel/blob';
import sharp from 'sharp';
// Google Sheets setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;

export async function PUT(request: Request) {
  try {
    const form = await request.formData();
    const svgCode = form.get('svgCode') as string;
    const rating = form.get('rating') as string;
    const id = form.get('id') || Date.now().toString() as string;
    
    if (!svgCode) {
      return Response.json({ error: 'No SVG code provided' }, { status: 400 });
    }

    // Convert SVG to PNG buffer using sharp
    const pngBuffer = await sharp(Buffer.from(svgCode))
      .png()
      .toBuffer();

    // Create a File object from the buffer
    const file = new File([pngBuffer], 'wireframe.png', { type: 'image/png' });

    // Upload to Vercel Blob
    const blob = await put(file.name, file, { 
      access: 'public',
      contentType: 'image/png'
    });

    // Save to Google Sheets
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:D', // Adjust range based on your sheet
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, id, blob.url, rating]],
      },
    });

    return Response.json({ 
      success: true, 
      url: blob.url,
      message: 'Image saved and feedback recorded' 
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 