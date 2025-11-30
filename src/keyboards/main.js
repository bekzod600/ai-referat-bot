import { Markup } from 'telegraf';

/**
 * Main menu keyboard
 */
export function mainMenuKeyboard() {
  return Markup.keyboard([
    ['📝 Referat', '🎯 Mustaqil ish'],
    ['🖼️ Slaydlar', '💰 Coin sotib olish'],
    ['👥 Referral', '📊 Balans']
  ]).resize();
}

/**
 * Back button keyboard
 */
export function backKeyboard() {
  return Markup.keyboard([
    ['⬅️ Orqaga']
  ]).resize();
}

/**
 * Page selection keyboard
 */
export function pageSelectionKeyboard() {
  return Markup.keyboard([
    ['6-8 (130 coin)', '9-10 (150 coin)'],
    ['11-15 (200 coin)'],
    ['⬅️ Orqaga']
  ]).resize();
}

/**
 * Format selection keyboard
 */
export function formatSelectionKeyboard() {
  return Markup.keyboard([
    ['📄 PDF', '📋 DOCX'],
    ['⬅️ Orqaga']
  ]).resize();
}

/**
 * Purchase keyboard
 */
export function purchaseKeyboard() {
  return Markup.keyboard([
    ['💰 Coin sotib olish'],
    ['⬅️ Orqaga']
  ]).resize();
}

export default {
  mainMenuKeyboard,
  backKeyboard,
  pageSelectionKeyboard,
  formatSelectionKeyboard,
  purchaseKeyboard,
};