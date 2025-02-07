import { google } from 'googleapis';
import { put } from '@vercel/blob';

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
    const pngImage = form.get('pngImage') as File;
    const rating = form.get('rating') as string;
    const id = form.get('id') || Date.now().toString() as string;

    // Upload to Vercel Blob
    const blob = await put(pngImage.name, pngImage, { 
      access: 'public',
      contentType: 'image/png'
    });

    // Save to Google Sheets
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:D',
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