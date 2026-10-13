/**
 * ARIYAWARIN Blood Pressure Monitor - Browser Push Notification Service
 * Clinical Schedule:
 * - Morning Slot: 05:00 - 11:30 (ประเมินภาวะ Morning BP Surge ตามแนวทาง AHA/ESC)
 * - Evening Slot: 15:00 เป็นต้นไป (ประเมินความดันช่วงเย็นก่อนนอน)
 */

import { DailyBPRecord } from '../types/bp';

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  morningSlotEnabled: boolean; // 05:00 - 11:30
  eveningSlotEnabled: boolean; // 15:00+
  repeatIntervalMinutes: number; // 0 (once per slot), 30, 60
  quietHoursNight: boolean; // Suppress outside 05:00 - 23:00
}

export type TimeSlotType = 'morning' | 'evening' | 'afternoon' | 'night';

export interface TimeSlotStatus {
  currentSlot: TimeSlotType;
  isOptimalSlot: boolean;
  slotName: string;
  timeRangeLabel: string;
  isMorningCompleted: boolean;
  isEveningCompleted: boolean;
  isCurrentSlotDue: boolean; // Is current slot active and NOT yet recorded?
  nextUpcomingSlotName?: string;
  nextUpcomingSlotTime?: string;
}

const SETTINGS_STORAGE_KEY = 'ariyawarin_bp_notification_settings';
const LAST_NOTIFIED_KEY = 'ariyawarin_bp_notification_last_fired';
const SNOOZE_KEY = 'ariyawarin_bp_notification_snooze';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  morningSlotEnabled: true,
  eveningSlotEnabled: true,
  repeatIntervalMinutes: 60,
  quietHoursNight: true,
};

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission state
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request Notification Permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return Notification.permission;
  }
}

// Load settings from localStorage
export function loadNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading notification settings:', e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

// Save settings to localStorage
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving notification settings:', e);
  }
}

// Register service worker if available
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (error) {
    console.warn('Service worker registration failed (fallback to Notification API):', error);
    return null;
  }
}

/**
 * Determine the current clinical time slot
 * - Morning: 05:00 - 11:30 (300 - 690 mins)
 * - Afternoon: 11:31 - 14:59 (691 - 899 mins)
 * - Evening: 15:00 - 23:59 (900 - 1439 mins)
 * - Night: 00:00 - 04:59 (0 - 299 mins)
 */
export function getCurrentTimeSlot(date: Date = new Date()): {
  slot: TimeSlotType;
  slotName: string;
  timeRangeLabel: string;
  isOptimal: boolean;
} {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const MORNING_START = 5 * 60; // 05:00 = 300
  const MORNING_END = 11 * 60 + 30; // 11:30 = 690
  const EVENING_START = 15 * 60; // 15:00 = 900

  if (totalMinutes >= MORNING_START && totalMinutes <= MORNING_END) {
    return {
      slot: 'morning',
      slotName: 'รอบเช้า (Morning BP)',
      timeRangeLabel: '05:00 - 11:30 น.',
      isOptimal: true,
    };
  } else if (totalMinutes >= EVENING_START) {
    return {
      slot: 'evening',
      slotName: 'รอบเย็น/ก่อนนอน (Evening BP)',
      timeRangeLabel: '15:00 เป็นต้นไป',
      isOptimal: true,
    };
  } else if (totalMinutes > MORNING_END && totalMinutes < EVENING_START) {
    return {
      slot: 'afternoon',
      slotName: 'ช่วงบ่าย (พักผ่อน)',
      timeRangeLabel: '11:31 - 14:59 น.',
      isOptimal: false,
    };
  } else {
    return {
      slot: 'night',
      slotName: 'ช่วงกลางคืน (พักผ่อน)',
      timeRangeLabel: '00:00 - 04:59 น.',
      isOptimal: false,
    };
  }
}

/**
 * Helper to check if a record has completed morning readings
 */
export function hasCompletedMorningReading(record: DailyBPRecord | null | undefined): boolean {
  if (!record || !record.morning) return false;
  const r1 = record.morning.reading1;
  return Boolean(r1 && r1.sys > 0 && r1.dia > 0);
}

/**
 * Helper to check if a record has completed evening readings
 */
export function hasCompletedEveningReading(record: DailyBPRecord | null | undefined): boolean {
  if (!record || !record.evening) return false;
  const r1 = record.evening.reading1;
  return Boolean(r1 && r1.sys > 0 && r1.dia > 0);
}

/**
 * Calculate full status of today's schedule
 */
