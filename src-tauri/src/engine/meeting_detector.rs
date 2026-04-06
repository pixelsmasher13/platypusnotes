use std::collections::{HashMap, HashSet};
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use log::{debug, info, warn};
use sysinfo::System;
use tauri::{AppHandle, Manager};

/// Runtime toggle — set from settings, read by the detection loop.
pub static MEETING_DETECTION_ENABLED: AtomicBool = AtomicBool::new(false);

/// Don't re-notify for the same app within this window.
const NOTIFICATION_COOLDOWN: Duration = Duration::from_secs(300); // 5 minutes

/// Check if Zoom is in an active meeting.
/// CptHost is a process that only runs during an active Zoom meeting on macOS.
/// Important: "caphost" is a DIFFERENT process that runs whenever Zoom is open
/// (even without a meeting) — do NOT match it, or you get false positives.
fn is_zoom_in_meeting(system: &System) -> bool {
    for (_pid, process) in system.processes() {
        let name = process.name();
        if name == "CptHost" {
            debug!("Zoom active meeting process found: {}", name);
            return true;
        }
    }
    false
}

/// Check if Microsoft Teams is in an active meeting.
/// Teams keeps an audio.mojom.AudioService utility sub-process running at all
/// times, but its CPU usage is ~0% when idle and rises to 0.3-0.6%+ during a
/// call. We use a low threshold (0.2%) to distinguish meeting vs idle.
fn is_teams_in_meeting(system: &System) -> bool {
    let mut found_audio_service = false;
    let mut max_cpu: f32 = 0.0;

    for (_pid, process) in system.processes() {
        let cmd_joined = process.cmd().join(" ");
        if cmd_joined.contains("Microsoft Teams") && cmd_joined.contains("audio.mojom.AudioService") {
            let cpu = process.cpu_usage();
            found_audio_service = true;
            if cpu > max_cpu {
                max_cpu = cpu;
            }
            if cpu > 0.2 {
                debug!("Teams audio service CPU: {:.2}% → in meeting", cpu);
                return true;
            }
        }
    }

    if found_audio_service {
        debug!("Teams audio service idle (CPU {:.2}%)", max_cpu);
    }

    false
}

/// Number of consecutive "not detected" polls before we consider a meeting ended.
/// Prevents flapping when audio CPU briefly dips below threshold.
const LEAVE_GRACE_POLLS: u8 = 3;

struct MeetingDetector {
    system: System,
    previously_detected: HashSet<String>,
    /// Per-app cooldown tracking: app_name → last notification time
    cooldowns: HashMap<String, Instant>,
    /// Counts consecutive polls where a previously-detected app was NOT seen.
    /// Once this reaches LEAVE_GRACE_POLLS, we actually remove it.
    absent_counts: HashMap<String, u8>,
}

impl MeetingDetector {
    fn new() -> Self {
        Self {
            system: System::new_all(),
            previously_detected: HashSet::new(),
            cooldowns: HashMap::new(),
            absent_counts: HashMap::new(),
        }
    }

    /// Poll running processes. Returns newly-detected meeting app names
    /// (only those not already detected and not in cooldown).
    fn poll(&mut self) -> Vec<String> {
        self.system.refresh_processes();

        let mut current_raw: HashSet<String> = HashSet::new();

        if is_zoom_in_meeting(&self.system) {
            current_raw.insert("Zoom".to_string());
        }
        if is_teams_in_meeting(&self.system) {
            current_raw.insert("Microsoft Teams".to_string());
        }

        // Apply grace period: apps that were previously detected but aren't
        // in current_raw need to be absent for LEAVE_GRACE_POLLS consecutive
        // polls before we actually remove them.
        let mut current_meeting_apps = current_raw.clone();

        for app in &self.previously_detected {
            if !current_raw.contains(app) {
                let count = self.absent_counts.entry(app.clone()).or_insert(0);
                *count += 1;
                if *count < LEAVE_GRACE_POLLS {
                    debug!("{} not detected this poll ({}/{}), keeping in detected set",
                        app, count, LEAVE_GRACE_POLLS);
                    current_meeting_apps.insert(app.clone());
                } else {
                    info!("{} absent for {} polls, marking as left meeting", app, count);
                }
            }
        }

        // Clear absent counts for apps that ARE detected this poll
        for app in &current_raw {
            self.absent_counts.remove(app);
        }

        // Find apps that just entered a meeting (weren't detected in previous poll)
        let new_apps: Vec<String> = current_meeting_apps
            .difference(&self.previously_detected)
            .cloned()
            .collect();

        self.previously_detected = current_meeting_apps;

        // Filter out apps still in cooldown
        let now = Instant::now();
        let notifiable: Vec<String> = new_apps
            .into_iter()
            .filter(|app| {
                if let Some(last_time) = self.cooldowns.get(app) {
                    if now.duration_since(*last_time) < NOTIFICATION_COOLDOWN {
                        debug!("Skipping notification for {} (cooldown active)", app);
                        return false;
                    }
                }
                true
            })
            .collect();

        // Record cooldown for apps we're about to notify
        for app in &notifiable {
            self.cooldowns.insert(app.clone(), now);
        }

        notifiable
    }
}

/// Send a native macOS notification via osascript.
fn send_native_notification(app_name: &str) {
    let script = format!(
        r#"display notification "{} meeting detected — open Platypus to start recording" with title "Platypus""#,
        app_name
    );
    match Command::new("osascript").arg("-e").arg(&script).output() {
        Ok(_) => debug!("Native notification sent for {}", app_name),
        Err(e) => warn!("Failed to send native notification: {}", e),
    }
}

/// Spawns a background thread that polls for meeting processes and emits
/// events when a new meeting is detected. Call once from setup().
pub fn start_meeting_detection(app_handle: AppHandle) {
    std::thread::spawn(move || {
        info!("Meeting detection thread started");

        // Wait for the frontend to fully mount before polling,
        // otherwise the first event fires before the listener is ready.
        std::thread::sleep(Duration::from_secs(10));

        let mut detector = MeetingDetector::new();

        loop {
            if !MEETING_DETECTION_ENABLED.load(Ordering::Relaxed) {
                std::thread::sleep(Duration::from_secs(2));
                continue;
            }

            let new_apps = detector.poll();

            for app_name in &new_apps {
                info!("Meeting detected on: {}", app_name);

                // Native macOS notification
                send_native_notification(app_name);

                // In-app banner via frontend event
                if let Some(window) = app_handle.get_window("main") {
                    let _ = window.emit("meeting-detected", app_name.clone());
                }
            }

            std::thread::sleep(Duration::from_secs(5));
        }
    });
}
