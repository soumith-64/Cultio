import { NextRequest, NextResponse } from 'next/server';

/**
 * CULTIVO — Phone.Email OTP Verification API
 * Verifies the authenticated user_json_url returned by Phone.Email gateway
 * and extracts the verified country code and phone number.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_json_url } = body;

    if (!user_json_url || typeof user_json_url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid user_json_url' },
        { status: 400 }
      );
    }

    // Security check: ensure URL points to official phone.email authentication endpoint
    const parsedUrl = new URL(user_json_url);
    if (!parsedUrl.hostname.endsWith('phone.email')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized verification URL origin' },
        { status: 403 }
      );
    }

    // Fetch the authenticated JSON profile from phone.email
    const response = await fetch(user_json_url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to retrieve authenticated phone record: ${response.statusText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    
    // Extract authenticated parameters from phone.email JSON
    const countryCode = data.user_country_code || '+91';
    const rawPhone = data.user_phone_number || '';
    const fullPhone = `${countryCode} ${rawPhone}`.trim();
    const firstName = data.user_first_name || '';
    const lastName = data.user_last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const displayName = fullName || `Farmer ${rawPhone ? rawPhone.slice(-4) : 'User'}`;

    return NextResponse.json({
      success: true,
      phone: fullPhone,
      countryCode,
      phoneNumber: rawPhone,
      displayName,
    });
  } catch (err: any) {
    console.error('[PhoneVerify API] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during phone verification' },
      { status: 500 }
    );
  }
}