export function getScheduleStatus(
  todayRecord: DailyBPRecord | null | undefined,
  currentDate: Date = new Date()
): TimeSlotStatus {
  const current = getCurrentTimeSlot(currentDate);
  const isMorningCompleted = hasCompletedMorningReading(todayRecord);
  const isEveningCompleted = hasCompletedEveningReading(todayRecord);

  let isCurrentSlotDue = false;
  let nextUpcomingSlotName: string | undefined;
  let nextUpcomingSlotTime: string | undefined;

  if (current.slot === 'morning') {
    isCurrentSlotDue = !isMorningCompleted;
    nextUpcomingSlotName = 'รอบเย็น';
    nextUpcomingSlotTime = '15:00 น.';
  } else if (current.slot === 'evening') {
    isCurrentSlotDue = !isEveningCompleted;
    nextUpcomingSlotName = 'รอบเช้าวันพรุ่งนี้';
    nextUpcomingSlotTime = '05:00 น.';
  } else if (current.slot === 'afternoon') {
    isCurrentSlotDue = false;
    nextUpcomingSlotName = 'รอบเย็น';
    nextUpcomingSlotTime = '15:00 น.';
  } else {
    isCurrentSlotDue = false;
    nextUpcomingSlotName = 'รอบเช้า';
    nextUpcomingSlotTime = '05:00 น.';
  }

  return {
    currentSlot: current.slot,
    isOptimalSlot: current.isOptimal,
    slotName: current.slotName,
    timeRangeLabel: current.timeRangeLabel,
    isMorningCompleted,
    isEveningCompleted,
    isCurrentSlotDue,
    nextUpcomingSlotName,
    nextUpcomingSlotTime,
  };
}

/**
 * Gentle medical chime sound synthesized with Web Audio API.
 * Calm, pleasant dual harmonic frequencies (C5 523Hz -> E5 659Hz) with smooth fade-out.
 * Safe to call; handles browser autoplay policies gracefully.
 */
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const playTone = (freq: number, startTime: number, duration: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth envelope attack and exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    };

    // First note: 523.25 Hz (C5)
    playTone(523.25, now, 0.45, 0.25);
    // Harmonic note: 659.25 Hz (E5) slightly delayed
    playTone(659.25, now + 0.12, 0.55, 0.22);
    // Third high pleasant chime note: 783.99 Hz (G5)
    playTone(783.99, now + 0.24, 0.7, 0.18);
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}

/**
 * Snooze notifications for a given number of minutes
 */
export function snoozeNotifications(minutes: number = 30): void {
  try {
    const snoozeUntil = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(SNOOZE_KEY, snoozeUntil.toString());
  } catch (e) {
    console.error('Failed to set snooze:', e);
  }
}

/**
 * Check if notifications are currently snoozed
 */
export function isSnoozed(): boolean {
  try {
    const saved = localStorage.getItem(SNOOZE_KEY);
    if (saved) {
      const until = parseInt(saved, 10);
      if (!isNaN(until) && Date.now() < until) {
        return true;
      }
    }
  } catch (e) {
    console.error('Failed to read snooze:', e);
  }
  return false;
}

/**
 * Dispatch browser push notification
 */
