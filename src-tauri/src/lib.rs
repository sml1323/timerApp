use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    AppHandle, Manager, Runtime,
};
use tauri_plugin_sql::{Migration, MigrationKind};

const MAIN_WINDOW_LABEL: &str = "main";
const TRAY_ICON_ID: &str = "flow-tray";
const OPEN_MENU_ITEM_ID: &str = "open";
const QUIT_MENU_ITEM_ID: &str = "quit";

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

fn show_window<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return Ok(());
    };
    let _ = window.unminimize();
    window.show()?;
    window.set_focus()
}

fn show_window_at_tray<R: Runtime>(
    app: &AppHandle<R>,
    position: tauri::PhysicalPosition<f64>,
) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        return Ok(());
    };
    let scale = window.scale_factor().unwrap_or(1.0);
    let win_size = window.outer_size().unwrap_or(tauri::PhysicalSize {
        width: 320,
        height: 420,
    });
    let x = (position.x / scale) - (win_size.width as f64 / scale / 2.0);
    let y = position.y / scale;
    let _ = window.set_position(tauri::LogicalPosition::new(x.max(0.0), y.max(0.0)));
    let _ = window.unminimize();
    window.show()?;
    window.set_focus()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
        .setup(move |app| {
            // Show window on launch
            if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
                let _ = window.show();
                let _ = window.set_focus();
            }

            #[cfg(target_os = "macos")]
            {
                // Keep in Dock so it behaves like a normal app
                // (not Accessory mode — window stays visible when losing focus)

                let open_item = MenuItemBuilder::with_id(OPEN_MENU_ITEM_ID, "열기").build(app)?;
                let quit_item = MenuItemBuilder::with_id(QUIT_MENU_ITEM_ID, "종료").build(app)?;
                let tray_menu = MenuBuilder::new(app)
                    .items(&[&open_item, &quit_item])
                    .build()?;

                let mut tray_builder = TrayIconBuilder::with_id(TRAY_ICON_ID)
                    .tooltip("학습 집중 타이머")
                    .menu(&tray_menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id().as_ref() {
                        OPEN_MENU_ITEM_ID => {
                            let _ = show_window(app);
                        }
                        QUIT_MENU_ITEM_ID => app.exit(0),
                        _ => {}
                    })
                    .on_tray_icon_event(move |tray, event| {
                        if let tauri::tray::TrayIconEvent::Click {
                            button: tauri::tray::MouseButton::Left,
                            button_state: tauri::tray::MouseButtonState::Up,
                            position,
                            ..
                        } = event
                        {
                            let _ = show_window_at_tray(tray.app_handle(), position);
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
