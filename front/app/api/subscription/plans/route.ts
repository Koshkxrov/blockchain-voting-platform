import { NextResponse } from 'next/server';

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 9.99,
    duration: 'month',
    features: [
      'Create up to 5 voting sessions per month',
      'Vote in unlimited sessions',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 99.99,
    duration: 'year',
    features: [
      'Create unlimited voting sessions',
      'Vote in unlimited sessions',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access'
    ]
  }
];

export async function GET() {
  return NextResponse.json(SUBSCRIPTION_PLANS);
}
