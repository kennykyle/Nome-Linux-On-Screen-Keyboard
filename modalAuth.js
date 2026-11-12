/* Nome - Onscreen Keyboard modal/auth policy helpers. */

import Clutter from 'gi://Clutter';

export const OSK_MODAL_HOVER_THROTTLE_US = 33000;

export function isAuthSessionModeName(mode, sessionMode = null) {
    if (mode === 'unlock-dialog' || mode === 'gdm')
        return true;
    try {
        if (sessionMode && (sessionMode.isGreeter || sessionMode.isLocked))
            return true;
        return !!(sessionMode
            && sessionMode.hasMode
            && sessionMode.hasMode('unlock-dialog')
            && mode === 'unlock-dialog');
    } catch (_e) {
        return false;
    }
}

export function isPointerLikeEventType(type) {
    return type === Clutter.EventType.BUTTON_PRESS
        || type === Clutter.EventType.BUTTON_RELEASE
        || type === Clutter.EventType.MOTION
        || type === Clutter.EventType.ENTER
        || type === Clutter.EventType.LEAVE
        || type === Clutter.EventType.SCROLL
        || type === Clutter.EventType.TOUCH_BEGIN
        || type === Clutter.EventType.TOUCH_END
        || type === Clutter.EventType.TOUCH_UPDATE
        || type === Clutter.EventType.TOUCH_CANCEL;
}

export function isPointerTrackingOnlyEventType(type) {
    return type === Clutter.EventType.MOTION
        || type === Clutter.EventType.ENTER
        || type === Clutter.EventType.LEAVE
        || type === Clutter.EventType.TOUCH_UPDATE;
}

// ---- touch helpers ----------------------------------------------------
//
// Nome treats a finger on a touchscreen exactly like the primary (left)
// mouse button.  A stylus already arrives as button events.

export function isTouchEventType(type) {
    return type === Clutter.EventType.TOUCH_BEGIN
        || type === Clutter.EventType.TOUCH_UPDATE
        || type === Clutter.EventType.TOUCH_END
        || type === Clutter.EventType.TOUCH_CANCEL;
}

// Button number of a press/release, with touch (and anything else that
// has no button) reported as 1.  clutter_event_get_button() only accepts
// button events and logs a critical for touch events, so never call it
// on those.
export function eventButton(event) {
    let type = null;
    try {
        type = event.type();
    } catch (_e) {
        return 1;
    }
    if (type !== Clutter.EventType.BUTTON_PRESS
        && type !== Clutter.EventType.BUTTON_RELEASE)
        return 1;
    try {
        return event.get_button() || 1;
    } catch (_e) {
        return 1;
    }
}

// Slot number identifying which finger a touch event belongs to, so a
// drag started by one finger is not moved or ended by another.  Returns
// null when unknown; callers then accept any finger.
export function touchSlot(event) {
    try {
        if (!isTouchEventType(event.type()))
            return null;
        const sequence = event.get_event_sequence();
        if (sequence && typeof sequence.get_slot === 'function')
            return sequence.get_slot();
    } catch (_e) {}
    return null;
}

// True when a touch event belongs to a different finger than `slot`.
export function isOtherFinger(event, slot) {
    if (slot === null || slot === undefined)
        return false;
    const eventSlot = touchSlot(event);
    return eventSlot !== null && eventSlot !== slot;
}

// How long a finger has to stay down to count as a long press, the
// touch version of a right-click.  Follows the desktop's setting.
export function longPressMs() {
    try {
        const ms = Clutter.Settings.get_default().long_press_duration;
        if (ms > 0)
            return ms;
    } catch (_e) {}
    return 500;
}
