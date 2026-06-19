import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT token and return complete user session state
 */
export async function verifyAuth(req) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('token')?.value;

    if (!token && req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });

    if (!user) return null;

    // নিরাপত্তা ও পারফরম্যান্সের জন্য সম্পূর্ণ ক্লিন অবজেক্ট রিটার্ন করা হচ্ছে
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role?.toLowerCase() || 'user',
      package: user.package || 'inactive',
      isPageConnected: user.isPageConnected || false,
      packageExpiresAt: user.packageExpiresAt || null,
      trialStartedAt: user.trialStartedAt || null,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Set auth cookies and inject subscription states into Client-side Session
 */
export async function setAuthCookies(user, isImpersonating = false) {
  const role = user.role?.toLowerCase() || 'user';
  
  // JWT টোকেনের ভেতরেও প্যাকেজ এবং কানেকশন ইনফো স্টোর করা হচ্ছে যেন মিডলওয়্যার দ্রুত রিড করতে পারে
  const token = jwt.sign(
    { 
      id: user._id.toString(), 
      email: user.email, 
      role: role, 
      package: user.package || 'inactive',
      isPageConnected: user.isPageConnected || false,
      isImpersonating 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  // ক্লায়েন্ট-সাইড বা ফ্রন্টএন্ড (AuthContext, Sidebar) এই অবজেক্টটি সরাসরি পাবে
  const userResponse = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: role,
    package: user.package || 'inactive',
    isPageConnected: user.isPageConnected || false,
    packageExpiresAt: user.packageExpiresAt || null,
    trialStartedAt: user.trialStartedAt || null,
    isImpersonating,
  };

  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  };

  // সিকিউরড সার্ভার টোকেন সেট
  cookieStore.set('token', token, cookieOptions);

  // এটি ফ্রন্টএন্ডে হাইড্রেশন এবং সাইডবার রেন্ডার করার জন্য উন্মুক্ত থাকবে (httpOnly: false)
  cookieStore.set('user', JSON.stringify(userResponse), {
    ...cookieOptions,
    httpOnly: false,
  });

  return token;
}

/**
 * Clear auth cookies
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
  cookieStore.delete('originalAdmin');
}