export async function triggerBrowserNotification(
  title: string,
  body: string,
  options?: {
    tag?: string;
    sound?: boolean;
    requireInteraction?: boolean;
  }
): Promise<boolean> {
  const settings = loadNotificationSettings();
  if (options?.sound ?? settings.soundEnabled) {
    playChimeSound();
  }

  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions: NotificationOptions & { renotify?: boolean } = {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: options?.tag || 'ariyawarin-bp-alert',
    renotify: true,
    requireInteraction: options?.requireInteraction ?? false,
    silent: false,
    data: {
      url: window.location.href,
      timestamp: Date.now(),
    },
  };

  // Try service worker registration first for standard PWA push notification
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    }
  } catch (swError) {
    console.warn('SW notification failed, falling back to standard Notification:', swError);
  }

  // Fallback to standard Window Notification API
  try {
    const notification = new Notification(title, notificationOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch (nError) {
    console.error('Window Notification API error:', nError);
    return false;
  }
}

/**
 * Evaluates whether to trigger an alert for the current slot and triggers it if conditions are met.
 * Handles cooldowns, snoozes, and duplicate suppression.
 */
export async function checkAndDispatchBPAlert(
  todayRecord: DailyBPRecord | null | undefined,
  memberName: string = 'ผู้ใช้งาน',
  options?: {
    forceTest?: boolean;
    onInAppAlert?: (title: string, body: string, slot: TimeSlotType) => void;
  }
): Promise<{ triggered: boolean; reason: string }> {
  const settings = loadNotificationSettings();

  // If forceTest is set, dispatch immediately regardless of schedule
  if (options?.forceTest) {
    const testTitle = `🔔 ทดสอบระบบแจ้งเตือน ARIYAWARIN BP Monitor`;
    const testBody = `ถึงเวลาตรวจวัดความดันโลหิตของคุณ ${memberName}! กรุณานั่งพัก 5 นาทีเพื่อความแม่นยำตามเกณฑ์แพทย์สากล`;
    await triggerBrowserNotification(testTitle, testBody, { tag: 'ariyawarin-test-bp' });
    if (options?.onInAppAlert) {
      options.onInAppAlert(testTitle, testBody, 'morning');
    }
    return { triggered: true, reason: 'test_triggered' };
  }

  // Master toggle check
  if (!settings.enabled) {
    return { triggered: false, reason: 'notifications_disabled' };
  }

  // Snooze check
  if (isSnoozed()) {
    return { triggered: false, reason: 'currently_snoozed' };
  }

  const now = new Date();
  const schedule = getScheduleStatus(todayRecord, now);

  // Check if current slot is optimal and due
  if (!schedule.isOptimalSlot) {
    return { triggered: false, reason: 'outside_optimal_slots' };
  }

  // Morning Slot checks (05:00 - 11:30)
  if (schedule.currentSlot === 'morning') {
    if (!settings.morningSlotEnabled) {
      return { triggered: false, reason: 'morning_slot_disabled' };
    }
    if (schedule.isMorningCompleted) {
      return { triggered: false, reason: 'morning_already_completed' };
    }
  }

  // Evening Slot checks (15:00 onwards)
  if (schedule.currentSlot === 'evening') {
    if (!settings.eveningSlotEnabled) {
      return { triggered: false, reason: 'evening_slot_disabled' };
    }
    if (schedule.isEveningCompleted) {
      return { triggered: false, reason: 'evening_already_completed' };
    }
  }

  // Check cooldown / frequency
  const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const slotKey = `${todayDateStr}_${schedule.currentSlot}`;

  try {
    const rawLastFired = localStorage.getItem(LAST_NOTIFIED_KEY);
    const lastFiredMap: Record<string, number> = rawLastFired ? JSON.parse(rawLastFired) : {};
    const lastFiredTime = lastFiredMap[slotKey] || 0;
    const minutesSinceLastFired = (Date.now() - lastFiredTime) / (1000 * 60);

    const intervalAllowed =
      settings.repeatIntervalMinutes > 0 ? settings.repeatIntervalMinutes : 24 * 60; // 0 means once per day/slot

    if (lastFiredTime > 0 && minutesSinceLastFired < intervalAllowed) {
      return { triggered: false, reason: 'cooldown_active' };
    }

    // Trigger Notification!
    const title =
      schedule.currentSlot === 'morning'
        ? `🌅 แจ้งเตือนวัดความดันรอบเช้า (05:00 - 11:30 น.)`
        : `🌙 แจ้งเตือนวัดความดันรอบเย็น (15:00 เป็นต้นไป)`;

    const body =
      schedule.currentSlot === 'morning'
        ? `สวัสดีคุณ ${memberName} ถึงช่วงเวลาวัดความดันรอบเช้าแล้ว (ยังไม่ได้บันทึกผลวันนี้) กรุณานั่งพัก 5 นาทีและกดบันทึก`
        : `สวัสดีคุณ ${memberName} ถึงช่วงเวลาวัดความดันรอบเย็นแล้ว (ยังไม่ได้บันทึกผลวันนี้) กรุณานั่งพัก 5 นาทีและกดบันทึก`;

    const tag = `ariyawarin-${schedule.currentSlot}-${todayDateStr}`;

    await triggerBrowserNotification(title, body, {
      tag,
      sound: settings.soundEnabled,
      requireInteraction: true,
    });

    if (options?.onInAppAlert) {
      options.onInAppAlert(title, body, schedule.currentSlot);
    }

    // Update last fired timestamp
    lastFiredMap[slotKey] = Date.now();
    localStorage.setItem(LAST_NOTIFIED_KEY, JSON.stringify(lastFiredMap));

    return { triggered: true, reason: 'alert_dispatched' };
  } catch (error) {
    console.error('Error dispatching notification alert:', error);
    return { triggered: false, reason: 'error' };
  }
}
