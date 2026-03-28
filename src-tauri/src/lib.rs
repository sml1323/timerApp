use std::{
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
    thread,
    time::Duration,
};

use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, PhysicalSize, Runtime, WindowEvent,
};
use tauri_plugin_sql::{Migration, MigrationKind};

const MAIN_WINDOW_LABEL: &str = "main";
const TRAY_ICON_ID: &str = "flow-tray";
const OPEN_MENU_ITEM_ID: &str = "open";
const QUIT_MENU_ITEM_ID: &str = "quit";
const MENU_WINDOW_WIDTH: u32 = 360;
const MENU_WINDOW_HEIGHT: u32 = 480;
const MENU_WINDOW_MARGIN: f64 = 12.0;
const MENU_WINDOW_VERTICAL_OFFSET: f64 = 12.0;
const TRAY_CLICK_GUARD_MS: u64 = 180;

#[tauri::command]
fn set_tray_title<R: Runtime>(app: AppHandle<R>, title: Option<String>) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        if let Some(tray) = app.tray_by_id(TRAY_ICON_ID) {
            tray.set_title(title.as_deref()).map_err(|error| error.to_string())?;
        }
    }

    #[cfg(not(target_os = "macos"))]
    let _ = (&app, &title);

    Ok(())
}

fn mark_tray_interaction(flag: &Arc<AtomicBool>) {
    flag.store(true, Ordering::Relaxed);

    let flag = Arc::clone(flag);
    thread::spawn(move || {
        thread::sleep(Duration::from_millis(TRAY_CLICK_GUARD_MS));
        flag.store(false, Ordering::Relaxed);
    });
}

fn position_menu_bar_window<R: Runtime>(
    window: &tauri::WebviewWindow<R>,
    anchor: PhysicalPosition<f64>,
) -> tauri::Result<()> {
    let window_size = window
        .outer_size()
        .unwrap_or(PhysicalSize::new(MENU_WINDOW_WIDTH, MENU_WINDOW_HEIGHT));

    let mut x = anchor.x - (window_size.width as f64 / 2.0);
    let mut y = anchor.y + MENU_WINDOW_VERTICAL_OFFSET;

    let monitor = window
        .monitor_from_point(anchor.x, anchor.y)?
        .or(window.current_monitor()?)
        .or(window.primary_monitor()?);

    if let Some(monitor) = monitor {
        let work_area = monitor.work_area();
        let min_x = work_area.position.x as f64 + MENU_WINDOW_MARGIN;
        let max_x = work_area.position.x as f64 + work_area.size.width as f64
            - window_size.width as f64
            - MENU_WINDOW_MARGIN;
        let min_y = work_area.position.y as f64 + MENU_WINDOW_MARGIN;
        let max_y = work_area.position.y as f64 + work_area.size.height as f64
            - window_size.height as f64
            - MENU_WINDOW_MARGIN;

        x = if max_x >= min_x {
            x.clamp(min_x, max_x)
        } else {
            min_x
        };

        y = if max_y >= min_y {
            y.clamp(min_y, max_y)
        } else {
            min_y
        };
    }

    window.set_position(PhysicalPosition::new(x.round() as i32, y.round() as i32))
}

fn show_menu_bar_window<R: Runtime>(
    app: &AppHandle<R>,
    anchor: Option<PhysicalPosition<f64>>,
) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return Ok(());
    };

    let _ = window.unminimize();

    if let Some(anchor) = anchor {
        let _ = position_menu_bar_window(&window, anchor);
    }

    window.show()?;
    window.set_focus()
}

fn toggle_menu_bar_window<R: Runtime>(
    app: &AppHandle<R>,
    anchor: Option<PhysicalPosition<f64>>,
) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return Ok(());
    };

    if window.is_visible().unwrap_or(false) {
        window.hide()?;
        return Ok(());
    }

    show_menu_bar_window(app, anchor)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let tray_click_guard = Arc::new(AtomicBool::new(false));
    let tray_click_guard_for_setup = Arc::clone(&tray_click_guard);
    let tray_click_guard_for_window = Arc::clone(&tray_click_guard);

    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../../src/db/migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_indexes",
            sql: include_str!("../../src/db/migrations/002_indexes.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "enforce_single_running_session",
            sql: include_str!("../../src/db/migrations/003_single_running_session_guard.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![set_tray_title])
        .on_window_event(move |window, event| {
            #[cfg(target_os = "macos")]
            if window.label() == MAIN_WINDOW_LABEL
                && matches!(event, WindowEvent::Focused(false))
                && !tray_click_guard_for_window.load(Ordering::Relaxed)
            {
                let _ = window.hide();
            }
        })
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            {
                app.handle()
                    .set_activation_policy(tauri::ActivationPolicy::Accessory)?;
                app.handle().set_dock_visibility(false)?;

                if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
                    let _ = window.hide();
                }

                let open_item = MenuItemBuilder::with_id(OPEN_MENU_ITEM_ID, "열기").build(app)?;
                let quit_item = MenuItemBuilder::with_id(QUIT_MENU_ITEM_ID, "종료").build(app)?;
                let tray_menu = MenuBuilder::new(app)
                    .items(&[&open_item, &quit_item])
                    .build()?;

                let tray_click_guard = Arc::clone(&tray_click_guard_for_setup);
                let mut tray_builder = TrayIconBuilder::with_id(TRAY_ICON_ID)
                    .tooltip("학습 집중 타이머")
                    .menu(&tray_menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id().as_ref() {
                        OPEN_MENU_ITEM_ID => {
                            let _ = show_menu_bar_window(app, None);
                        }
                        QUIT_MENU_ITEM_ID => app.exit(0),
                        _ => {}
                    })
                    .on_tray_icon_event(move |tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state,
                            rect,
                            ..
                        } = event
                        {
                            mark_tray_interaction(&tray_click_guard);

                            if matches!(button_state, MouseButtonState::Up) {
                                let pos: PhysicalPosition<f64> = rect.position.to_physical(1.0);
                                let size: PhysicalSize<f64> = rect.size.to_physical(1.0);
                                let anchor = PhysicalPosition::new(
                                    pos.x + (size.width as f64 / 2.0),
                                    pos.y + size.height as f64,
                                );
                                let _ = toggle_menu_bar_window(tray.app_handle(), Some(anchor));
                            }
                        }
                    });

                if let Some(icon) = app.default_window_icon().cloned() {
                    tray_builder = tray_builder.icon(icon).icon_as_template(true);
                }

                tray_builder.build(app)?;
            }

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:bmad_test.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
