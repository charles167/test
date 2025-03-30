import { NextResponse } from 'next/server';

export const fetchChats = async () => {
  try {
    const res = await fetch('/api/chat/get');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return { success: false, message: 'Failed to fetch chats' };
  }
};
