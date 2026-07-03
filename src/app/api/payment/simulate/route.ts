import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams.toString();
  return NextResponse.redirect(new URL(`/payment/simulate?${searchParams}`, req.url));
}
